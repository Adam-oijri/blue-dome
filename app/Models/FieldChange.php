<?php

namespace App\Models;

use Database\Factories\FieldChangeFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Per-field provenance record for the global-patient-access model introduced
 * in Phase 8. One row per changed attribute, written by AuditObserver on the
 * five tracked clinical models (Patient, MedicalRecord, Prescription,
 * LabOrder, Appointment).
 *
 * Read by the deferred `provenance` Inertia prop on each model's show page.
 * RLS isolates rows to the parties involved (the originating clinic OR the
 * acting clinic) — super-admin sees all.
 */
class FieldChange extends Model
{
    /** @use HasFactory<FieldChangeFactory> */
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'entity_type',
        'entity_id',
        'field_name',
        'old_value',
        'new_value',
        'changed_by_user_id',
        'changed_by_clinic_id',
        'origin_clinic_id',
        'changed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'changed_at' => 'datetime',
        ];
    }

    public function changedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }

    public function changedByClinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class, 'changed_by_clinic_id');
    }

    public function originClinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class, 'origin_clinic_id');
    }

    /**
     * Returns recent field changes for a given model + id, newest first. The
     * caller eager-loads `changedByUser` and `changedByClinic` to render the
     * provenance side panel without an N+1.
     */
    public static function recentForEntity(string $entityType, string $entityId, int $limit = 50): Builder
    {
        return static::query()
            ->where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->orderByDesc('changed_at')
            ->limit($limit);
    }
}
