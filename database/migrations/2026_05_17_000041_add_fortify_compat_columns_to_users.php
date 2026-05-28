<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Fortify writes to the literal column names `two_factor_secret`,
 * `two_factor_recovery_codes`, `two_factor_confirmed_at`, and `remember_token`
 * via forceFill/update across 10+ files in laravel/fortify. Aliasing through the
 * Eloquent model fails because those writes bypass mutators. These four columns
 * are the Fortify integration layer; the canonical KMS-encrypted columns
 * (`two_factor_secret_enc`, `two_factor_recovery_enc`) defined in schema.sql
 * remain available for a future migration to application-side encryption.
 *
 * Tracked in docs/architecture/99-open-questions.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
            ALTER TABLE users
                ADD COLUMN two_factor_secret         TEXT,
                ADD COLUMN two_factor_recovery_codes TEXT,
                ADD COLUMN two_factor_confirmed_at   TIMESTAMPTZ,
                ADD COLUMN remember_token            VARCHAR(100)
        SQL);
    }

    public function down(): void
    {
        DB::statement(<<<'SQL'
            ALTER TABLE users
                DROP COLUMN IF EXISTS remember_token,
                DROP COLUMN IF EXISTS two_factor_confirmed_at,
                DROP COLUMN IF EXISTS two_factor_recovery_codes,
                DROP COLUMN IF EXISTS two_factor_secret
        SQL);
    }
};
