<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The activity_log.action CHECK constraint shipped in schema.sql (and migration
 * 2026_05_17_000110_create_partitioned_tables.php) allows 23 action strings.
 * Phase 7 (IMPLEMENTATION_GUIDE.md §phases rules) introduces three new business
 * events that need first-class action strings:
 *
 *   - 'impersonated'         — super_admin begins impersonating a clinic_admin
 *                              (the Phase 7 exit-gate test asserts this exact
 *                               action string).
 *   - 'left_impersonation'   — super_admin ends an impersonation session.
 *   - 'subscription_changed' — clinic suspension or restoration. Distinct from
 *                              the generic 'status_change' so the super-admin
 *                              activity log can surface billing events.
 *
 * activity_log is RANGE-partitioned by created_at; CHECK constraints declared on
 * the parent propagate to every partition and to future ones created by the
 * rotation cron. Dropping/recreating on the parent cascades — no per-partition
 * statements are needed.
 *
 * Open question #10 in docs/architecture/99-open-questions.md tracks whether to
 * amend schema.sql to mirror this deviation (Phase 0/Phase 2 precedent: keep
 * the migration as the canonical source and flag the divergence in the open
 * questions log).
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->dropExistingActionCheck();

        DB::statement(<<<'SQL'
            ALTER TABLE activity_log
                ADD CONSTRAINT activity_log_action_check
                CHECK (action IN (
                    'login','logout','login_failed','create','read','update','delete',
                    'soft_delete','restore','export','print','share',
                    'status_change','password_change','permission_change',
                    'send_message','send_reminder','confirm_appointment',
                    'follow_up_call','send_invoice','send_prescription',
                    'access_denied','rate_limited',
                    'impersonated','left_impersonation','subscription_changed'
                ))
        SQL);
    }

    public function down(): void
    {
        $this->dropExistingActionCheck();

        DB::statement(<<<'SQL'
            ALTER TABLE activity_log
                ADD CONSTRAINT activity_log_action_check
                CHECK (action IN (
                    'login','logout','login_failed','create','read','update','delete',
                    'soft_delete','restore','export','print','share',
                    'status_change','password_change','permission_change',
                    'send_message','send_reminder','confirm_appointment',
                    'follow_up_call','send_invoice','send_prescription',
                    'access_denied','rate_limited'
                ))
        SQL);
    }

    /**
     * Drop whatever CHECK constraint currently guards activity_log.action. The
     * auto-generated name is `activity_log_action_check` but we resolve it from
     * pg_constraint defensively so the migration tolerates installs where the
     * name diverged.
     */
    private function dropExistingActionCheck(): void
    {
        $constraint = DB::selectOne(<<<'SQL'
            SELECT con.conname
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            WHERE rel.relname = 'activity_log'
              AND con.contype = 'c'
              AND pg_get_constraintdef(con.oid) ILIKE '%action%IN%'
            LIMIT 1
        SQL);

        if ($constraint !== null) {
            DB::statement(sprintf(
                'ALTER TABLE activity_log DROP CONSTRAINT %s',
                $constraint->conname
            ));
        }
    }
};
