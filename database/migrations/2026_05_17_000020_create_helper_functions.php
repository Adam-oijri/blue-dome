<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE OR REPLACE FUNCTION fn_set_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE OR REPLACE FUNCTION fn_current_clinic_id()
            RETURNS UUID AS $$
            BEGIN
                RETURN NULLIF(current_setting('app.current_clinic_id', TRUE), '')::UUID;
            EXCEPTION WHEN OTHERS THEN
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql STABLE;

            CREATE OR REPLACE FUNCTION fn_current_user_id()
            RETURNS UUID AS $$
            BEGIN
                RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
            EXCEPTION WHEN OTHERS THEN
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql STABLE;

            CREATE OR REPLACE FUNCTION fn_is_super_admin()
            RETURNS BOOLEAN AS $$
            BEGIN
                RETURN COALESCE(current_setting('app.is_super_admin', TRUE), 'false')::BOOLEAN;
            EXCEPTION WHEN OTHERS THEN
                RETURN FALSE;
            END;
            $$ LANGUAGE plpgsql STABLE;

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
            $$ LANGUAGE plpgsql;

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
            $$ LANGUAGE plpgsql;

            CREATE OR REPLACE FUNCTION fn_next_seq(
                p_clinic_id UUID,
                p_seq_name  VARCHAR
            ) RETURNS TEXT AS $$
            DECLARE
                v_prefix   VARCHAR(10);
                v_value    BIGINT;
            BEGIN
                INSERT INTO clinic_sequences (clinic_id, sequence_name, last_value)
                    VALUES (p_clinic_id, p_seq_name, 1)
                    ON CONFLICT (clinic_id, sequence_name)
                    DO UPDATE SET last_value = clinic_sequences.last_value + 1,
                                  updated_at = NOW()
                    RETURNING prefix, last_value INTO v_prefix, v_value;

                RETURN COALESCE(v_prefix, '') || lpad(v_value::TEXT, 6, '0');
            END;
            $$ LANGUAGE plpgsql;

            CREATE OR REPLACE FUNCTION fn_enforce_user_role_caps()
            RETURNS TRIGGER AS $$
            DECLARE
                v_count INT;
                v_max   INT;
            BEGIN
                IF NEW.deleted_at IS NOT NULL THEN
                    RETURN NEW;
                END IF;

                IF NEW.role = 'doctor' THEN
                    v_max := 2;
                ELSIF NEW.role = 'secretary' THEN
                    v_max := 3;
                ELSE
                    RETURN NEW;
                END IF;

                SELECT COUNT(*) INTO v_count
                FROM users
                WHERE clinic_id  = NEW.clinic_id
                  AND role       = NEW.role
                  AND deleted_at IS NULL
                  AND id <> NEW.id;

                IF v_count >= v_max THEN
                    RAISE EXCEPTION
                        'Account cap exceeded: clinic % already has % active % accounts (max %)',
                        NEW.clinic_id, v_count, NEW.role, v_max
                        USING ERRCODE = 'check_violation';
                END IF;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE OR REPLACE FUNCTION fn_create_default_patient_prefs()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO patient_communication_preferences (patient_id, clinic_id)
                    VALUES (NEW.id, NEW.clinic_id)
                    ON CONFLICT (patient_id) DO NOTHING;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE OR REPLACE FUNCTION fn_sync_invoice_paid_amount()
            RETURNS TRIGGER AS $$
            DECLARE
                v_invoice_id UUID;
                v_total_paid NUMERIC(12,2);
            BEGIN
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
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS fn_sync_invoice_paid_amount() CASCADE');
        DB::statement('DROP FUNCTION IF EXISTS fn_create_default_patient_prefs() CASCADE');
        DB::statement('DROP FUNCTION IF EXISTS fn_enforce_user_role_caps() CASCADE');
        DB::statement('DROP FUNCTION IF EXISTS fn_next_seq(UUID, VARCHAR) CASCADE');
        DB::statement('DROP FUNCTION IF EXISTS fn_restore(TEXT, UUID) CASCADE');
        DB::statement('DROP FUNCTION IF EXISTS fn_soft_delete(TEXT, UUID) CASCADE');
        DB::statement('DROP FUNCTION IF EXISTS fn_is_super_admin() CASCADE');
        DB::statement('DROP FUNCTION IF EXISTS fn_current_user_id() CASCADE');
        DB::statement('DROP FUNCTION IF EXISTS fn_current_clinic_id() CASCADE');
        DB::statement('DROP FUNCTION IF EXISTS fn_set_updated_at() CASCADE');
    }
};
