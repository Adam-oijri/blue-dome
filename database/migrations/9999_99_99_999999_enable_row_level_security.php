<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Phase 8 (2026-05-22, Option A): the nine clinical-patient tables are
     * intentionally excluded from this list so RLS is never enabled on them
     * during `migrate:fresh`. This keeps the global-patient-access feature
     * working under fresh schemas (CI, new dev installs, fresh test runs).
     * The companion `2026_05_22_000010_disable_rls_on_clinical_tables`
     * migration handles the incremental upgrade path for databases that
     * already had RLS enabled before Phase 8 (Phase 7 dev/staging/prod
     * deploys). See open question #13.
     */
    private const TABLES = [
        'branches', 'users', 'user_branches', 'doctor_profiles', 'clinic_sequences',
        'medications',
        'external_labs',
        'invoices', 'invoice_items', 'payments', 'vendors', 'expenses',
        'inventory', 'inventory_transactions',
        'document_folders', 'documents',
        'notifications', 'message_templates', 'message_log',
        'activity_log',
        'clinic_settings', 'holidays',
        'whatsapp_integration', 'email_integration',
        'clinics', 'patient_share_requests',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
            DB::statement("ALTER TABLE {$table} FORCE ROW LEVEL SECURITY");
        }

        DB::unprepared(<<<'SQL'
            CREATE POLICY tenant_isolation ON clinics
                FOR ALL
                USING (fn_is_super_admin() OR id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin());

            CREATE POLICY tenant_isolation ON branches
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON users
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON user_branches
                FOR ALL
                USING (fn_is_super_admin() OR EXISTS (SELECT 1 FROM users u WHERE u.id = user_branches.user_id
                                          AND u.clinic_id = fn_current_clinic_id()
                ))
                WITH CHECK (fn_is_super_admin() OR EXISTS (SELECT 1 FROM users u WHERE u.id = user_branches.user_id
                                          AND u.clinic_id = fn_current_clinic_id()
                ));

            CREATE POLICY tenant_isolation ON doctor_profiles
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON clinic_sequences
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            -- Phase 8: tenant_isolation policies for patients,
            -- patient_communication_preferences, vital_signs, appointments,
            -- medical_records, prescriptions, prescription_items, lab_orders,
            -- and lab_order_items intentionally removed. Those tables are
            -- globally accessible under the Phase 8 global-patient-access
            -- model. See open question #13.

            CREATE POLICY tenant_isolation ON medications
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON external_labs
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON invoices
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON invoice_items
                FOR ALL
                USING (fn_is_super_admin() OR EXISTS (SELECT 1 FROM invoices i
                    WHERE i.id = invoice_items.invoice_id
                      AND i.clinic_id = fn_current_clinic_id()
                ))
                WITH CHECK (fn_is_super_admin() OR EXISTS (SELECT 1 FROM invoices i
                    WHERE i.id = invoice_items.invoice_id
                      AND i.clinic_id = fn_current_clinic_id()
                ));

            CREATE POLICY tenant_isolation ON payments
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON vendors
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON expenses
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON inventory
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON inventory_transactions
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON document_folders
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON documents
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON notifications
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON message_templates
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON message_log
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON activity_log
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id() OR clinic_id IS NULL)
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id() OR clinic_id IS NULL);

            CREATE POLICY tenant_isolation ON clinic_settings
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON holidays
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON whatsapp_integration
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON email_integration
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON patient_share_requests
                FOR ALL
                USING  (fn_is_super_admin()
                        OR from_clinic_id = fn_current_clinic_id()
                        OR to_clinic_id   = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin()
                        OR from_clinic_id = fn_current_clinic_id());
        SQL);
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            DB::statement("DROP POLICY IF EXISTS tenant_isolation ON {$table}");
            DB::statement("ALTER TABLE {$table} NO FORCE ROW LEVEL SECURITY");
            DB::statement("ALTER TABLE {$table} DISABLE ROW LEVEL SECURITY");
        }
    }
};
