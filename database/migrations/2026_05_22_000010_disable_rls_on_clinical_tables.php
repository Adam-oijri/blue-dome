<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Phase 8 pivots away from the consented-cross-clinic sharing model defined in
 * IMPLEMENTATION_GUIDE.md (=== mission rules ===) and toward a "global patient
 * access + per-field provenance audit" architecture. The product owner accepted
 * the trade-off in a plan-mode session on 2026-05-22 (Option A).
 *
 * Concretely: every clinic's staff can SELECT / INSERT / UPDATE on the nine
 * clinical tables listed below. The `clinic_id` column on each row stays — it
 * keeps its meaning as "the originating clinic" and is rendered in the UI as
 * provenance. Per-field provenance lives in the new `field_changes` table
 * shipped by the sibling migration (`..._create_field_changes_table.php`).
 *
 * Tables NOT in this list keep their `tenant_isolation` RLS policy intact
 * (billing, inventory, documents, staff, integrations, settings, audit, tenant
 * roots, reference data).
 *
 * `down()` reinstates the original `tenant_isolation` policy verbatim from
 * `9999_99_99_999999_enable_row_level_security.php`. Reversible.
 *
 * Tracked as open item #13 in docs/architecture/99-open-questions.md.
 */
return new class extends Migration
{
    /** @var list<string> */
    private const CLINICAL_TABLES = [
        'patients',
        'patient_communication_preferences',
        'vital_signs',
        'appointments',
        'medical_records',
        'prescriptions',
        'prescription_items',
        'lab_orders',
        'lab_order_items',
    ];

    public function up(): void
    {
        foreach (self::CLINICAL_TABLES as $table) {
            DB::statement("DROP POLICY IF EXISTS tenant_isolation ON {$table}");
            DB::statement("ALTER TABLE {$table} NO FORCE ROW LEVEL SECURITY");
            DB::statement("ALTER TABLE {$table} DISABLE ROW LEVEL SECURITY");
        }
    }

    public function down(): void
    {
        foreach (self::CLINICAL_TABLES as $table) {
            DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
            DB::statement("ALTER TABLE {$table} FORCE ROW LEVEL SECURITY");
        }

        DB::unprepared(<<<'SQL'
            CREATE POLICY tenant_isolation ON patients
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON patient_communication_preferences
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON vital_signs
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON appointments
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON medical_records
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON prescriptions
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON prescription_items
                FOR ALL
                USING (fn_is_super_admin() OR EXISTS (SELECT 1 FROM prescriptions p
                    WHERE p.id = prescription_items.prescription_id
                      AND p.clinic_id = fn_current_clinic_id()
                ))
                WITH CHECK (fn_is_super_admin() OR EXISTS (SELECT 1 FROM prescriptions p
                    WHERE p.id = prescription_items.prescription_id
                      AND p.clinic_id = fn_current_clinic_id()
                ));

            CREATE POLICY tenant_isolation ON lab_orders
                FOR ALL
                USING (fn_is_super_admin() OR clinic_id = fn_current_clinic_id())
                WITH CHECK (fn_is_super_admin() OR clinic_id = fn_current_clinic_id());

            CREATE POLICY tenant_isolation ON lab_order_items
                FOR ALL
                USING (fn_is_super_admin() OR EXISTS (SELECT 1 FROM lab_orders lo
                    WHERE lo.id = lab_order_items.lab_order_id
                      AND lo.clinic_id = fn_current_clinic_id()
                ))
                WITH CHECK (fn_is_super_admin() OR EXISTS (SELECT 1 FROM lab_orders lo
                    WHERE lo.id = lab_order_items.lab_order_id
                      AND lo.clinic_id = fn_current_clinic_id()
                ));
        SQL);
    }
};
