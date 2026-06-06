<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Watermark for the activity-feed half of the dashboard notifications: anything
 * in activity_log newer than this counts as "unread" for the user. Targeted
 * alerts (the notifications table) track read state per-row instead.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE users ADD COLUMN notifications_seen_at TIMESTAMPTZ');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users DROP COLUMN IF EXISTS notifications_seen_at');
    }
};
