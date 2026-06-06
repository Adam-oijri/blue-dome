<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Tracks the devices an account has signed in from, so a sign-in from an
 * unseen device can trigger a security-alert email. Clinic-scoped with the
 * same tenant_isolation RLS policy as the rest of the schema; the login
 * listener elevates to the super-admin GUC for its write because the Login
 * event fires before SetTenantContext sets the tenant context.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
            CREATE TABLE user_known_devices (
                id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                device_hash   VARCHAR(64) NOT NULL,
                ip_address    INET,
                user_agent    TEXT,
                last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (user_id, device_hash)
            )
        SQL);

        DB::statement('CREATE INDEX idx_user_known_devices_user ON user_known_devices(user_id, last_seen_at DESC)');

        DB::statement('ALTER TABLE user_known_devices ENABLE ROW LEVEL SECURITY');
        DB::statement('ALTER TABLE user_known_devices FORCE ROW LEVEL SECURITY');
        DB::statement(<<<'SQL'
            CREATE POLICY tenant_isolation ON user_known_devices
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS user_known_devices CASCADE');
    }
};
