<?php

namespace App\Models;

use Database\Factories\PrescriptionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Prescription extends Model
{
    /** @use HasFactory<PrescriptionFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'prescription_number',
        'appointment_id',
        'patient_id',
        'doctor_id',
        'prescription_date',
        'expiry_date',
        'status',
        'diagnosis_related',
        'notes',
        'is_printed',
        'printed_at',
        'printed_by',
        'is_dispensed',
        'dispensed_at',
        'dispensed_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'prescription_date' => 'date',
            'expiry_date' => 'date',
            'printed_at' => 'datetime',
            'dispensed_at' => 'datetime',
            'is_printed' => 'boolean',
            'is_dispensed' => 'boolean',
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

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function printedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'printed_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class);
    }

    public function scopeForCurrentClinic(Builder $query): Builder
    {
        $clinicId = DB::selectOne('SELECT fn_current_clinic_id() AS id')->id;

        return $query->where('clinic_id', $clinicId);
    }
}
