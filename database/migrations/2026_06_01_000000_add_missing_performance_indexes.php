<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Adds indexes for hot filter/sort columns and previously-unindexed foreign
 * keys surfaced by the pre-deployment performance audit. All are partial
 * (WHERE deleted_at IS NULL) to stay small and skip soft-deleted rows.
 *
 * - payments(clinic_id, payment_status, payment_date): cash KPIs, the 30-day
 *   method breakdown, weekly revenue, and the payments ledger sort all filtered
 *   payment_date/payment_status as post-index residuals before this.
 * - invoices(clinic_id, due_date): overdue/aging computations.
 * - FK indexes (inventory.medication_id/supplier_id, expenses.vendor_id,
 *   lab_orders.appointment_id/external_lab_id, payments.patient_id): make
 *   ON DELETE checks and reverse-relation loads range scans instead of seq scans.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE INDEX IF NOT EXISTS idx_payments_clinic_status_date
                ON payments (clinic_id, payment_status, payment_date) WHERE deleted_at IS NULL;
            CREATE INDEX IF NOT EXISTS idx_payments_patient
                ON payments (patient_id) WHERE deleted_at IS NULL;
            CREATE INDEX IF NOT EXISTS idx_invoices_due
                ON invoices (clinic_id, due_date) WHERE deleted_at IS NULL;
            CREATE INDEX IF NOT EXISTS idx_inventory_medication
                ON inventory (medication_id) WHERE deleted_at IS NULL;
            CREATE INDEX IF NOT EXISTS idx_inventory_supplier
                ON inventory (supplier_id) WHERE deleted_at IS NULL;
            CREATE INDEX IF NOT EXISTS idx_expenses_vendor
                ON expenses (vendor_id) WHERE deleted_at IS NULL;
            CREATE INDEX IF NOT EXISTS idx_lab_orders_appointment
                ON lab_orders (appointment_id) WHERE deleted_at IS NULL;
            CREATE INDEX IF NOT EXISTS idx_lab_orders_external_lab
                ON lab_orders (external_lab_id) WHERE deleted_at IS NULL;
        SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
            DROP INDEX IF EXISTS idx_payments_clinic_status_date;
            DROP INDEX IF EXISTS idx_payments_patient;
            DROP INDEX IF EXISTS idx_invoices_due;
            DROP INDEX IF EXISTS idx_inventory_medication;
            DROP INDEX IF EXISTS idx_inventory_supplier;
            DROP INDEX IF EXISTS idx_expenses_vendor;
            DROP INDEX IF EXISTS idx_lab_orders_appointment;
            DROP INDEX IF EXISTS idx_lab_orders_external_lab;
        SQL);
    }
};
