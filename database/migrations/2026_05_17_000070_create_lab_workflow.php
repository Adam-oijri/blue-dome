<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE TABLE external_labs (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                lab_name        VARCHAR(255) NOT NULL,
                contact_person  VARCHAR(200),
                phone           VARCHAR(50),
                email           CITEXT,
                address         TEXT,
                website         VARCHAR(255),
                api_endpoint    VARCHAR(500),
                is_active       BOOLEAN DEFAULT TRUE,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at      TIMESTAMPTZ
            );

            CREATE INDEX idx_external_labs_clinic ON external_labs(clinic_id) WHERE deleted_at IS NULL;

            CREATE TRIGGER trg_external_labs_updated_at BEFORE UPDATE ON external_labs
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            CREATE TABLE lab_orders (
                id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                lab_order_number    VARCHAR(50),
                appointment_id      UUID REFERENCES appointments(id) ON DELETE SET NULL,
                patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                doctor_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                external_lab_id     UUID REFERENCES external_labs(id) ON DELETE SET NULL,
                order_date          DATE NOT NULL DEFAULT CURRENT_DATE,
                status              VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN
                                    ('draft','pending','sample_collected','in_progress',
                                     'completed','partially_completed','cancelled','rejected')),
                urgency             VARCHAR(20) NOT NULL DEFAULT 'routine'
                                    CHECK (urgency IN ('routine','urgent','stat')),
                fasting_required    BOOLEAN DEFAULT FALSE,
                clinical_diagnosis  TEXT,
                notes               TEXT,
                completed_at        TIMESTAMPTZ,
                reviewed_by         UUID REFERENCES users(id) ON DELETE SET NULL,
                reviewed_at         TIMESTAMPTZ,
                created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at          TIMESTAMPTZ
            );

            CREATE UNIQUE INDEX uq_lab_orders_number
                ON lab_orders(clinic_id, lab_order_number)
                WHERE deleted_at IS NULL AND lab_order_number IS NOT NULL;

            CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id) WHERE deleted_at IS NULL;
            CREATE INDEX idx_lab_orders_clinic  ON lab_orders(clinic_id) WHERE deleted_at IS NULL;

            CREATE TRIGGER trg_lab_orders_updated_at BEFORE UPDATE ON lab_orders
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            CREATE TABLE lab_order_items (
                id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                lab_order_id        UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
                test_code           VARCHAR(50),
                test_name           VARCHAR(255) NOT NULL,
                test_category       VARCHAR(100),
                specimen_type       VARCHAR(100),
                result              TEXT,
                result_date         DATE,
                result_status       VARCHAR(20) DEFAULT 'pending' CHECK (result_status IN
                                    ('pending','normal','abnormal','critical','inconclusive')),
                normal_range        VARCHAR(255),
                normal_range_min    NUMERIC(12,2),
                normal_range_max    NUMERIC(12,2),
                is_abnormal         BOOLEAN,
                is_critical         BOOLEAN DEFAULT FALSE,
                unit                VARCHAR(50),
                methodology         VARCHAR(100),
                attachment_url      VARCHAR(500),
                notes               TEXT,
                reviewed_by         UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX idx_lab_order_items_order ON lab_order_items(lab_order_id);
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS lab_order_items CASCADE');
        DB::statement('DROP TABLE IF EXISTS lab_orders CASCADE');
        DB::statement('DROP TABLE IF EXISTS external_labs CASCADE');
    }
};
