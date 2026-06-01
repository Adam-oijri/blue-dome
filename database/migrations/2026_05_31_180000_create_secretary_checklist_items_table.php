<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Per-secretary daily checklist completion state for the front-desk dashboard.
 * One row = one checklist item marked done by a given secretary on a given day;
 * un-checking removes the row. The item catalogue itself lives in the frontend
 * dictionary (cl_* keys), so this table only records completion.
 *
 * Tenant isolation is enforced in the application layer (clinic_id + user_id
 * filters), consistent with the Phase-8 RLS-disabled operational tables.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE TABLE secretary_checklist_items (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
                user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                checklist_date  DATE NOT NULL,
                item_key        VARCHAR(50) NOT NULL,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (user_id, checklist_date, item_key)
            );

            CREATE INDEX idx_secretary_checklist_lookup
                ON secretary_checklist_items (clinic_id, user_id, checklist_date);

            CREATE TRIGGER trg_secretary_checklist_updated_at BEFORE UPDATE ON secretary_checklist_items
                FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
        SQL);
    }

    public function down(): void
    {
        DB::unprepared('DROP TABLE IF EXISTS secretary_checklist_items CASCADE;');
    }
};
