<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * `patients.national_id` and `patients.insurance_number` ship in schema.sql as
 * VARCHAR(100). The implementation guide §security rules requires both to use
 * Laravel's `encrypted` cast, whose base64 ciphertext is ~150-200 chars even
 * for short inputs — VARCHAR(100) would silently truncate every value and
 * corrupt it on read. Widening to TEXT removes the cap.
 *
 * The v_patients view (defined in 2026_05_17_000120_create_views.php) projects
 * `p.*`, so Postgres pins the column types via the view and refuses
 * ALTER TYPE while the dependency exists. Drop the view, alter, recreate.
 *
 * Tracked alongside the Fortify-compat columns in docs/architecture/99-open-questions.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_patients');

        DB::statement(<<<'SQL'
            ALTER TABLE patients
                ALTER COLUMN national_id TYPE TEXT,
                ALTER COLUMN insurance_number TYPE TEXT
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW v_patients AS
            SELECT p.*,
                   CASE WHEN date_of_birth IS NOT NULL
                        THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))::INT
                   END AS age
            FROM patients p
            WHERE deleted_at IS NULL
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_patients');

        DB::statement(<<<'SQL'
            ALTER TABLE patients
                ALTER COLUMN national_id TYPE VARCHAR(100),
                ALTER COLUMN insurance_number TYPE VARCHAR(100)
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW v_patients AS
            SELECT p.*,
                   CASE WHEN date_of_birth IS NOT NULL
                        THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))::INT
                   END AS age
            FROM patients p
            WHERE deleted_at IS NULL
        SQL);
    }
};
