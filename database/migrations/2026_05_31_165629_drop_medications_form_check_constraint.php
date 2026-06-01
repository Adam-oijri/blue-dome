<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The medication dosage `form` was a fixed enum (CHECK constraint). The UI now
 * accepts a free-text dosage form, so drop the constraint. down() restores it.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE medications DROP CONSTRAINT IF EXISTS medications_form_check');
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE medications ADD CONSTRAINT medications_form_check CHECK (form IS NULL OR form IN ('tablet','capsule','syrup','injection','cream','drops','inhaler','spray','gel','suppository','other'))");
    }
};
