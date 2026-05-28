<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        DB::statement('CREATE EXTENSION IF NOT EXISTS "btree_gist"');
        DB::statement('CREATE EXTENSION IF NOT EXISTS "citext"');
        DB::statement('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
    }

    public function down(): void
    {
        DB::statement('DROP EXTENSION IF EXISTS "pg_trgm"');
        DB::statement('DROP EXTENSION IF EXISTS "citext"');
        DB::statement('DROP EXTENSION IF EXISTS "btree_gist"');
        DB::statement('DROP EXTENSION IF EXISTS "pgcrypto"');
    }
};
