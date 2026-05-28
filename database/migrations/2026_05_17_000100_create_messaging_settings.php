<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
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

            CREATE TABLE whatsapp_integration (
                id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id                   UUID UNIQUE NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                phone_number_id             VARCHAR(255) NOT NULL,
                business_account_id         VARCHAR(255) NOT NULL,
                display_phone_number        VARCHAR(50),
                access_token_enc            TEXT NOT NULL,
                app_secret_enc              TEXT,
                webhook_verify_token_enc    TEXT,
                webhook_url                 VARCHAR(500),
                webhook_verified            BOOLEAN DEFAULT FALSE,
                is_active                   BOOLEAN DEFAULT TRUE,
                daily_message_limit         INT DEFAULT 1000,
                messages_sent_today         INT DEFAULT 0,
                last_reset_date             DATE DEFAULT CURRENT_DATE,
                quality_rating              VARCHAR(20),
                messaging_limit_tier        VARCHAR(20),
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
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS patient_share_requests CASCADE');
        DB::statement('DROP TABLE IF EXISTS email_integration CASCADE');
        DB::statement('DROP TABLE IF EXISTS whatsapp_integration CASCADE');
        DB::statement('DROP TABLE IF EXISTS holidays CASCADE');
        DB::statement('DROP TABLE IF EXISTS clinic_settings CASCADE');
        DB::statement('DROP TABLE IF EXISTS message_templates CASCADE');
    }
};
