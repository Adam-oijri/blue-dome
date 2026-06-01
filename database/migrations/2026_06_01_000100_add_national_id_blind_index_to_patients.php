<?php

use App\Models\Patient;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Enforce per-clinic national-ID uniqueness via a deterministic blind index.
 *
 * `patients.national_id` is encrypted with a random IV, so the same plaintext
 * stores different ciphertext on every write — the old UNIQUE index on that
 * column (and the matching Rule::unique) could never collide, so duplicate
 * patient charts for one person passed silently. We add `national_id_hash`
 * (HMAC-SHA256 of the plaintext, keyed on APP_KEY), backfill it, and move the
 * uniqueness constraint onto the hash. Validation queries the hash too.
 *
 * NOTE: if a production clinic already has duplicate national IDs, the unique
 * index creation will fail — resolve those duplicates before deploying.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table): void {
            $table->string('national_id_hash', 64)->nullable()->after('national_id');
        });

        // Backfill existing rows (including soft-deleted) by decrypting via the
        // model and writing the hash without disturbing timestamps.
        Patient::withTrashed()
            ->whereNotNull('national_id')
            ->cursor()
            ->each(function (Patient $patient): void {
                DB::table('patients')
                    ->where('id', $patient->id)
                    ->update(['national_id_hash' => Patient::nationalIdHash($patient->national_id)]);
            });

        DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS uq_patients_national_id_hash ON patients (clinic_id, national_id_hash) WHERE deleted_at IS NULL AND national_id_hash IS NOT NULL');
        DB::statement('DROP INDEX IF EXISTS uq_patients_national_id');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS uq_patients_national_id_hash');
        DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS uq_patients_national_id ON patients (clinic_id, national_id) WHERE deleted_at IS NULL AND national_id IS NOT NULL');

        Schema::table('patients', function (Blueprint $table): void {
            $table->dropColumn('national_id_hash');
        });
    }
};
