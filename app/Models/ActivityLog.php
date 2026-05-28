<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Partitioned table (RANGE created_at, monthly). Composite PK
 * `(id, created_at)` is required by Postgres for partitioning; Eloquent
 * still treats `id` as the logical key. Writes only — the AuditObserver
 * appends rows; reads happen via the super-admin panel (Phase 7).
 */
class ActivityLog extends Model
{
    use HasUuids;

    protected $table = 'activity_log';

    public $timestamps = false;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'actor_clinic_id',
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'session_id',
        'request_id',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * The clinic of the user who performed the action. Diverges from `clinic`
     * (the record's origin clinic) under Phase 8's global-patient-access model,
     * where staff from clinic B may edit data originating in clinic A.
     */
    public function actorClinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class, 'actor_clinic_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
