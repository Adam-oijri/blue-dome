<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Phase 8 "Full audit (per-field)" deliverable. Each field change on a tracked
 * clinical record writes one row here, so the UI can render
 * "Field X was changed by Dr Y from Clinic Z on date" without exploding
 * `activity_log.new_values` JSONB blobs.
 *
 * RLS is intentionally NOT enabled on this table. Under the Phase 8
 * global-patient-access model the underlying clinical records are visible
 * cross-clinic; the provenance audit must mirror that visibility (otherwise
 * a clinic B doctor viewing clinic A's patient would see an artificially
 * truncated history). The AuditObserver is the only writer, so there is no
 * untrusted ingress to gate at the database layer.
 *
 * Storage retention is intentionally open-ended in this phase; Phase 9 should
 * land a `field_changes:rotate` command to drop rows older than 7 years
 * (matching activity_log's retention per IG §security). Tracked as open
 * item #16.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE TABLE field_changes (
                id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entity_type           VARCHAR(100) NOT NULL,
                entity_id             UUID NOT NULL,
                field_name            VARCHAR(100) NOT NULL,
                old_value             TEXT,
                new_value             TEXT,
                changed_by_user_id    UUID REFERENCES users(id)   ON DELETE SET NULL,
                changed_by_clinic_id  UUID REFERENCES clinics(id) ON DELETE SET NULL,
                origin_clinic_id      UUID REFERENCES clinics(id) ON DELETE SET NULL,
                changed_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX idx_field_changes_entity
                ON field_changes(entity_type, entity_id, changed_at DESC);
            CREATE INDEX idx_field_changes_actor_clinic
                ON field_changes(changed_by_clinic_id, changed_at DESC);
            CREATE INDEX idx_field_changes_origin
                ON field_changes(origin_clinic_id, changed_at DESC);
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS field_changes CASCADE');
    }
};
