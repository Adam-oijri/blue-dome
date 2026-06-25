<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Idempotency marker for the hourly `app:send-appointment-reminders` sweep:
 * once a 24h-before WhatsApp reminder is queued for an appointment the column
 * is stamped so subsequent runs skip it. Manual sends and the create-time
 * auto-send are tracked separately on (confirmation_status, confirmation_method)
 * and do not touch this column.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_24h_sent_at TIMESTAMPTZ');

        // The sweep only cares about live, not-yet-reminded appointments.
        DB::statement(<<<'SQL'
            CREATE INDEX IF NOT EXISTS idx_appointments_24h_reminder
            ON appointments (scheduled_start)
            WHERE reminder_24h_sent_at IS NULL AND deleted_at IS NULL
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_appointments_24h_reminder');
        DB::statement('ALTER TABLE appointments DROP COLUMN IF EXISTS reminder_24h_sent_at');
    }
};
