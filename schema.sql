-- ============================================================================
-- 🏥 Clinic Management Platform — Multi-Tenant SaaS Schema (PostgreSQL 14+)
-- ============================================================================
-- Targets:
--   • Multi-market (multi-currency, multi-timezone)
--   • Patient receives messages only (no patient login) — token-based confirmation
--   • WhatsApp Cloud API as primary channel
--   • Multi-branch support
--   • Row-Level Security for tenant isolation
--   • Soft delete with proper unique-index handling
--   • Audit-friendly (HIPAA/GDPR-aware, Loi 09-08 Morocco)
-- ----------------------------------------------------------------------------
-- ROLE MODEL (4 roles, enforced at DB + application layer):
--   • super_admin   — platform owner; cross-tenant via fn_is_super_admin()
--   • clinic_admin  — clinic owner; manages subscription, billing, accounts;
--                     CREATES doctor and secretary accounts (capped: 2 doctors
--                     + 3 secretaries per clinic, enforced by trigger below)
--   • doctor        — clinical work (created by clinic_admin only)
--   • secretary     — appointments, follow-up calls (created by clinic_admin only)
-- ----------------------------------------------------------------------------
-- PAYMENT METHODS (current scope):
--   • cash, bank_wire only.
--   • cmi (Centre Monétique Interbancaire — Morocco) and stripe are FUTURE;
--     CHECK constraint includes them commented out so DDL doesn't need to
--     change when they're enabled — uncomment + redeploy.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- gen_random_uuid(), encryption
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- exclusion constraints
CREATE EXTENSION IF NOT EXISTS "citext";         -- case-insensitive text (emails)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- fuzzy search on names

