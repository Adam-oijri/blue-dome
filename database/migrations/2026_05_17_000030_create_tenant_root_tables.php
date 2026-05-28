<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE TABLE clinics (
                id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name                    VARCHAR(255) NOT NULL,
                slug                    VARCHAR(100) UNIQUE NOT NULL,
                phone                   VARCHAR(50),
                email                   CITEXT,
                address                 TEXT,
                city                    VARCHAR(100),
                country                 CHAR(2) NOT NULL DEFAULT 'MA',
                postal_code             VARCHAR(20),
                logo_url                VARCHAR(500),
                license_number          VARCHAR(100),
                tax_number              VARCHAR(100),
                currency                CHAR(3) NOT NULL DEFAULT 'MAD',
                timezone                VARCHAR(50) NOT NULL DEFAULT 'Africa/Casablanca',
                locale                  VARCHAR(10) NOT NULL DEFAULT 'ar-MA',
                date_format             VARCHAR(20) DEFAULT 'DD/MM/YYYY',
                subscription_plan       VARCHAR(50) DEFAULT 'free'
                                        CHECK (subscription_plan IN ('free','basic','professional','enterprise')),
                subscription_status     VARCHAR(20) DEFAULT 'trial'
                                        CHECK (subscription_status IN ('active','trial','expired','suspended','cancelled')),
                subscription_started_at TIMESTAMPTZ,
                subscription_expiry     DATE,
                max_users               INT DEFAULT 5,
                max_branches            INT DEFAULT 1,
                max_storage_mb          INT DEFAULT 500,
                storage_used_mb         INT DEFAULT 0,
                is_active               BOOLEAN NOT NULL DEFAULT TRUE,
                settings                JSONB NOT NULL DEFAULT '{}'::jsonb,
                created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at              TIMESTAMPTZ
            );

            CREATE INDEX idx_clinics_active       ON clinics(is_active) WHERE deleted_at IS NULL;
            CREATE INDEX idx_clinics_subscription ON clinics(subscription_status, subscription_expiry) WHERE deleted_at IS NULL;
            CREATE INDEX idx_clinics_country      ON clinics(country) WHERE deleted_at IS NULL;

            CREATE TRIGGER trg_clinics_updated_at BEFORE UPDATE ON clinics
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            CREATE TABLE branches (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                branch_name     VARCHAR(255) NOT NULL,
                branch_code     VARCHAR(50),
                is_main         BOOLEAN NOT NULL DEFAULT FALSE,
                phone           VARCHAR(50),
                email           CITEXT,
                address         TEXT,
                city            VARCHAR(100),
                country         CHAR(2),
                postal_code     VARCHAR(20),
                timezone        VARCHAR(50),
                working_hours   JSONB NOT NULL DEFAULT '{}'::jsonb,
                is_active       BOOLEAN NOT NULL DEFAULT TRUE,
                settings        JSONB NOT NULL DEFAULT '{}'::jsonb,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at      TIMESTAMPTZ
            );

            CREATE UNIQUE INDEX uq_branches_code
                ON branches(clinic_id, branch_code)
                WHERE deleted_at IS NULL AND branch_code IS NOT NULL;

            CREATE UNIQUE INDEX uq_branches_one_main
                ON branches(clinic_id)
                WHERE is_main = TRUE AND deleted_at IS NULL;

            CREATE INDEX idx_branches_clinic ON branches(clinic_id) WHERE deleted_at IS NULL;

            CREATE TRIGGER trg_branches_updated_at BEFORE UPDATE ON branches
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            CREATE TABLE clinic_sequences (
                clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                sequence_name VARCHAR(50) NOT NULL,
                prefix        VARCHAR(10),
                last_value    BIGINT NOT NULL DEFAULT 0,
                updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (clinic_id, sequence_name)
            );
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS clinic_sequences CASCADE');
        DB::statement('DROP TABLE IF EXISTS branches CASCADE');
        DB::statement('DROP TABLE IF EXISTS clinics CASCADE');
    }
};
