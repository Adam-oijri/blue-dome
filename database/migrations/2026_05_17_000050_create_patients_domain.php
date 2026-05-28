<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE TABLE patients (
                id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id                   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                branch_id                   UUID REFERENCES branches(id) ON DELETE SET NULL,
                patient_code                VARCHAR(50),
                first_name                  VARCHAR(100) NOT NULL,
                last_name                   VARCHAR(100) NOT NULL,
                date_of_birth               DATE,
                gender                      VARCHAR(10) CHECK (gender IN ('male','female','other')),
                phone                       VARCHAR(50),
                phone_e164                  VARCHAR(20),
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

            CREATE TRIGGER trg_patients_default_prefs
                AFTER INSERT ON patients
                FOR EACH ROW EXECUTE FUNCTION fn_create_default_patient_prefs();

            CREATE TABLE vital_signs (
                id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                appointment_id      UUID,
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

            CREATE TABLE medical_records (
                id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                appointment_id      UUID,
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
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS medical_records CASCADE');
        DB::statement('DROP TABLE IF EXISTS vital_signs CASCADE');
        DB::statement('DROP TABLE IF EXISTS patient_communication_preferences CASCADE');
        DB::statement('DROP TABLE IF EXISTS patients CASCADE');
    }
};
