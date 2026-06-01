<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Custom, recurring front-desk checklist items a secretary adds for themselves.
 * These are item *definitions* (the label), distinct from daily completion which
 * lives in `secretary_checklist_items` keyed by `item_key`. For a custom item the
 * completion row's `item_key` is this row's UUID. Scoped to the owning secretary.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE TABLE secretary_checklist_custom_items (
                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                label       VARCHAR(120) NOT NULL,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX idx_secretary_checklist_custom_user
                ON secretary_checklist_custom_items (user_id, created_at);

            CREATE TRIGGER trg_secretary_checklist_custom_updated_at
                BEFORE UPDATE ON secretary_checklist_custom_items
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
        SQL);
    }

    public function down(): void
    {
        DB::unprepared('DROP TABLE IF EXISTS secretary_checklist_custom_items CASCADE;');
    }
};
