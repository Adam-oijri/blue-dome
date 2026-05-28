<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
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

            CREATE TABLE notifications_2026_05 PARTITION OF notifications
                FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
            CREATE TABLE notifications_2026_06 PARTITION OF notifications
                FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
            CREATE TABLE notifications_2026_07 PARTITION OF notifications
                FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
            CREATE TABLE notifications_default PARTITION OF notifications DEFAULT;

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
                provider_message_id VARCHAR(255),
                template_used       UUID,
                template_variables  JSONB,
                status              VARCHAR(20) DEFAULT 'pending' CHECK (status IN
                                    ('pending','queued','sent','delivered','read','failed','bounced')),
                status_details      TEXT,
                error_code          VARCHAR(50),
                error_message       TEXT,
                cost                NUMERIC(10,4),
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

            SELECT fn_create_monthly_partitions(3);
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS fn_create_monthly_partitions(INT) CASCADE');
        DB::statement('DROP TABLE IF EXISTS activity_log CASCADE');
        DB::statement('DROP TABLE IF EXISTS message_log CASCADE');
        DB::statement('DROP TABLE IF EXISTS notifications CASCADE');
    }
};