-- ----------------------------------------------------------------------------
-- 1. Generic helper functions
-- ----------------------------------------------------------------------------

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get current tenant from session variable (set by application per request)
CREATE OR REPLACE FUNCTION fn_current_clinic_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_clinic_id', TRUE), '')::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get current user (for audit & RLS)
CREATE OR REPLACE FUNCTION fn_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Bypass flag for super-admin / cross-tenant reports
CREATE OR REPLACE FUNCTION fn_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(current_setting('app.is_super_admin', TRUE), 'false')::BOOLEAN;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Soft delete helper
CREATE OR REPLACE FUNCTION fn_soft_delete(p_table TEXT, p_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_clinic UUID := fn_current_clinic_id();
    v_sql    TEXT;
BEGIN
    IF v_clinic IS NULL AND NOT fn_is_super_admin() THEN
        RAISE EXCEPTION 'No tenant context set';
    END IF;

    v_sql := format(
        'UPDATE %I SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
        p_table
    );
    EXECUTE v_sql USING p_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;   -- SECURITY INVOKER (default) — respects RLS

-- Restore helper
CREATE OR REPLACE FUNCTION fn_restore(p_table TEXT, p_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_clinic UUID := fn_current_clinic_id();
    v_sql    TEXT;
BEGIN
    IF v_clinic IS NULL AND NOT fn_is_super_admin() THEN
        RAISE EXCEPTION 'No tenant context set';
    END IF;

    v_sql := format(
        'UPDATE %I SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
        p_table
    );
    EXECUTE v_sql USING p_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;   -- SECURITY INVOKER (default) — respects RLS

-- ============================================================================
-- 2. STAGE 1 — TENANTS (clinics, branches, sequences, users, doctors)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 Clinics (top-level tenant)
-- ----------------------------------------------------------------------------
CREATE TABLE clinics (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(255) NOT NULL,
    slug                    VARCHAR(100) UNIQUE NOT NULL,        -- url-friendly id
    phone                   VARCHAR(50),
    email                   CITEXT,
    address                 TEXT,
    city                    VARCHAR(100),
    country                 CHAR(2) NOT NULL DEFAULT 'MA',       -- ISO-3166-1 alpha-2
    postal_code             VARCHAR(20),
    logo_url                VARCHAR(500),
    license_number          VARCHAR(100),
    tax_number              VARCHAR(100),

    -- Localization (multi-market support)
    currency                CHAR(3) NOT NULL DEFAULT 'MAD',      -- ISO-4217
    timezone                VARCHAR(50) NOT NULL DEFAULT 'Africa/Casablanca',
    locale                  VARCHAR(10) NOT NULL DEFAULT 'ar-MA',
    date_format             VARCHAR(20) DEFAULT 'DD/MM/YYYY',

    -- Subscription
    subscription_plan       VARCHAR(50) DEFAULT 'free'
                            CHECK (subscription_plan IN ('free','basic','professional','enterprise')),
    subscription_status     VARCHAR(20) DEFAULT 'trial'
                            CHECK (subscription_status IN ('active','trial','expired','suspended','cancelled')),
    subscription_started_at TIMESTAMPTZ,
    subscription_expiry     DATE,
    max_users               INT DEFAULT 5,
    max_branches            INT DEFAULT 1,
    max_storage_mb          INT DEFAULT 500,
    storage_used_mb         INT DEFAULT 0,

    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    settings                JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX idx_clinics_active       ON clinics(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_clinics_subscription ON clinics(subscription_status, subscription_expiry) WHERE deleted_at IS NULL;
CREATE INDEX idx_clinics_country      ON clinics(country) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_clinics_updated_at BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ----------------------------------------------------------------------------
-- 2.2 Branches (multi-branch per clinic)
-- ----------------------------------------------------------------------------
CREATE TABLE branches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_name     VARCHAR(255) NOT NULL,
    branch_code     VARCHAR(50),
    is_main         BOOLEAN NOT NULL DEFAULT FALSE,
    phone           VARCHAR(50),
    email           CITEXT,
    address         TEXT,
    city            VARCHAR(100),
    country         CHAR(2),
    postal_code     VARCHAR(20),
    timezone        VARCHAR(50),                    -- overrides clinic if set
    working_hours   JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    settings        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_branches_code
    ON branches(clinic_id, branch_code)
    WHERE deleted_at IS NULL AND branch_code IS NOT NULL;

CREATE UNIQUE INDEX uq_branches_one_main
    ON branches(clinic_id)
    WHERE is_main = TRUE AND deleted_at IS NULL;

CREATE INDEX idx_branches_clinic ON branches(clinic_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ----------------------------------------------------------------------------
-- 2.3 Per-clinic numeric sequences (race-safe with row lock)
-- ----------------------------------------------------------------------------
CREATE TABLE clinic_sequences (
    clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    sequence_name VARCHAR(50) NOT NULL,
    prefix        VARCHAR(10),
    last_value    BIGINT NOT NULL DEFAULT 0,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (clinic_id, sequence_name)
);

-- Race-safe sequence allocator. Use SELECT fn_next_seq(...).
CREATE OR REPLACE FUNCTION fn_next_seq(
    p_clinic_id UUID,
    p_seq_name  VARCHAR
) RETURNS TEXT AS $$
DECLARE
    v_prefix   VARCHAR(10);
    v_value    BIGINT;
BEGIN
    -- INSERT ... ON CONFLICT then atomically increment with RETURNING
    INSERT INTO clinic_sequences (clinic_id, sequence_name, last_value)
        VALUES (p_clinic_id, p_seq_name, 1)
        ON CONFLICT (clinic_id, sequence_name)
        DO UPDATE SET last_value = clinic_sequences.last_value + 1,
                      updated_at = NOW()
        RETURNING prefix, last_value INTO v_prefix, v_value;

    RETURN COALESCE(v_prefix, '') || lpad(v_value::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2.4 Users (staff only — patients do NOT have accounts)
-- ----------------------------------------------------------------------------
-- Roles:
--   super_admin   — created via DB seed / artisan command; clinic_id may point
--                   to a "platform" clinic row, but RLS is bypassed for them
--                   via fn_is_super_admin().
--   clinic_admin  — clinic owner; exactly ONE per clinic (enforced by index).
--   doctor        — created by clinic_admin; max 2 per clinic (enforced by trigger).
--   secretary     — created by clinic_admin; max 3 per clinic (enforced by trigger).
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id                UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    primary_branch_id        UUID REFERENCES branches(id) ON DELETE SET NULL,
    first_name               VARCHAR(100) NOT NULL,
    last_name                VARCHAR(100) NOT NULL,
    email                    CITEXT NOT NULL,
    password_hash            VARCHAR(255) NOT NULL,
    phone                    VARCHAR(50),
    role                     VARCHAR(20) NOT NULL CHECK (role IN
                             ('super_admin','clinic_admin','doctor','secretary')),
    avatar_url               VARCHAR(500),
    is_active                BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified           BOOLEAN DEFAULT FALSE,
    email_verified_at        TIMESTAMPTZ,

    -- 2FA — secret encrypted by application before storing
    two_factor_enabled       BOOLEAN DEFAULT FALSE,
    two_factor_secret_enc    TEXT,            -- app-encrypted (e.g. AES-GCM via KMS)
    two_factor_recovery_enc  TEXT,

    last_login_at            TIMESTAMPTZ,
    last_login_ip            INET,
    failed_login_attempts    INT DEFAULT 0,
    locked_until             TIMESTAMPTZ,

    permissions              JSONB DEFAULT '{}'::jsonb,
    locale                   VARCHAR(10),

    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at               TIMESTAMPTZ
);

-- email is unique per clinic (a person can work at multiple clinics)
CREATE UNIQUE INDEX uq_users_email_per_clinic
    ON users(clinic_id, email)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_users_clinic ON users(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role   ON users(clinic_id, role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_branch ON users(primary_branch_id) WHERE deleted_at IS NULL;

-- Exactly one active clinic_admin per clinic
CREATE UNIQUE INDEX uq_users_one_clinic_admin
    ON users(clinic_id)
    WHERE role = 'clinic_admin' AND deleted_at IS NULL;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ----------------------------------------------------------------------------
-- 2.4.1 Enforce per-clinic account caps: max 2 doctors + 3 secretaries.
--       (clinic_admin is also capped at 1 via uq_users_one_clinic_admin above.)
--       Excludes soft-deleted rows so restoring is not blocked unnecessarily.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_enforce_user_role_caps()
RETURNS TRIGGER AS $$
DECLARE
    v_count INT;
    v_max   INT;
BEGIN
    -- Only re-check on rows that end up active and non-deleted with a capped role.
    IF NEW.deleted_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.role = 'doctor' THEN
        v_max := 2;
    ELSIF NEW.role = 'secretary' THEN
        v_max := 3;
    ELSE
        RETURN NEW;  -- super_admin and clinic_admin handled elsewhere
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM users
    WHERE clinic_id  = NEW.clinic_id
      AND role       = NEW.role
      AND deleted_at IS NULL
      AND id <> NEW.id;   -- exclude the row being updated

    IF v_count >= v_max THEN
        RAISE EXCEPTION
            'Account cap exceeded: clinic % already has % active % accounts (max %)',
            NEW.clinic_id, v_count, NEW.role, v_max
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_enforce_role_caps
    BEFORE INSERT OR UPDATE OF role, deleted_at, clinic_id ON users
    FOR EACH ROW EXECUTE FUNCTION fn_enforce_user_role_caps();

-- Many-to-many: a user can serve multiple branches
CREATE TABLE user_branches (
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id  UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, branch_id)
);

-- ----------------------------------------------------------------------------
-- 2.5 Doctor profiles
-- ----------------------------------------------------------------------------
CREATE TABLE doctor_profiles (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clinic_id                UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    specialty                VARCHAR(100),
    sub_specialty            VARCHAR(100),
    license_number           VARCHAR(100),
    license_expiry           DATE,
    license_document_url     VARCHAR(500),
    medical_school           VARCHAR(255),
    graduation_year          INT,
    board_certifications     JSONB DEFAULT '[]'::jsonb,
    languages_spoken         JSONB DEFAULT '[]'::jsonb,
    consultation_duration    INT NOT NULL DEFAULT 30 CHECK (consultation_duration > 0),
    consultation_fee         NUMERIC(12,2),
    follow_up_fee            NUMERIC(12,2),
    emergency_fee            NUMERIC(12,2),
    working_hours            JSONB DEFAULT '{}'::jsonb,
    max_daily_appointments   INT DEFAULT 20 CHECK (max_daily_appointments >= 0),
    accepts_new_patients     BOOLEAN DEFAULT TRUE,
    bio                      TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctor_profiles_clinic    ON doctor_profiles(clinic_id);
CREATE INDEX idx_doctor_profiles_specialty ON doctor_profiles(specialty);

CREATE TRIGGER trg_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 3. STAGE 2 — PATIENTS
-- ============================================================================

CREATE TABLE patients (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id                   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id                   UUID REFERENCES branches(id) ON DELETE SET NULL,
    patient_code                VARCHAR(50),
    first_name                  VARCHAR(100) NOT NULL,
    last_name                   VARCHAR(100) NOT NULL,
    date_of_birth               DATE,
    -- age is computed in views (see views section). NOT a generated column.
    gender                      VARCHAR(10) CHECK (gender IN ('male','female','other')),
    phone                       VARCHAR(50),
    phone_e164                  VARCHAR(20),         -- normalized for WhatsApp
    alternative_phone           VARCHAR(50),
    email                       CITEXT,
    address                     TEXT,
    city                        VARCHAR(100),
    state                       VARCHAR(100),
    country                     CHAR(2),
    postal_code                 VARCHAR(20),
    national_id                 VARCHAR(100),
    passport_number             VARCHAR(100),
    blood_type                  VARCHAR(5) CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    marital_status              VARCHAR(20),
    occupation                  VARCHAR(200),
    insurance_number            VARCHAR(100),
    insurance_company           VARCHAR(200),
    insurance_expiry            DATE,
    insurance_type              VARCHAR(50),
    emergency_contact_name      VARCHAR(200),
    emergency_contact_phone     VARCHAR(50),
    emergency_contact_relation  VARCHAR(100),
    allergies                   TEXT,
    chronic_diseases            TEXT,
    current_medications         TEXT,
    family_history              TEXT,
    surgical_history            TEXT,
    smoking_status              VARCHAR(20),
    alcohol_consumption         VARCHAR(20),
    profile_picture_url         VARCHAR(500),
    notes                       TEXT,
    is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
    registration_date           DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by                  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_patients_code
    ON patients(clinic_id, patient_code)
    WHERE deleted_at IS NULL AND patient_code IS NOT NULL;

CREATE UNIQUE INDEX uq_patients_national_id
    ON patients(clinic_id, national_id)
    WHERE deleted_at IS NULL AND national_id IS NOT NULL;

CREATE INDEX idx_patients_clinic ON patients(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_branch ON patients(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_phone  ON patients(phone_e164) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_name_trgm
    ON patients USING gin ((first_name || ' ' || last_name) gin_trgm_ops)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- View with computed age
CREATE OR REPLACE VIEW v_patients AS
SELECT p.*,
       CASE WHEN date_of_birth IS NOT NULL
            THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))::INT
       END AS age
FROM patients p
WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- 3.1 Patient communication preferences
-- ----------------------------------------------------------------------------
CREATE TABLE patient_communication_preferences (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id                      UUID UNIQUE NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id                       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    reminder_enabled                BOOLEAN DEFAULT TRUE,
    reminder_before_hours           INT DEFAULT 24 CHECK (reminder_before_hours BETWEEN 1 AND 168),
    preferred_channel               VARCHAR(20) DEFAULT 'whatsapp'
                                    CHECK (preferred_channel IN ('whatsapp','email','sms','phone_call')),
    whatsapp_enabled                BOOLEAN DEFAULT TRUE,
    email_enabled                   BOOLEAN DEFAULT TRUE,
    sms_enabled                     BOOLEAN DEFAULT FALSE,
    phone_call_enabled              BOOLEAN DEFAULT TRUE,
    receive_invoice                 BOOLEAN DEFAULT TRUE,
    receive_prescription            BOOLEAN DEFAULT TRUE,
    receive_lab_results             BOOLEAN DEFAULT TRUE,
    receive_appointment_reminder    BOOLEAN DEFAULT TRUE,
    -- GDPR explicit consent tracking
    consent_marketing               BOOLEAN DEFAULT FALSE,
    consent_marketing_at            TIMESTAMPTZ,
    consent_data_processing         BOOLEAN DEFAULT FALSE,
    consent_data_processing_at      TIMESTAMPTZ,
    language                        VARCHAR(10) DEFAULT 'ar',
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_comm_prefs_clinic ON patient_communication_preferences(clinic_id);

CREATE TRIGGER trg_patient_comm_prefs_updated_at
    BEFORE UPDATE ON patient_communication_preferences
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Auto-create default prefs on patient insert
CREATE OR REPLACE FUNCTION fn_create_default_patient_prefs()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO patient_communication_preferences (patient_id, clinic_id)
        VALUES (NEW.id, NEW.clinic_id)
        ON CONFLICT (patient_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_patients_default_prefs
    AFTER INSERT ON patients
    FOR EACH ROW EXECUTE FUNCTION fn_create_default_patient_prefs();

-- ----------------------------------------------------------------------------
-- 3.2 Vital signs (was in summary but missing in original schema)
-- ----------------------------------------------------------------------------
CREATE TABLE vital_signs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id      UUID,                  -- FK added after appointments table
    recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    temperature_c       NUMERIC(4,1),
    blood_pressure_sys  INT,
    blood_pressure_dia  INT,
    heart_rate          INT,
    respiratory_rate    INT,
    oxygen_saturation   NUMERIC(4,1),
    blood_glucose       NUMERIC(5,1),
    weight_kg           NUMERIC(5,2),
    height_cm           NUMERIC(5,1),
    bmi                 NUMERIC(5,2) GENERATED ALWAYS AS (
                            CASE
                                WHEN weight_kg IS NOT NULL
                                 AND height_cm IS NOT NULL
                                 AND height_cm > 0
                                THEN ROUND(weight_kg / POWER(height_cm / 100.0, 2), 2)
                            END
                        ) STORED,
    pain_score          INT CHECK (pain_score BETWEEN 0 AND 10),
    notes               TEXT,
    recorded_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_vital_signs_patient ON vital_signs(patient_id, recorded_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_vital_signs_clinic  ON vital_signs(clinic_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- 4. STAGE 3 — APPOINTMENTS
-- ============================================================================

CREATE TABLE appointments (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id                   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id                   UUID REFERENCES branches(id) ON DELETE SET NULL,
    patient_id                  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id                   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    secretary_id                UUID REFERENCES users(id) ON DELETE SET NULL,
    appointment_number          VARCHAR(50),

    -- All times stored as TIMESTAMPTZ. Application sends in clinic timezone.
    scheduled_start             TIMESTAMPTZ NOT NULL,
    scheduled_end               TIMESTAMPTZ NOT NULL,
    duration_minutes            INT GENERATED ALWAYS AS
                                (EXTRACT(EPOCH FROM (scheduled_end - scheduled_start))::INT / 60) STORED,
    -- Convenience day field for indexing/reporting (computed in clinic TZ on app side recommended)
    appointment_day             DATE NOT NULL,

    status                      VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN
                                ('scheduled','confirmed','arrived','in_progress',
                                 'completed','cancelled','no_show','rescheduled')),
    type                        VARCHAR(50) CHECK (type IN
                                ('consultation','follow_up','emergency','routine_checkup',
                                 'vaccination','procedure','lab_test','tele_consultation','home_visit')),
    priority                    VARCHAR(20) DEFAULT 'normal'
                                CHECK (priority IN ('low','normal','high','emergency')),
    reason                      TEXT,
    cancelled_reason            TEXT,
    cancelled_at                TIMESTAMPTZ,
    cancelled_by                UUID REFERENCES users(id) ON DELETE SET NULL,
    rescheduled_from            UUID REFERENCES appointments(id) ON DELETE SET NULL,

    -- Confirmation lifecycle
    confirmation_status         VARCHAR(30) DEFAULT 'pending' CHECK (confirmation_status IN
                                ('pending','reminder_sent','delivered','seen',
                                 'confirmed_by_patient','confirmed_by_call',
                                 'declined','no_response')),
    confirmation_at             TIMESTAMPTZ,
    confirmation_method         VARCHAR(20) CHECK (confirmation_method IN
                                ('whatsapp','email','sms','phone_call','manual','auto')),

    -- Token for patient to confirm via link (no login needed)
    confirmation_token          VARCHAR(64) UNIQUE,
    confirmation_token_expires  TIMESTAMPTZ,

    -- Secretary follow-up workflow
    needs_follow_up_call        BOOLEAN DEFAULT FALSE,
    follow_up_call_status       VARCHAR(20) CHECK (follow_up_call_status IN
                                ('pending','in_progress','completed','no_answer','wrong_number','rescheduled')),
    follow_up_call_at           TIMESTAMPTZ,
    follow_up_call_by           UUID REFERENCES users(id) ON DELETE SET NULL,
    follow_up_call_notes        TEXT,
    follow_up_call_attempts     INT NOT NULL DEFAULT 0,
    max_follow_up_attempts      INT NOT NULL DEFAULT 3,
    last_follow_up_attempt_at   TIMESTAMPTZ,

    -- Visit data
    chief_complaint             TEXT,
    present_illness             TEXT,
    medical_history_notes       TEXT,
    physical_examination        TEXT,
    diagnosis                   TEXT,
    differential_diagnosis      TEXT,
    treatment_plan              TEXT,
    follow_up_notes             TEXT,
    follow_up_date              DATE,

    consultation_fee            NUMERIC(12,2),
    currency                    CHAR(3),                -- snapshot from clinic at booking time
    is_free                     BOOLEAN DEFAULT FALSE,

    -- Document delivery flags
    invoice_sent                BOOLEAN DEFAULT FALSE,
    invoice_sent_at             TIMESTAMPTZ,
    invoice_sent_via            VARCHAR(20) CHECK (invoice_sent_via IN ('whatsapp','email','sms','manual')),
    prescription_sent           BOOLEAN DEFAULT FALSE,
    prescription_sent_at        TIMESTAMPTZ,
    prescription_sent_via       VARCHAR(20) CHECK (prescription_sent_via IN ('whatsapp','email','sms','manual')),
    lab_results_sent            BOOLEAN DEFAULT FALSE,
    lab_results_sent_at         TIMESTAMPTZ,

    notes                       TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ,

    CHECK (scheduled_end > scheduled_start)
);

CREATE UNIQUE INDEX uq_appointments_number
    ON appointments(clinic_id, appointment_number)
    WHERE deleted_at IS NULL AND appointment_number IS NOT NULL;

CREATE INDEX idx_appointments_clinic        ON appointments(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_branch        ON appointments(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_patient       ON appointments(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_doctor_date   ON appointments(doctor_id, appointment_day) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_day           ON appointments(clinic_id, appointment_day) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_status        ON appointments(clinic_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_confirmation  ON appointments(confirmation_status, scheduled_start)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_followup      ON appointments(needs_follow_up_call, follow_up_call_status)
    WHERE needs_follow_up_call = TRUE AND deleted_at IS NULL;

-- 🚫 Prevent overlapping appointments for the same doctor (active ones only)
ALTER TABLE appointments
    ADD CONSTRAINT excl_doctor_no_overlap
    EXCLUDE USING gist (
        doctor_id WITH =,
        tstzrange(scheduled_start, scheduled_end, '[)') WITH &&
    ) WHERE (status NOT IN ('cancelled','no_show','rescheduled') AND deleted_at IS NULL);

CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Now add the deferred FK from vital_signs.appointment_id
ALTER TABLE vital_signs
    ADD CONSTRAINT fk_vital_signs_appointment
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- ============================================================================
-- 5. STAGE 4 — MEDICATIONS & PRESCRIPTIONS
-- ============================================================================

CREATE TABLE medications (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id               UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    trade_name              VARCHAR(255) NOT NULL,
    generic_name            VARCHAR(255),
    form                    VARCHAR(100) CHECK (form IN
                            ('tablet','capsule','syrup','injection','cream','drops',
                             'inhaler','spray','gel','suppository','other')),
    strength                VARCHAR(100),
    manufacturer            VARCHAR(255),
    category                VARCHAR(100),
    atc_code                VARCHAR(20),
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    requires_prescription   BOOLEAN DEFAULT TRUE,
    side_effects            TEXT,
    contraindications       TEXT,
    storage_instructions    TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX idx_medications_clinic ON medications(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_medications_trade_trgm ON medications USING gin (trade_name gin_trgm_ops) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_medications_updated_at BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE drug_interactions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id_1  UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    medication_id_2  UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    severity         VARCHAR(20) NOT NULL CHECK (severity IN ('major','moderate','minor')),
    interaction_type VARCHAR(100),
    description      TEXT,
    recommendation   TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (medication_id_1 < medication_id_2),
    UNIQUE (medication_id_1, medication_id_2)
);

CREATE TABLE prescriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    prescription_number VARCHAR(50) NOT NULL,
    appointment_id      UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    prescription_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date         DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN
                        ('draft','active','completed','discontinued','cancelled','expired')),
    diagnosis_related   TEXT,
    notes               TEXT,
    is_printed          BOOLEAN DEFAULT FALSE,
    printed_at          TIMESTAMPTZ,
    printed_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    is_dispensed        BOOLEAN DEFAULT FALSE,
    dispensed_at        TIMESTAMPTZ,
    dispensed_by        VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_prescriptions_number
    ON prescriptions(clinic_id, prescription_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_prescriptions_appointment ON prescriptions(appointment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_prescriptions_patient     ON prescriptions(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_prescriptions_clinic      ON prescriptions(clinic_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Structured dosage fields (no more free-text duration math)
CREATE TABLE prescription_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id   UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_id     UUID NOT NULL REFERENCES medications(id) ON DELETE RESTRICT,
    dosage            VARCHAR(255) NOT NULL,           -- e.g. "500mg"
    frequency_per_day INT,                             -- e.g. 3
    interval_hours    INT,                             -- e.g. 8
    frequency_text    VARCHAR(255),                    -- free-text override if needed
    duration_days     INT,                             -- structured duration
    route             VARCHAR(100) CHECK (route IN
                      ('oral','topical','intravenous','intramuscular','subcutaneous',
                       'sublingual','rectal','inhalation','ophthalmic','otic')),
    instructions      TEXT,
    quantity          INT,
    unit              VARCHAR(50),
    refills           INT NOT NULL DEFAULT 0,
    start_date        DATE,
    -- end_date computed in app or via view
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);

CREATE OR REPLACE VIEW v_prescription_items AS
SELECT pi.*,
       CASE WHEN start_date IS NOT NULL AND duration_days IS NOT NULL
            THEN start_date + (duration_days || ' days')::INTERVAL
       END AS end_date
FROM prescription_items pi;

-- ============================================================================
-- 6. STAGE 5 — LAB ORDERS
-- ============================================================================

CREATE TABLE external_labs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    lab_name        VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(200),
    phone           VARCHAR(50),
    email           CITEXT,
    address         TEXT,
    website         VARCHAR(255),
    api_endpoint    VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_external_labs_clinic ON external_labs(clinic_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_external_labs_updated_at BEFORE UPDATE ON external_labs
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE lab_orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    lab_order_number    VARCHAR(50),
    appointment_id      UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    external_lab_id     UUID REFERENCES external_labs(id) ON DELETE SET NULL,
    order_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN
                        ('draft','pending','sample_collected','in_progress',
                         'completed','partially_completed','cancelled','rejected')),
    urgency             VARCHAR(20) NOT NULL DEFAULT 'routine'
                        CHECK (urgency IN ('routine','urgent','stat')),
    fasting_required    BOOLEAN DEFAULT FALSE,
    clinical_diagnosis  TEXT,
    notes               TEXT,
    completed_at        TIMESTAMPTZ,
    reviewed_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_lab_orders_number
    ON lab_orders(clinic_id, lab_order_number)
    WHERE deleted_at IS NULL AND lab_order_number IS NOT NULL;

CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_lab_orders_clinic  ON lab_orders(clinic_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_lab_orders_updated_at BEFORE UPDATE ON lab_orders
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE lab_order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id        UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    test_code           VARCHAR(50),
    test_name           VARCHAR(255) NOT NULL,
    test_category       VARCHAR(100),
    specimen_type       VARCHAR(100),
    result              TEXT,
    result_date         DATE,
    result_status       VARCHAR(20) DEFAULT 'pending' CHECK (result_status IN
                        ('pending','normal','abnormal','critical','inconclusive')),
    normal_range        VARCHAR(255),
    normal_range_min    NUMERIC(12,2),
    normal_range_max    NUMERIC(12,2),
    is_abnormal         BOOLEAN,
    is_critical         BOOLEAN DEFAULT FALSE,
    unit                VARCHAR(50),
    methodology         VARCHAR(100),
    attachment_url      VARCHAR(500),
    notes               TEXT,
    reviewed_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lab_order_items_order ON lab_order_items(lab_order_id);

-- ============================================================================
-- 7. STAGE 6 — INVOICES, PAYMENTS, EXPENSES, VENDORS
-- ============================================================================

CREATE TABLE invoices (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id                       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id                       UUID REFERENCES branches(id) ON DELETE SET NULL,
    patient_id                      UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    appointment_id                  UUID REFERENCES appointments(id) ON DELETE SET NULL,
    invoice_number                  VARCHAR(50) NOT NULL,
    invoice_date                    DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date                        DATE,
    currency                        CHAR(3) NOT NULL,                        -- snapshot
    subtotal                        NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_percentage             NUMERIC(5,2) DEFAULT 0,
    discount_amount                 NUMERIC(12,2) DEFAULT 0,
    tax_percentage                  NUMERIC(5,2) DEFAULT 0,
    tax_amount                      NUMERIC(12,2) GENERATED ALWAYS AS
                                    (ROUND((subtotal - COALESCE(discount_amount,0)) * COALESCE(tax_percentage,0) / 100, 2)) STORED,
    -- total is fully derived: subtotal − discount + tax
    total                           NUMERIC(12,2) GENERATED ALWAYS AS (
                                        subtotal
                                        - COALESCE(discount_amount, 0)
                                        + ROUND(
                                            (subtotal - COALESCE(discount_amount, 0))
                                            * COALESCE(tax_percentage, 0) / 100,
                                          2)
                                    ) STORED,
    paid_amount                     NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due                     NUMERIC(12,2) GENERATED ALWAYS AS (total - paid_amount) STORED,
    status                          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN
                                    ('draft','pending','paid','partially_paid',
                                     'overdue','cancelled','refunded','collections')),
    payment_terms                   VARCHAR(100),
    payment_method                  VARCHAR(50),
    insurance_claim_number          VARCHAR(100),
    insurance_coverage_percentage   NUMERIC(5,2),
    insurance_approved_amount       NUMERIC(12,2),
    patient_responsibility          NUMERIC(12,2),
    notes                           TEXT,
    created_by                      UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by                     UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at                     TIMESTAMPTZ,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                      TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_invoices_number
    ON invoices(clinic_id, invoice_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_invoices_clinic  ON invoices(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_patient ON invoices(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_status  ON invoices(clinic_id, status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE invoice_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id              UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type               VARCHAR(50) NOT NULL CHECK (item_type IN
                            ('consultation','procedure','lab_test','imaging',
                             'medication','vaccination','supplies','other')),
    description             VARCHAR(500) NOT NULL,
    code                    VARCHAR(50),
    quantity                NUMERIC(12,2) NOT NULL DEFAULT 1,
    unit_price              NUMERIC(12,2) NOT NULL,
    discount_percentage     NUMERIC(5,2) DEFAULT 0,
    discount_amount         NUMERIC(12,2) DEFAULT 0,
    total_price             NUMERIC(12,2) GENERATED ALWAYS AS
                            ((quantity * unit_price) - COALESCE(discount_amount,0)) STORED,
    -- Guard: discount_percentage and discount_amount are mutually exclusive
    CONSTRAINT chk_invoice_items_one_discount
        CHECK (NOT (COALESCE(discount_percentage, 0) > 0
                    AND COALESCE(discount_amount, 0) > 0)),
    is_insurance_covered    BOOLEAN DEFAULT FALSE,
    reference_type          VARCHAR(50),
    reference_id            UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    payment_number  VARCHAR(50),
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency        CHAR(3) NOT NULL,
    payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Current scope: cash + bank_wire only.
    -- Future: uncomment 'cmi' and 'stripe' when the corresponding gateway
    -- implementations are wired up in the application layer.
    payment_method  VARCHAR(50) NOT NULL CHECK (payment_method IN
                    ('cash','bank_wire'
                     -- ,'cmi'      -- TODO: enable when CmiGateway is implemented
                     -- ,'stripe'   -- TODO: enable when StripeGateway is implemented
                    )),
    payment_status  VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN
                    ('pending','completed','failed','refunded','reversed')),
    reference_number VARCHAR(255),
    transaction_id  VARCHAR(255),
    card_last_four  VARCHAR(4),
    bank_name       VARCHAR(255),
    check_number    VARCHAR(100),
    check_date      DATE,
    notes           TEXT,
    received_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_payments_number
    ON payments(clinic_id, payment_number)
    WHERE deleted_at IS NULL AND payment_number IS NOT NULL;

CREATE INDEX idx_payments_invoice ON payments(invoice_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_clinic  ON payments(clinic_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Keep invoices.paid_amount in sync whenever a payment is inserted/updated/deleted
CREATE OR REPLACE FUNCTION fn_sync_invoice_paid_amount()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_id UUID;
    v_total_paid NUMERIC(12,2);
BEGIN
    -- Identify which invoice was affected
    v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

    SELECT COALESCE(SUM(amount), 0)
    INTO   v_total_paid
    FROM   payments
    WHERE  invoice_id    = v_invoice_id
      AND  deleted_at    IS NULL
      AND  payment_status = 'completed';

    UPDATE invoices
       SET paid_amount = v_total_paid
     WHERE id          = v_invoice_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payments_sync_invoice
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION fn_sync_invoice_paid_amount();

CREATE TABLE vendors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    vendor_name     VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(200),
    phone           VARCHAR(50),
    email           CITEXT,
    address         TEXT,
    website         VARCHAR(255),
    tax_number      VARCHAR(100),
    category        VARCHAR(100),
    payment_terms   VARCHAR(100),
    bank_account    VARCHAR(255),
    notes           TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_vendors_clinic ON vendors(clinic_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE expenses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id           UUID REFERENCES branches(id) ON DELETE SET NULL,
    expense_number      VARCHAR(50),
    expense_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    category            VARCHAR(100) NOT NULL CHECK (category IN
                        ('rent','utilities','salaries','supplies','equipment',
                         'maintenance','marketing','insurance','taxes','licenses',
                         'training','travel','miscellaneous')),
    description         TEXT,
    amount              NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    currency            CHAR(3) NOT NULL,
    payment_method      VARCHAR(50),
    payment_status      VARCHAR(20) DEFAULT 'pending'
                        CHECK (payment_status IN ('pending','paid','cancelled')),
    paid_date           DATE,
    paid_to             VARCHAR(255),
    vendor_id           UUID REFERENCES vendors(id) ON DELETE SET NULL,
    is_recurring        BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN
                        ('daily','weekly','monthly','quarterly','yearly')),
    recurring_end_date  DATE,
    attachment_url      VARCHAR(500),
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_expenses_number
    ON expenses(clinic_id, expense_number)
    WHERE deleted_at IS NULL AND expense_number IS NOT NULL;

CREATE INDEX idx_expenses_clinic ON expenses(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_date   ON expenses(clinic_id, expense_date) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 8. STAGE 7 — INVENTORY
-- ============================================================================

CREATE TABLE inventory (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id               UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id               UUID REFERENCES branches(id) ON DELETE SET NULL,
    medication_id           UUID REFERENCES medications(id) ON DELETE SET NULL,
    item_code               VARCHAR(100),
    item_name               VARCHAR(255) NOT NULL,
    category                VARCHAR(100) NOT NULL CHECK (category IN
                            ('medication','supplies','equipment','office_supplies')),
    batch_number            VARCHAR(100),
    serial_number           VARCHAR(100),
    expiration_date         DATE,
    quantity_in_stock       NUMERIC(12,2) NOT NULL DEFAULT 0,
    min_stock_level         NUMERIC(12,2) NOT NULL DEFAULT 5,
    max_stock_level         NUMERIC(12,2),
    reorder_point           NUMERIC(12,2),
    unit                    VARCHAR(50),
    purchase_price          NUMERIC(12,2),
    selling_price           NUMERIC(12,2),
    currency                CHAR(3),
    supplier_id             UUID REFERENCES vendors(id) ON DELETE SET NULL,
    location_in_clinic      VARCHAR(255),
    requires_refrigeration  BOOLEAN DEFAULT FALSE,
    is_active               BOOLEAN DEFAULT TRUE,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_inventory_code
    ON inventory(clinic_id, item_code)
    WHERE deleted_at IS NULL AND item_code IS NOT NULL;

CREATE INDEX idx_inventory_clinic    ON inventory(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_branch    ON inventory(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_low_stock ON inventory(clinic_id) WHERE deleted_at IS NULL AND quantity_in_stock <= min_stock_level;
CREATE INDEX idx_inventory_expiry    ON inventory(clinic_id, expiration_date) WHERE deleted_at IS NULL AND expiration_date IS NOT NULL;

CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Inventory transactions are immutable (no soft delete; reversals via new rows)
CREATE TABLE inventory_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    inventory_id        UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    transaction_type    VARCHAR(20) NOT NULL CHECK (transaction_type IN
                        ('purchase','sale','consumption','adjustment',
                         'expired','return','transfer','damaged','reversal')),
    quantity            NUMERIC(12,2) NOT NULL,        -- can be negative for outflows
    unit_price          NUMERIC(12,2),
    total_amount        NUMERIC(12,2) GENERATED ALWAYS AS
                        (quantity * COALESCE(unit_price, 0)) STORED,
    transaction_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_type      VARCHAR(50),
    reference_id        UUID,
    reverses_id         UUID REFERENCES inventory_transactions(id),
    batch_number        VARCHAR(100),
    notes               TEXT,
    performed_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inv_tx_inventory ON inventory_transactions(inventory_id);
CREATE INDEX idx_inv_tx_clinic    ON inventory_transactions(clinic_id, transaction_date);

-- ============================================================================
-- 9. STAGE 8 — DOCUMENTS
-- ============================================================================

CREATE TABLE document_folders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    parent_folder_id    UUID REFERENCES document_folders(id) ON DELETE CASCADE,
    folder_name         VARCHAR(255) NOT NULL,
    entity_type         VARCHAR(50),
    entity_id           UUID,
    is_system           BOOLEAN DEFAULT FALSE,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_document_folders_name
    ON document_folders(clinic_id, COALESCE(parent_folder_id, '00000000-0000-0000-0000-000000000000'::uuid), folder_name)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_document_folders_clinic ON document_folders(clinic_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_document_folders_updated_at BEFORE UPDATE ON document_folders
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    folder_id       UUID REFERENCES document_folders(id) ON DELETE SET NULL,
    document_name   VARCHAR(255) NOT NULL,
    document_type   VARCHAR(50) NOT NULL CHECK (document_type IN
                    ('patient_record','lab_result','imaging','prescription',
                     'invoice','consent_form','insurance_card','national_id',
                     'doctor_license','clinic_license','contract','report',
                     'certificate','medical_report','discharge_summary','other')),
    file_name       VARCHAR(500) NOT NULL,
    file_path       VARCHAR(1000) NOT NULL,
    file_size       BIGINT,
    mime_type       VARCHAR(100),
    file_extension  VARCHAR(20),
    file_hash       VARCHAR(128),                   -- sha256 for integrity
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID NOT NULL,
    description     TEXT,
    tags            JSONB DEFAULT '[]'::jsonb,
    metadata        JSONB DEFAULT '{}'::jsonb,
    is_private      BOOLEAN DEFAULT FALSE,
    is_archived     BOOLEAN DEFAULT FALSE,
    is_shared       BOOLEAN DEFAULT FALSE,
    shared_via      VARCHAR(20) CHECK (shared_via IN ('whatsapp','email','sms','link','manual')),
    shared_at       TIMESTAMPTZ,
    shared_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    is_encrypted    BOOLEAN DEFAULT FALSE,
    uploaded_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_documents_clinic ON documents(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_type   ON documents(clinic_id, document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_folder ON documents(folder_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 10. STAGE 9 — NOTIFICATIONS, TEMPLATES, MESSAGE LOG (PARTITIONED)
-- ============================================================================

CREATE TABLE notifications (
    id              UUID NOT NULL DEFAULT gen_random_uuid(),
    clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL CHECK (type IN
                    ('appointment_reminder','appointment_confirmation',
                     'appointment_cancellation','appointment_no_show',
                     'appointment_confirmed','appointment_rescheduled',
                     'follow_up_required','follow_up_completed',
                     'prescription_ready','prescription_sent',
                     'lab_result_ready','lab_result_sent',
                     'payment_due','payment_received','invoice_ready',
                     'inventory_low','system_alert','message','task','other')),
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    is_important    BOOLEAN DEFAULT FALSE,
    action_url      VARCHAR(500),
    reference_type  VARCHAR(50),
    reference_id    UUID,
    read_at         TIMESTAMPTZ,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_clinic ON notifications(clinic_id, created_at DESC);

-- Bootstrap partitions (app/cron should create monthly going forward)
CREATE TABLE notifications_2026_05 PARTITION OF notifications
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE notifications_2026_06 PARTITION OF notifications
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE notifications_2026_07 PARTITION OF notifications
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE notifications_default PARTITION OF notifications DEFAULT;

CREATE TABLE message_templates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    template_name       VARCHAR(255) NOT NULL,
    template_type       VARCHAR(50) NOT NULL CHECK (template_type IN
                        ('email','sms','whatsapp','notification')),
    template_category   VARCHAR(50) CHECK (template_category IN
                        ('appointment_reminder','appointment_confirmation','appointment_cancellation',
                         'follow_up_required','invoice_ready','prescription_ready',
                         'lab_result_ready','welcome','general')),
    -- For WhatsApp Cloud API: name of the approved template + language code
    whatsapp_template_name      VARCHAR(255),
    whatsapp_template_language  VARCHAR(10),
    whatsapp_template_status    VARCHAR(20) CHECK (whatsapp_template_status IN
                                ('pending','approved','rejected','paused','disabled')),
    subject             VARCHAR(255),
    body                TEXT NOT NULL,
    variables           JSONB DEFAULT '[]'::jsonb,
    locale              VARCHAR(10) DEFAULT 'ar',
    is_active           BOOLEAN DEFAULT TRUE,
    is_default          BOOLEAN DEFAULT FALSE,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_message_templates_name
    ON message_templates(clinic_id, template_name, template_type)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_message_templates_clinic ON message_templates(clinic_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_message_templates_updated_at BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Message log — partitioned by month (high-volume table)
CREATE TABLE message_log (
    id                  UUID NOT NULL DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    message_type        VARCHAR(50) NOT NULL CHECK (message_type IN
                        ('email','sms','whatsapp','push_notification')),
    direction           VARCHAR(10) NOT NULL DEFAULT 'outbound'
                        CHECK (direction IN ('outbound','inbound')),
    recipient_type      VARCHAR(50) NOT NULL CHECK (recipient_type IN
                        ('patient','doctor','user','other')),
    recipient_id        UUID NOT NULL,
    recipient_contact   VARCHAR(255) NOT NULL,
    recipient_name      VARCHAR(255),
    subject             VARCHAR(255),
    body                TEXT,
    attachments         JSONB DEFAULT '[]'::jsonb,

    -- WhatsApp Cloud API specific
    provider_message_id VARCHAR(255),               -- wamid.xxx
    template_used       UUID,                       -- ref to message_templates
    template_variables  JSONB,

    status              VARCHAR(20) DEFAULT 'pending' CHECK (status IN
                        ('pending','queued','sent','delivered','read','failed','bounced')),
    status_details      TEXT,
    error_code          VARCHAR(50),
    error_message       TEXT,
    cost                NUMERIC(10,4),              -- for billing analysis
    cost_currency       CHAR(3),

    reference_type      VARCHAR(50),
    reference_id        UUID,
    sent_at             TIMESTAMPTZ DEFAULT NOW(),
    delivered_at        TIMESTAMPTZ,
    read_at             TIMESTAMPTZ,
    failed_at           TIMESTAMPTZ,
    retry_count         INT DEFAULT 0,
    max_retries         INT DEFAULT 3,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_message_log_clinic    ON message_log(clinic_id, created_at DESC);
CREATE INDEX idx_message_log_recipient ON message_log(recipient_type, recipient_id);
CREATE INDEX idx_message_log_status    ON message_log(status, created_at DESC);
CREATE INDEX idx_message_log_provider  ON message_log(provider_message_id) WHERE provider_message_id IS NOT NULL;
CREATE INDEX idx_message_log_reference ON message_log(reference_type, reference_id);

CREATE TABLE message_log_2026_05 PARTITION OF message_log FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE message_log_2026_06 PARTITION OF message_log FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE message_log_2026_07 PARTITION OF message_log FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE message_log_default PARTITION OF message_log DEFAULT;

-- NOTE: fn_create_monthly_partitions is defined later (Stage 11) and covers
-- message_log, notifications, AND activity_log. See Stage 11 for the full definition.

-- ============================================================================
-- 11. STAGE 10 — MEDICAL RECORDS & ACTIVITY LOG (PARTITIONED)
-- ============================================================================

CREATE TABLE medical_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id      UUID REFERENCES appointments(id) ON DELETE SET NULL,
    record_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record_type         VARCHAR(50) NOT NULL CHECK (record_type IN
                        ('note','progress','lab_result','imaging','procedure',
                         'vaccination','surgery','discharge_summary','referral','other')),
    title               VARCHAR(255),
    content             TEXT,
    subjective          TEXT,
    objective           TEXT,
    assessment          TEXT,
    plan                TEXT,
    diagnosis_codes     JSONB DEFAULT '[]'::jsonb,
    procedure_codes     JSONB DEFAULT '[]'::jsonb,
    attachments         JSONB DEFAULT '[]'::jsonb,
    is_confidential     BOOLEAN DEFAULT FALSE,
    is_signed           BOOLEAN DEFAULT FALSE,
    signed_by           UUID REFERENCES users(id) ON DELETE SET NULL,
    signed_at           TIMESTAMPTZ,
    shared_with         JSONB DEFAULT '[]'::jsonb,
    recorded_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_medical_records_patient    ON medical_records(patient_id, record_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_medical_records_clinic     ON medical_records(clinic_id, record_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_medical_records_appointment ON medical_records(appointment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_medical_records_type       ON medical_records(patient_id, record_type) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Activity log — partitioned, never deleted (audit trail)
CREATE TABLE activity_log (
    id              UUID NOT NULL DEFAULT gen_random_uuid(),
    clinic_id       UUID REFERENCES clinics(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL CHECK (action IN
                    ('login','logout','login_failed','create','read','update','delete',
                     'soft_delete','restore','export','print','share',
                     'status_change','password_change','permission_change',
                     'send_message','send_reminder','confirm_appointment',
                     'follow_up_call','send_invoice','send_prescription',
                     'access_denied','rate_limited')),
    entity_type     VARCHAR(50),
    entity_id       UUID,
    description     TEXT,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    session_id      VARCHAR(255),
    request_id      VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_activity_log_clinic ON activity_log(clinic_id, created_at DESC);
CREATE INDEX idx_activity_log_user   ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

CREATE TABLE activity_log_2026_05 PARTITION OF activity_log FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE activity_log_2026_06 PARTITION OF activity_log FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE activity_log_2026_07 PARTITION OF activity_log FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE activity_log_default PARTITION OF activity_log DEFAULT;

-- Extend the monthly partition helper for activity_log too
CREATE OR REPLACE FUNCTION fn_create_monthly_partitions(p_months_ahead INT DEFAULT 12)
RETURNS VOID AS $$
DECLARE
    i           INT;
    start_date  DATE;
    end_date    DATE;
    suffix      TEXT;
BEGIN
    FOR i IN 0..p_months_ahead LOOP
        start_date := date_trunc('month', CURRENT_DATE)::DATE + (i || ' months')::INTERVAL;
        end_date   := start_date + INTERVAL '1 month';
        suffix     := to_char(start_date, 'YYYY_MM');

        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS message_log_%s PARTITION OF message_log FOR VALUES FROM (%L) TO (%L)',
            suffix, start_date, end_date);
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS notifications_%s PARTITION OF notifications FOR VALUES FROM (%L) TO (%L)',
            suffix, start_date, end_date);
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS activity_log_%s PARTITION OF activity_log FOR VALUES FROM (%L) TO (%L)',
            suffix, start_date, end_date);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 12. STAGE 11 — SETTINGS, HOLIDAYS, INTEGRATIONS
-- ============================================================================

CREATE TABLE clinic_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    setting_key     VARCHAR(100) NOT NULL,
    setting_value   JSONB NOT NULL,
    setting_group   VARCHAR(50),
    description     TEXT,
    updated_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (clinic_id, setting_key)
);

CREATE TRIGGER trg_clinic_settings_updated_at BEFORE UPDATE ON clinic_settings
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE holidays (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    branch_id           UUID REFERENCES branches(id) ON DELETE CASCADE,
    holiday_name        VARCHAR(255) NOT NULL,
    holiday_date        DATE NOT NULL,
    is_recurring        BOOLEAN DEFAULT FALSE,
    is_full_day         BOOLEAN DEFAULT TRUE,
    start_time          TIME,
    end_time            TIME,
    affected_doctors    JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_holidays
    ON holidays(clinic_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid),
                holiday_date, holiday_name)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_holidays_clinic_date ON holidays(clinic_id, holiday_date) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_holidays_updated_at BEFORE UPDATE ON holidays
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- WhatsApp Cloud API integration
CREATE TABLE whatsapp_integration (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id                   UUID UNIQUE NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    -- WhatsApp Cloud API specifics
    phone_number_id             VARCHAR(255) NOT NULL,
    business_account_id         VARCHAR(255) NOT NULL,
    display_phone_number        VARCHAR(50),
    access_token_enc            TEXT NOT NULL,        -- app-encrypted (KMS)
    app_secret_enc              TEXT,                 -- for webhook signature verification
    webhook_verify_token_enc    TEXT,
    webhook_url                 VARCHAR(500),
    webhook_verified            BOOLEAN DEFAULT FALSE,
    is_active                   BOOLEAN DEFAULT TRUE,
    daily_message_limit         INT DEFAULT 1000,
    messages_sent_today         INT DEFAULT 0,
    last_reset_date             DATE DEFAULT CURRENT_DATE,
    quality_rating              VARCHAR(20),          -- GREEN/YELLOW/RED from Meta
    messaging_limit_tier        VARCHAR(20),          -- TIER_50/250/1K/10K/100K/UNLIMITED
    settings                    JSONB DEFAULT '{}'::jsonb,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_whatsapp_integration_updated_at BEFORE UPDATE ON whatsapp_integration
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE email_integration (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id               UUID UNIQUE NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    provider                VARCHAR(50) NOT NULL CHECK (provider IN
                            ('smtp','sendgrid','mailgun','ses','postmark','custom')),
    from_email              CITEXT NOT NULL,
    from_name               VARCHAR(255),
    reply_to                CITEXT,
    smtp_host               VARCHAR(255),
    smtp_port               INT,
    smtp_username           VARCHAR(255),
    smtp_password_enc       TEXT,
    smtp_use_tls            BOOLEAN DEFAULT TRUE,
    api_key_enc             TEXT,
    is_active               BOOLEAN DEFAULT TRUE,
    daily_limit             INT DEFAULT 1000,
    emails_sent_today       INT DEFAULT 0,
    last_reset_date         DATE DEFAULT CURRENT_DATE,
    settings                JSONB DEFAULT '{}'::jsonb,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_email_integration_updated_at BEFORE UPDATE ON email_integration
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 13. ROW-LEVEL SECURITY (TENANT ISOLATION)
-- ============================================================================
-- Strategy:
--   1. Application sets `app.current_clinic_id` per request (after auth).
--   2. Super-admins set `app.is_super_admin = 'true'` to bypass.
--   3. Each tenant table gets an RLS policy filtering by clinic_id.
-- ----------------------------------------------------------------------------

-- Helper macro: enable RLS + add standard policy
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'branches','users','user_branches','doctor_profiles','clinic_sequences',
        'patients','patient_communication_preferences','vital_signs',
        'appointments','medications','prescriptions','prescription_items',
        'external_labs','lab_orders','lab_order_items',
        'invoices','invoice_items','payments','vendors','expenses',
        'inventory','inventory_transactions',
        'document_folders','documents',
        'notifications','message_templates','message_log',
        'medical_records','activity_log',
        'clinic_settings','holidays',
        'whatsapp_integration','email_integration'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
    END LOOP;
END $$;

-- Special-case: user_branches has no clinic_id directly — derive via users
-- Special-case: clinics table — each tenant sees only its own row; only super-admin can insert
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON clinics
    FOR ALL
    USING (fn_is_super_admin() OR id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin());

CREATE POLICY tenant_isolation ON branches
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON users
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON user_branches
    FOR ALL
    USING (fn_is_super_admin() OR EXISTS (SELECT 1 FROM users u WHERE u.id = user_branches.user_id
                              AND u.clinic_id = fn_current_clinic_id()
    ))
    WITH CHECK (fn_is_super_admin() OR EXISTS (SELECT 1 FROM users u WHERE u.id = user_branches.user_id
                              AND u.clinic_id = fn_current_clinic_id()
    ));

CREATE POLICY tenant_isolation ON doctor_profiles
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON clinic_sequences
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON patients
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON patient_communication_preferences
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON vital_signs
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON appointments
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON medications
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON prescriptions
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON prescription_items
    FOR ALL
    USING (fn_is_super_admin() OR EXISTS (SELECT 1 FROM prescriptions p
        WHERE p.id = prescription_items.prescription_id
          AND p.clinic_id = fn_current_clinic_id()
    ))
    WITH CHECK (fn_is_super_admin() OR EXISTS (SELECT 1 FROM prescriptions p
        WHERE p.id = prescription_items.prescription_id
          AND p.clinic_id = fn_current_clinic_id()
    ));

CREATE POLICY tenant_isolation ON external_labs
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON lab_orders
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON lab_order_items
    FOR ALL
    USING (fn_is_super_admin() OR EXISTS (SELECT 1 FROM lab_orders lo
        WHERE lo.id = lab_order_items.lab_order_id
          AND lo.clinic_id = fn_current_clinic_id()
    ))
    WITH CHECK (fn_is_super_admin() OR EXISTS (SELECT 1 FROM lab_orders lo
        WHERE lo.id = lab_order_items.lab_order_id
          AND lo.clinic_id = fn_current_clinic_id()
    ));

CREATE POLICY tenant_isolation ON invoices
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON invoice_items
    FOR ALL
    USING (fn_is_super_admin() OR EXISTS (SELECT 1 FROM invoices i
        WHERE i.id = invoice_items.invoice_id
          AND i.clinic_id = fn_current_clinic_id()
    ))
    WITH CHECK (fn_is_super_admin() OR EXISTS (SELECT 1 FROM invoices i
        WHERE i.id = invoice_items.invoice_id
          AND i.clinic_id = fn_current_clinic_id()
    ));

CREATE POLICY tenant_isolation ON payments
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON vendors
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON expenses
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON inventory
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON inventory_transactions
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON document_folders
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON documents
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON notifications
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON message_templates
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON message_log
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON medical_records
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON activity_log
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id() OR clinic_id IS NULL)
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id() OR clinic_id IS NULL);

CREATE POLICY tenant_isolation ON clinic_settings
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON holidays
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON whatsapp_integration
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

CREATE POLICY tenant_isolation ON email_integration
    FOR ALL
    USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

-- ============================================================================
-- 14. USEFUL VIEWS
-- ============================================================================

-- Appointments needing follow-up calls (secretary dashboard)
CREATE OR REPLACE VIEW v_appointments_needing_followup AS
SELECT
    a.id,
    a.clinic_id,
    a.branch_id,
    a.scheduled_start,
    a.appointment_day,
    p.first_name || ' ' || p.last_name AS patient_name,
    p.phone,
    p.phone_e164,
    p.alternative_phone,
    a.confirmation_status,
    a.follow_up_call_status,
    a.follow_up_call_attempts,
    a.max_follow_up_attempts,
    a.last_follow_up_attempt_at,
    u.first_name || ' ' || u.last_name AS doctor_name
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN users u    ON u.id = a.doctor_id
WHERE a.deleted_at IS NULL
  AND a.needs_follow_up_call = TRUE
  AND a.follow_up_call_status IN ('pending','in_progress','no_answer')
  AND a.scheduled_start >= NOW() - INTERVAL '1 day';

-- Inventory alerts
CREATE OR REPLACE VIEW v_inventory_alerts AS
SELECT
    i.*,
    CASE
        WHEN i.quantity_in_stock <= 0 THEN 'out_of_stock'
        WHEN i.quantity_in_stock <= i.min_stock_level THEN 'low_stock'
        WHEN i.expiration_date IS NOT NULL AND i.expiration_date <= CURRENT_DATE THEN 'expired'
        WHEN i.expiration_date IS NOT NULL AND i.expiration_date <= CURRENT_DATE + 30 THEN 'expiring_soon'
        ELSE 'ok'
    END AS alert_type
FROM inventory i
WHERE i.deleted_at IS NULL
  AND (
      i.quantity_in_stock <= i.min_stock_level
      OR (i.expiration_date IS NOT NULL AND i.expiration_date <= CURRENT_DATE + 30)
  );

-- ============================================================================
-- 15. SEED DATA — SYSTEM DEFAULTS
-- ============================================================================

-- Recommended sequences to bootstrap per clinic on signup:
--   patient_code, appointment_number, prescription_number, lab_order_number,
--   invoice_number, payment_number, expense_number
--
-- Example (run from app code on tenant creation):
--   INSERT INTO clinic_sequences (clinic_id, sequence_name, prefix) VALUES
--     ($1, 'patient_code',         'PAT-'),
--     ($1, 'appointment_number',   'APT-'),
--     ($1, 'prescription_number',  'RX-'),
--     ($1, 'lab_order_number',     'LAB-'),
--     ($1, 'invoice_number',       'INV-'),
--     ($1, 'payment_number',       'PAY-'),
--     ($1, 'expense_number',       'EXP-');

-- ============================================================================
-- DONE.
-- ============================================================================


-- ============================================================================
-- 🔐 PATIENT SHARING SYSTEM (Cross-Clinic Access with Consent)
-- ============================================================================

CREATE TABLE patient_share_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    from_clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    to_clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','approved','rejected','expired')),

    access_type VARCHAR(20) NOT NULL DEFAULT 'read_only'
        CHECK (access_type IN ('read_only','limited_write')),

    token VARCHAR(255) UNIQUE NOT NULL,

    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_via VARCHAR(20) CHECK (approved_via IN ('whatsapp','manual')),

    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_share_patient ON patient_share_requests(patient_id);
CREATE INDEX idx_patient_share_from_clinic ON patient_share_requests(from_clinic_id, status);

CREATE TRIGGER trg_patient_share_updated_at
BEFORE UPDATE ON patient_share_requests
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- RLS for patient_share_requests (must mirror the two-clinic nature of this table)
ALTER TABLE patient_share_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_share_requests FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON patient_share_requests
    FOR ALL
    USING  (fn_is_super_admin()
            OR from_clinic_id = fn_current_clinic_id()
            OR to_clinic_id   = fn_current_clinic_id())
    WITH CHECK (fn_is_super_admin()
            OR from_clinic_id = fn_current_clinic_id());

