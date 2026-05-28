<?php

namespace App\Models;

use Database\Factories\AppointmentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    /** @use HasFactory<AppointmentFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'branch_id',
        'patient_id',
        'doctor_id',
        'secretary_id',
        'appointment_number',
        'scheduled_start',
        'scheduled_end',
        'appointment_day',
        'status',
        'type',
        'priority',
        'reason',
        'cancelled_reason',
        'cancelled_at',
        'cancelled_by',
        'rescheduled_from',
        'confirmation_status',
        'confirmation_at',
        'confirmation_method',
        'confirmation_token',
        'confirmation_token_expires',
        'needs_follow_up_call',
        'follow_up_call_status',
        'follow_up_call_at',
        'follow_up_call_by',
        'follow_up_call_notes',
        'follow_up_call_attempts',
        'last_follow_up_attempt_at',
        'chief_complaint',
        'present_illness',
        'consultation_fee',
        'currency',
        'is_free',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_start' => 'datetime',
            'scheduled_end' => 'datetime',
            'appointment_day' => 'date',
            'cancelled_at' => 'datetime',
            'confirmation_at' => 'datetime',
            'confirmation_token_expires' => 'datetime',
            'follow_up_call_at' => 'datetime',
            'last_follow_up_attempt_at' => 'datetime',
            'needs_follow_up_call' => 'boolean',
            'is_free' => 'boolean',
            'invoice_sent' => 'boolean',
            'prescription_sent' => 'boolean',
            'lab_results_sent' => 'boolean',
            'follow_up_call_attempts' => 'integer',
            'max_follow_up_attempts' => 'integer',
            'consultation_fee' => 'decimal:2',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function secretary(): BelongsTo
    {
        return $this->belongsTo(User::class, 'secretary_id');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function followUpCallBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follow_up_call_by');
    }

    public function rescheduledFrom(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'rescheduled_from');
    }

    public function vitalSigns(): HasMany
    {
        return $this->hasMany(VitalSigns::class);
    }

    public function isConfirmationTokenValid(?string $token): bool
    {
        if (! $token || $token !== $this->confirmation_token) {
            return false;
        }

        if ($this->confirmation_token_expires === null) {
            return false;
        }

        return $this->confirmation_token_expires->isFuture();
    }

    public function scopeNeedsFollowUp(Builder $query): Builder
    {
        return $query
            ->where('needs_follow_up_call', true)
            ->whereIn('follow_up_call_status', ['pending', 'in_progress', 'no_answer'])
            ->where('scheduled_start', '>=', now()->subDay());
    }
}
