<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
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

            CREATE TABLE appointments (
                id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id                   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                branch_id                   UUID REFERENCES branches(id) ON DELETE SET NULL,
                patient_id                  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                doctor_id                   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                secretary_id                UUID REFERENCES users(id) ON DELETE SET NULL,
                appointment_number          VARCHAR(50),
                scheduled_start             TIMESTAMPTZ NOT NULL,
                scheduled_end               TIMESTAMPTZ NOT NULL,
                duration_minutes            INT GENERATED ALWAYS AS
                                            (EXTRACT(EPOCH FROM (scheduled_end - scheduled_start))::INT / 60) STORED,
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
                confirmation_status         VARCHAR(30) DEFAULT 'pending' CHECK (confirmation_status IN
                                            ('pending','reminder_sent','delivered','seen',
                                             'confirmed_by_patient','confirmed_by_call',
                                             'declined','no_response')),
                confirmation_at             TIMESTAMPTZ,
                confirmation_method         VARCHAR(20) CHECK (confirmation_method IN
                                            ('whatsapp','email','sms','phone_call','manual','auto')),
                confirmation_token          VARCHAR(64) UNIQUE,
                confirmation_token_expires  TIMESTAMPTZ,
                needs_follow_up_call        BOOLEAN DEFAULT FALSE,
                follow_up_call_status       VARCHAR(20) CHECK (follow_up_call_status IN
                                            ('pending','in_progress','completed','no_answer','wrong_number','rescheduled')),
                follow_up_call_at           TIMESTAMPTZ,
                follow_up_call_by           UUID REFERENCES users(id) ON DELETE SET NULL,
                follow_up_call_notes        TEXT,
                follow_up_call_attempts     INT NOT NULL DEFAULT 0,
                max_follow_up_attempts      INT NOT NULL DEFAULT 3,
                last_follow_up_attempt_at   TIMESTAMPTZ,
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
                currency                    CHAR(3),
                is_free                     BOOLEAN DEFAULT FALSE,
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

            ALTER TABLE appointments
                ADD CONSTRAINT excl_doctor_no_overlap
                EXCLUDE USING gist (
                    doctor_id WITH =,
                    tstzrange(scheduled_start, scheduled_end, '[)') WITH &&
                ) WHERE (status NOT IN ('cancelled','no_show','rescheduled') AND deleted_at IS NULL);

            CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            ALTER TABLE vital_signs
                ADD CONSTRAINT fk_vital_signs_appointment
                FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

            ALTER TABLE medical_records
                ADD CONSTRAINT fk_medical_records_appointment
                FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

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

            CREATE TABLE prescription_items (
                id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                prescription_id   UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
                medication_id     UUID NOT NULL REFERENCES medications(id) ON DELETE RESTRICT,
                dosage            VARCHAR(255) NOT NULL,
                frequency_per_day INT,
                interval_hours    INT,
                frequency_text    VARCHAR(255),
                duration_days     INT,
                route             VARCHAR(100) CHECK (route IN
                                  ('oral','topical','intravenous','intramuscular','subcutaneous',
                                   'sublingual','rectal','inhalation','ophthalmic','otic')),
                instructions      TEXT,
                quantity          INT,
                unit              VARCHAR(50),
                refills           INT NOT NULL DEFAULT 0,
                start_date        DATE,
                created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
        SQL);
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE IF EXISTS medical_records DROP CONSTRAINT IF EXISTS fk_medical_records_appointment');
        DB::statement('ALTER TABLE IF EXISTS vital_signs DROP CONSTRAINT IF EXISTS fk_vital_signs_appointment');
        DB::statement('DROP TABLE IF EXISTS prescription_items CASCADE');
        DB::statement('DROP TABLE IF EXISTS prescriptions CASCADE');
        DB::statement('DROP TABLE IF EXISTS appointments CASCADE');
        DB::statement('DROP TABLE IF EXISTS drug_interactions CASCADE');
        DB::statement('DROP TABLE IF EXISTS medications CASCADE');
    }
};
