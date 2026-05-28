<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Phase 8 introduces a global-patient-access model where a clinician at clinic
 * B may update a record whose origin clinic is A. The existing
 * `activity_log.clinic_id` records the *record's* origin clinic (per the
 * AuditObserver implementation), which leaves the auditor blind to *which*
 * clinic's staff performed the action.
 *
 * This migration adds `actor_clinic_id` so the editor's clinic is captured
 * alongside `user_id`. AuditObserver populates it from `Auth::user()?->clinic_id`
 * (sibling change in `app/Observers/AuditObserver.php`).
 *
 * `activity_log` is a RANGE-partitioned parent; PostgreSQL propagates `ADD
 * COLUMN` to every child partition + future ones from `fn_create_monthly_partitions`.
 *
 * Reversible. `down()` drops the index then the column.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE activity_log ADD COLUMN actor_clinic_id UUID NULL REFERENCES clinics(id) ON DELETE SET NULL');
        DB::statement('CREATE INDEX idx_activity_log_actor_clinic ON activity_log(actor_clinic_id, created_at DESC)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_activity_log_actor_clinic');
        DB::statement('ALTER TABLE activity_log DROP COLUMN IF EXISTS actor_clinic_id');
    }
};
