<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE TABLE invoices (
                id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id                       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                branch_id                       UUID REFERENCES branches(id) ON DELETE SET NULL,
                patient_id                      UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
                appointment_id                  UUID REFERENCES appointments(id) ON DELETE SET NULL,
                invoice_number                  VARCHAR(50) NOT NULL,
                invoice_date                    DATE NOT NULL DEFAULT CURRENT_DATE,
                due_date                        DATE,
                currency                        CHAR(3) NOT NULL,
                subtotal                        NUMERIC(12,2) NOT NULL DEFAULT 0,
                discount_percentage             NUMERIC(5,2) DEFAULT 0,
                discount_amount                 NUMERIC(12,2) DEFAULT 0,
                tax_percentage                  NUMERIC(5,2) DEFAULT 0,
                tax_amount                      NUMERIC(12,2) GENERATED ALWAYS AS
                                                (ROUND((subtotal - COALESCE(discount_amount,0)) * COALESCE(tax_percentage,0) / 100, 2)) STORED,
                total                           NUMERIC(12,2) GENERATED ALWAYS AS (
                                                    subtotal
                                                    - COALESCE(discount_amount, 0)
                                                    + ROUND(
                                                        (subtotal - COALESCE(discount_amount, 0))
                                                        * COALESCE(tax_percentage, 0) / 100,
                                                      2)
                                                ) STORED,
                paid_amount                     NUMERIC(12,2) NOT NULL DEFAULT 0,
                balance_due                     NUMERIC(12,2) GENERATED ALWAYS AS (
                                                    subtotal
                                                    - COALESCE(discount_amount, 0)
                                                    + ROUND(
                                                        (subtotal - COALESCE(discount_amount, 0))
                                                        * COALESCE(tax_percentage, 0) / 100,
                                                      2)
                                                    - paid_amount
                                                ) STORED,
                status                          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN
                                                ('draft','pending','paid','partially_paid',
                                                 'overdue','cancelled','refunded','collections')),
                payment_terms                   VARCHAR(100),
                payment_method                  VARCHAR(50),
                insurance_claim_number          VARCHAR(100),
                insurance_coverage_percentage   NUMERIC(5,2),
                insurance_approved_amount       NUMERIC(12,2),
                patient_responsibility          NUMERIC(12,2),
                notes                           TEXT,
                created_by                      UUID REFERENCES users(id) ON DELETE SET NULL,
                approved_by                     UUID REFERENCES users(id) ON DELETE SET NULL,
                approved_at                     TIMESTAMPTZ,
                created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at                      TIMESTAMPTZ
            );

            CREATE UNIQUE INDEX uq_invoices_number
                ON invoices(clinic_id, invoice_number)
                WHERE deleted_at IS NULL;

            CREATE INDEX idx_invoices_clinic  ON invoices(clinic_id) WHERE deleted_at IS NULL;
            CREATE INDEX idx_invoices_patient ON invoices(patient_id) WHERE deleted_at IS NULL;
            CREATE INDEX idx_invoices_status  ON invoices(clinic_id, status) WHERE deleted_at IS NULL;

            CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            CREATE TABLE invoice_items (
                id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                invoice_id              UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
                item_type               VARCHAR(50) NOT NULL CHECK (item_type IN
                                        ('consultation','procedure','lab_test','imaging',
                                         'medication','vaccination','supplies','other')),
                description             VARCHAR(500) NOT NULL,
                code                    VARCHAR(50),
                quantity                NUMERIC(12,2) NOT NULL DEFAULT 1,
                unit_price              NUMERIC(12,2) NOT NULL,
                discount_percentage     NUMERIC(5,2) DEFAULT 0,
                discount_amount         NUMERIC(12,2) DEFAULT 0,
                total_price             NUMERIC(12,2) GENERATED ALWAYS AS
                                        ((quantity * unit_price) - COALESCE(discount_amount,0)) STORED,
                is_insurance_covered    BOOLEAN DEFAULT FALSE,
                reference_type          VARCHAR(50),
                reference_id            UUID,
                created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT chk_invoice_items_one_discount
                    CHECK (NOT (COALESCE(discount_percentage, 0) > 0
                                AND COALESCE(discount_amount, 0) > 0))
            );

            CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

            CREATE TABLE payments (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
                patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
                payment_number  VARCHAR(50),
                amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
                currency        CHAR(3) NOT NULL,
                payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
                payment_method  VARCHAR(50) NOT NULL CHECK (payment_method IN
                                ('cash','bank_wire'
                                 -- ,'cmi'      -- TODO: enable when CmiGateway is implemented
                                 -- ,'stripe'   -- TODO: enable when StripeGateway is implemented
                                )),
                payment_status  VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN
                                ('pending','completed','failed','refunded','reversed')),
                reference_number VARCHAR(255),
                transaction_id  VARCHAR(255),
                card_last_four  VARCHAR(4),
                bank_name       VARCHAR(255),
                check_number    VARCHAR(100),
                check_date      DATE,
                notes           TEXT,
                received_by     UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at      TIMESTAMPTZ
            );

            CREATE UNIQUE INDEX uq_payments_number
                ON payments(clinic_id, payment_number)
                WHERE deleted_at IS NULL AND payment_number IS NOT NULL;

            CREATE INDEX idx_payments_invoice ON payments(invoice_id) WHERE deleted_at IS NULL;
            CREATE INDEX idx_payments_clinic  ON payments(clinic_id) WHERE deleted_at IS NULL;

            CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            CREATE TRIGGER trg_payments_sync_invoice
                AFTER INSERT OR UPDATE OR DELETE ON payments
                FOR EACH ROW EXECUTE FUNCTION fn_sync_invoice_paid_amount();

            CREATE TABLE vendors (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                vendor_name     VARCHAR(255) NOT NULL,
                contact_person  VARCHAR(200),
                phone           VARCHAR(50),
                email           CITEXT,
                address         TEXT,
                website         VARCHAR(255),
                tax_number      VARCHAR(100),
                category        VARCHAR(100),
                payment_terms   VARCHAR(100),
                bank_account    VARCHAR(255),
                notes           TEXT,
                is_active       BOOLEAN DEFAULT TRUE,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at      TIMESTAMPTZ
            );

            CREATE INDEX idx_vendors_clinic ON vendors(clinic_id) WHERE deleted_at IS NULL;

            CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON vendors
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            CREATE TABLE expenses (
                id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                branch_id           UUID REFERENCES branches(id) ON DELETE SET NULL,
                expense_number      VARCHAR(50),
                expense_date        DATE NOT NULL DEFAULT CURRENT_DATE,
                category            VARCHAR(100) NOT NULL CHECK (category IN
                                    ('rent','utilities','salaries','supplies','equipment',
                                     'maintenance','marketing','insurance','taxes','licenses',
                                     'training','travel','miscellaneous')),
                description         TEXT,
                amount              NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
                currency            CHAR(3) NOT NULL,
                payment_method      VARCHAR(50),
                payment_status      VARCHAR(20) DEFAULT 'pending'
                                    CHECK (payment_status IN ('pending','paid','cancelled')),
                paid_date           DATE,
                paid_to             VARCHAR(255),
                vendor_id           UUID REFERENCES vendors(id) ON DELETE SET NULL,
                is_recurring        BOOLEAN DEFAULT FALSE,
                recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN
                                    ('daily','weekly','monthly','quarterly','yearly')),
                recurring_end_date  DATE,
                attachment_url      VARCHAR(500),
                created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
                approved_by         UUID REFERENCES users(id) ON DELETE SET NULL,
                approved_at         TIMESTAMPTZ,
                created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at          TIMESTAMPTZ
            );

            CREATE UNIQUE INDEX uq_expenses_number
                ON expenses(clinic_id, expense_number)
                WHERE deleted_at IS NULL AND expense_number IS NOT NULL;

            CREATE INDEX idx_expenses_clinic ON expenses(clinic_id) WHERE deleted_at IS NULL;
            CREATE INDEX idx_expenses_date   ON expenses(clinic_id, expense_date) WHERE deleted_at IS NULL;

            CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON expenses
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS expenses CASCADE');
        DB::statement('DROP TABLE IF EXISTS vendors CASCADE');
        DB::statement('DROP TABLE IF EXISTS payments CASCADE');
        DB::statement('DROP TABLE IF EXISTS invoice_items CASCADE');
        DB::statement('DROP TABLE IF EXISTS invoices CASCADE');
    }
};
