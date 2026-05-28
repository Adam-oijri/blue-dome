<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE TABLE inventory (
                id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id               UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                branch_id               UUID REFERENCES branches(id) ON DELETE SET NULL,
                medication_id           UUID REFERENCES medications(id) ON DELETE SET NULL,
                item_code               VARCHAR(100),
                item_name               VARCHAR(255) NOT NULL,
                category                VARCHAR(100) NOT NULL CHECK (category IN
                                        ('medication','supplies','equipment','office_supplies')),
                batch_number            VARCHAR(100),
                serial_number           VARCHAR(100),
                expiration_date         DATE,
                quantity_in_stock       NUMERIC(12,2) NOT NULL DEFAULT 0,
                min_stock_level         NUMERIC(12,2) NOT NULL DEFAULT 5,
                max_stock_level         NUMERIC(12,2),
                reorder_point           NUMERIC(12,2),
                unit                    VARCHAR(50),
                purchase_price          NUMERIC(12,2),
                selling_price           NUMERIC(12,2),
                currency                CHAR(3),
                supplier_id             UUID REFERENCES vendors(id) ON DELETE SET NULL,
                location_in_clinic      VARCHAR(255),
                requires_refrigeration  BOOLEAN DEFAULT FALSE,
                is_active               BOOLEAN DEFAULT TRUE,
                notes                   TEXT,
                created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at              TIMESTAMPTZ
            );

            CREATE UNIQUE INDEX uq_inventory_code
                ON inventory(clinic_id, item_code)
                WHERE deleted_at IS NULL AND item_code IS NOT NULL;

            CREATE INDEX idx_inventory_clinic    ON inventory(clinic_id) WHERE deleted_at IS NULL;
            CREATE INDEX idx_inventory_branch    ON inventory(branch_id) WHERE deleted_at IS NULL;
            CREATE INDEX idx_inventory_low_stock ON inventory(clinic_id) WHERE deleted_at IS NULL AND quantity_in_stock <= min_stock_level;
            CREATE INDEX idx_inventory_expiry    ON inventory(clinic_id, expiration_date) WHERE deleted_at IS NULL AND expiration_date IS NOT NULL;

            CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON inventory
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            CREATE TABLE inventory_transactions (
                id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                inventory_id        UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
                transaction_type    VARCHAR(20) NOT NULL CHECK (transaction_type IN
                                    ('purchase','sale','consumption','adjustment',
                                     'expired','return','transfer','damaged','reversal')),
                quantity            NUMERIC(12,2) NOT NULL,
                unit_price          NUMERIC(12,2),
                total_amount        NUMERIC(12,2) GENERATED ALWAYS AS
                                    (quantity * COALESCE(unit_price, 0)) STORED,
                transaction_date    DATE NOT NULL DEFAULT CURRENT_DATE,
                reference_type      VARCHAR(50),
                reference_id        UUID,
                reverses_id         UUID REFERENCES inventory_transactions(id),
                batch_number        VARCHAR(100),
                notes               TEXT,
                performed_by        UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX idx_inv_tx_inventory ON inventory_transactions(inventory_id);
            CREATE INDEX idx_inv_tx_clinic    ON inventory_transactions(clinic_id, transaction_date);

            CREATE TABLE document_folders (
                id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                parent_folder_id    UUID REFERENCES document_folders(id) ON DELETE CASCADE,
                folder_name         VARCHAR(255) NOT NULL,
                entity_type         VARCHAR(50),
                entity_id           UUID,
                is_system           BOOLEAN DEFAULT FALSE,
                created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at          TIMESTAMPTZ
            );

            CREATE UNIQUE INDEX uq_document_folders_name
                ON document_folders(clinic_id, COALESCE(parent_folder_id, '00000000-0000-0000-0000-000000000000'::uuid), folder_name)
                WHERE deleted_at IS NULL;

            CREATE INDEX idx_document_folders_clinic ON document_folders(clinic_id) WHERE deleted_at IS NULL;

            CREATE TRIGGER trg_document_folders_updated_at BEFORE UPDATE ON document_folders
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            CREATE TABLE documents (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                folder_id       UUID REFERENCES document_folders(id) ON DELETE SET NULL,
                document_name   VARCHAR(255) NOT NULL,
                document_type   VARCHAR(50) NOT NULL CHECK (document_type IN
                                ('patient_record','lab_result','imaging','prescription',
                                 'invoice','consent_form','insurance_card','national_id',
                                 'doctor_license','clinic_license','contract','report',
                                 'certificate','medical_report','discharge_summary','other')),
                file_name       VARCHAR(500) NOT NULL,
                file_path       VARCHAR(1000) NOT NULL,
                file_size       BIGINT,
                mime_type       VARCHAR(100),
                file_extension  VARCHAR(20),
                file_hash       VARCHAR(128),
                entity_type     VARCHAR(50) NOT NULL,
                entity_id       UUID NOT NULL,
                description     TEXT,
                tags            JSONB DEFAULT '[]'::jsonb,
                metadata        JSONB DEFAULT '{}'::jsonb,
                is_private      BOOLEAN DEFAULT FALSE,
                is_archived     BOOLEAN DEFAULT FALSE,
                is_shared       BOOLEAN DEFAULT FALSE,
                shared_via      VARCHAR(20) CHECK (shared_via IN ('whatsapp','email','sms','link','manual')),
                shared_at       TIMESTAMPTZ,
                shared_by       UUID REFERENCES users(id) ON DELETE SET NULL,
                is_encrypted    BOOLEAN DEFAULT FALSE,
                uploaded_by     UUID REFERENCES users(id) ON DELETE SET NULL,
                uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                expires_at      TIMESTAMPTZ,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at      TIMESTAMPTZ
            );

            CREATE INDEX idx_documents_clinic ON documents(clinic_id) WHERE deleted_at IS NULL;
            CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id) WHERE deleted_at IS NULL;
            CREATE INDEX idx_documents_type   ON documents(clinic_id, document_type) WHERE deleted_at IS NULL;
            CREATE INDEX idx_documents_folder ON documents(folder_id) WHERE deleted_at IS NULL;

            CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS documents CASCADE');
        DB::statement('DROP TABLE IF EXISTS document_folders CASCADE');
        DB::statement('DROP TABLE IF EXISTS inventory_transactions CASCADE');
        DB::statement('DROP TABLE IF EXISTS inventory CASCADE');
    }
};
