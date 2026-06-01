<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Prescription items can now reference a free-text medication name instead of a
 * catalog `medication_id`. Add the text column and make the FK nullable so an
 * item may carry either one (the FK still applies when an id is supplied).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prescription_items', function (Blueprint $table) {
            $table->string('medication_name', 255)->nullable()->after('medication_id');
        });

        DB::statement('ALTER TABLE prescription_items ALTER COLUMN medication_id DROP NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE prescription_items ALTER COLUMN medication_id SET NOT NULL');

        Schema::table('prescription_items', function (Blueprint $table) {
            $table->dropColumn('medication_name');
        });
    }
};
