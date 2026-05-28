<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE OR REPLACE VIEW v_patients AS
            SELECT p.*,
                   CASE WHEN date_of_birth IS NOT NULL
                        THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))::INT
                   END AS age
            FROM patients p
            WHERE deleted_at IS NULL;

            CREATE OR REPLACE VIEW v_prescription_items AS
            SELECT pi.*,
                   CASE WHEN start_date IS NOT NULL AND duration_days IS NOT NULL
                        THEN start_date + (duration_days || ' days')::INTERVAL
                   END AS end_date
            FROM prescription_items pi;

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
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_inventory_alerts CASCADE');
        DB::statement('DROP VIEW IF EXISTS v_appointments_needing_followup CASCADE');
        DB::statement('DROP VIEW IF EXISTS v_prescription_items CASCADE');
        DB::statement('DROP VIEW IF EXISTS v_patients CASCADE');
    }
};
