<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Models\FieldChange;
use App\Models\LabOrder;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * Append-only audit trail for clinical and account writes. Attached to the
 * models listed in IG §audit rules (Patient, Appointment, Prescription,
 * LabOrder, MedicalRecord, User account creation, etc.).
 *
 * Phase 8 additions:
 *   1. `activity_log.actor_clinic_id` is populated from `Auth::user()?->clinic_id`
 *      so the audit row attributes the *editor's* clinic alongside the
 *      record's origin clinic. Required because the new global-patient-access
 *      model lets clinic B edit clinic A's records.
 *   2. The five clinical models in `FIELD_AUDITED_MODELS` ALSO write one
 *      `field_changes` row per changed attribute on create/update/soft-delete/
 *      delete/restore. Provides the per-field provenance UI shown on each
 *      record's show page.
 *
 * The IG explicitly forbids auditing MessageLog, Notification, ActivityLog,
 * FieldChange, partition rotation, and schema migrations — those tables are
 * either high-volume side effects or self-referential.
 */
class AuditObserver
{
    /**
     * Models whose changes are tracked per-field in addition to the
     * activity_log per-record summary.
     *
     * @var array<class-string<Model>, true>
     */
    private const FIELD_AUDITED_MODELS = [
        Patient::class => true,
        Appointment::class => true,
        MedicalRecord::class => true,
        Prescription::class => true,
        LabOrder::class => true,
    ];

    public function created(Model $model): void
    {
        $attrs = $this->attributesFor($model);

        $this->log($model, 'create', null, $attrs);
        $this->recordFieldChanges($model, oldValues: null, newValues: $attrs);
    }

    public function updated(Model $model): void
    {
        $changes = $model->getChanges();

        unset($changes['updated_at']);
        if ($changes === []) {
            return;
        }

        $hidden = array_fill_keys($model->getHidden(), true);
        $changes = array_diff_key($changes, $hidden);

        if ($changes === []) {
            return;
        }

        $original = array_intersect_key($model->getOriginal(), $changes);

        $this->log($model, 'update', $original ?: null, $changes);
        $this->recordFieldChanges($model, oldValues: $original, newValues: $changes);
    }

    public function deleted(Model $model): void
    {
        $isSoftDelete = in_array(SoftDeletes::class, class_uses_recursive($model), true)
            && method_exists($model, 'isForceDeleting')
            && ! $model->isForceDeleting();

        $attrs = $this->attributesFor($model);

        $this->log($model, $isSoftDelete ? 'soft_delete' : 'delete', $attrs, null);
        $this->recordFieldChanges($model, oldValues: $attrs, newValues: null);
    }

    public function restored(Model $model): void
    {
        $attrs = $this->attributesFor($model);

        $this->log($model, 'restore', null, $attrs);
        $this->recordFieldChanges($model, oldValues: null, newValues: $attrs);
    }

    /**
     * Build a sanitized snapshot of the model's attributes. Hidden columns
     * (e.g. encrypted clinical text) are excluded so the audit row does not
     * become a plaintext leak vector.
     *
     * @return array<string, mixed>
     */
    private function attributesFor(Model $model): array
    {
        $hidden = array_fill_keys($model->getHidden(), true);

        return array_diff_key($model->getAttributes(), $hidden);
    }

    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    private function log(Model $model, string $action, ?array $oldValues, ?array $newValues): void
    {
        $request = request();
        $actor = Auth::user();

        ActivityLog::create([
            'clinic_id' => $model->getAttribute('clinic_id'),
            'actor_clinic_id' => $actor?->clinic_id,
            'user_id' => $actor?->id,
            'action' => $action,
            'entity_type' => class_basename($model),
            'entity_id' => $model->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'session_id' => $request?->hasSession() ? $request->session()->getId() : null,
            'request_id' => $request?->headers->get('X-Request-Id'),
            'created_at' => now(),
        ]);
    }

    /**
     * Per-field provenance write. Only applies to the five clinical models
     * tracked in FIELD_AUDITED_MODELS. `$hidden` attributes are excluded by
     * the caller already; foreign keys / timestamps / soft-delete columns
     * are intentionally kept so a deletion or restore is visible in the
     * timeline.
     *
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    private function recordFieldChanges(Model $model, ?array $oldValues, ?array $newValues): void
    {
        if (! isset(self::FIELD_AUDITED_MODELS[$model::class])) {
            return;
        }

        $actor = Auth::user();
        $entityType = class_basename($model);
        $entityId = (string) $model->getKey();
        $originClinic = $model->getAttribute('clinic_id');
        $changedAt = now();

        $fields = array_unique(array_merge(
            array_keys($oldValues ?? []),
            array_keys($newValues ?? []),
        ));

        $rows = [];

        foreach ($fields as $field) {
            $rows[] = [
                'id' => (string) Str::uuid(),
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'field_name' => $field,
                'old_value' => $this->stringify($oldValues[$field] ?? null),
                'new_value' => $this->stringify($newValues[$field] ?? null),
                'changed_by_user_id' => $actor?->id,
                'changed_by_clinic_id' => $actor?->clinic_id,
                'origin_clinic_id' => $originClinic,
                'changed_at' => $changedAt,
            ];
        }

        if ($rows === []) {
            return;
        }

        FieldChange::query()->insert($rows);
    }

    private function stringify(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_scalar($value)) {
            return (string) $value;
        }

        if ($value instanceof \BackedEnum) {
            return (string) $value->value;
        }

        if ($value instanceof \UnitEnum) {
            return $value->name;
        }

        if ($value instanceof \DateTimeInterface) {
            return $value->format(DATE_ATOM);
        }

        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
