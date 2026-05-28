<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Collapse the role model from four roles to three (super_admin, doctor,
     * secretary). The clinic_admin role's duties were folded into secretary,
     * so any existing clinic_admins are re-seated as secretaries. The
     * single-clinic-admin partial unique index is dropped and the role CHECK
     * constraint is tightened.
     */
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            DROP INDEX IF EXISTS uq_users_one_clinic_admin;

            -- Re-seat existing clinic_admins as secretaries. The role-cap
            -- trigger is disabled for this bulk re-seat so a clinic already at
            -- the secretary cap doesn't block the conversion; the cap is
            -- re-enforced on every subsequent write.
            ALTER TABLE users DISABLE TRIGGER trg_users_enforce_role_caps;
            UPDATE users SET role = 'secretary' WHERE role = 'clinic_admin';
            ALTER TABLE users ENABLE TRIGGER trg_users_enforce_role_caps;

            ALTER TABLE users DROP CONSTRAINT users_role_check;
            ALTER TABLE users ADD CONSTRAINT users_role_check
                CHECK (role IN ('super_admin','doctor','secretary'));
        SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
            ALTER TABLE users DROP CONSTRAINT users_role_check;
            ALTER TABLE users ADD CONSTRAINT users_role_check
                CHECK (role IN ('super_admin','clinic_admin','doctor','secretary'));

            CREATE UNIQUE INDEX uq_users_one_clinic_admin
                ON users(clinic_id)
                WHERE role = 'clinic_admin' AND deleted_at IS NULL;
        SQL);
    }
};
