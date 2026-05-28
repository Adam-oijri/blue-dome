<?php

namespace App\Models;

use Database\Factories\MedicalRecordFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * SOAP TEXT fields (content/subjective/objective/assessment/plan) are
 * encrypted at rest via the Laravel `encrypted` cast. They are also hidden
 * from JSON serialisation so casual `toArray()` / Inertia prop emission
 * never leaks clinical text — controllers expose them explicitly when
 * needed, the same pattern Patient PII uses.
 *
 * The IG §security rules table calls for encrypting `diagnosis` and
 * `notes`; the deployed schema has neither column, so encryption is mapped
 * onto the structured SOAP fields instead. See 99-open-questions.md #9.
 */
class MedicalRecord extends Model
{
    /** @use HasFactory<MedicalRecordFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'patient_id',
        'appointment_id',
        'record_date',
        'record_type',
        'title',
        'content',
        'subjective',
        'objective',
        'assessment',
        'plan',
        'diagnosis_codes',
        'procedure_codes',
        'attachments',
        'is_confidential',
        'is_signed',
        'signed_by',
        'signed_at',
        'shared_with',
        'recorded_by',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'content',
        'subjective',
        'objective',
        'assessment',
        'plan',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'record_date' => 'datetime',
            'signed_at' => 'datetime',
            'is_confidential' => 'boolean',
            'is_signed' => 'boolean',
            'diagnosis_codes' => 'array',
            'procedure_codes' => 'array',
            'attachments' => 'array',
            'shared_with' => 'array',
            'content' => 'encrypted',
            'subjective' => 'encrypted',
            'objective' => 'encrypted',
            'assessment' => 'encrypted',
            'plan' => 'encrypted',
            'deleted_at' => 'datetime',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function signer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signed_by');
    }

    public function scopeForCurrentClinic(Builder $query): Builder
    {
        $clinicId = DB::selectOne('SELECT fn_current_clinic_id() AS id')->id;

        return $query->where('clinic_id', $clinicId);
    }
}
