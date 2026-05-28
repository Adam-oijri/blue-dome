<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE TABLE users (
                id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id                UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                primary_branch_id        UUID REFERENCES branches(id) ON DELETE SET NULL,
                first_name               VARCHAR(100) NOT NULL,
                last_name                VARCHAR(100) NOT NULL,
                email                    CITEXT NOT NULL,
                password_hash            VARCHAR(255) NOT NULL,
                phone                    VARCHAR(50),
                role                     VARCHAR(20) NOT NULL CHECK (role IN
                                         ('super_admin','clinic_admin','doctor','secretary')),
                avatar_url               VARCHAR(500),
                is_active                BOOLEAN NOT NULL DEFAULT TRUE,
                email_verified           BOOLEAN DEFAULT FALSE,
                email_verified_at        TIMESTAMPTZ,
                two_factor_enabled       BOOLEAN DEFAULT FALSE,
                two_factor_secret_enc    TEXT,
                two_factor_recovery_enc  TEXT,
                last_login_at            TIMESTAMPTZ,
                last_login_ip            INET,
                failed_login_attempts    INT DEFAULT 0,
                locked_until             TIMESTAMPTZ,
                permissions              JSONB DEFAULT '{}'::jsonb,
                locale                   VARCHAR(10),
                created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at               TIMESTAMPTZ
            );

            CREATE UNIQUE INDEX uq_users_email_per_clinic
                ON users(clinic_id, email)
                WHERE deleted_at IS NULL;

            CREATE INDEX idx_users_clinic ON users(clinic_id) WHERE deleted_at IS NULL;
            CREATE INDEX idx_users_role   ON users(clinic_id, role) WHERE deleted_at IS NULL;
            CREATE INDEX idx_users_branch ON users(primary_branch_id) WHERE deleted_at IS NULL;

            CREATE UNIQUE INDEX uq_users_one_clinic_admin
                ON users(clinic_id)
                WHERE role = 'clinic_admin' AND deleted_at IS NULL;

            CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

            CREATE TRIGGER trg_users_enforce_role_caps
                BEFORE INSERT OR UPDATE OF role, deleted_at, clinic_id ON users
                FOR EACH ROW EXECUTE FUNCTION fn_enforce_user_role_caps();

            CREATE TABLE user_branches (
                user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                branch_id  UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (user_id, branch_id)
            );

            CREATE TABLE doctor_profiles (
                id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id                  UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                clinic_id                UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                specialty                VARCHAR(100),
                sub_specialty            VARCHAR(100),
                license_number           VARCHAR(100),
                license_expiry           DATE,
                license_document_url     VARCHAR(500),
                medical_school           VARCHAR(255),
                graduation_year          INT,
                board_certifications     JSONB DEFAULT '[]'::jsonb,
                languages_spoken         JSONB DEFAULT '[]'::jsonb,
                consultation_duration    INT NOT NULL DEFAULT 30 CHECK (consultation_duration > 0),
                consultation_fee         NUMERIC(12,2),
                follow_up_fee            NUMERIC(12,2),
                emergency_fee            NUMERIC(12,2),
                working_hours            JSONB DEFAULT '{}'::jsonb,
                max_daily_appointments   INT DEFAULT 20 CHECK (max_daily_appointments >= 0),
                accepts_new_patients     BOOLEAN DEFAULT TRUE,
                bio                      TEXT,
                created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX idx_doctor_profiles_clinic    ON doctor_profiles(clinic_id);
            CREATE INDEX idx_doctor_profiles_specialty ON doctor_profiles(specialty);

            CREATE TRIGGER trg_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS doctor_profiles CASCADE');
        DB::statement('DROP TABLE IF EXISTS user_branches CASCADE');
        DB::statement('DROP TABLE IF EXISTS users CASCADE');
    }
};
