<?php

namespace App\Models;

use Database\Factories\VitalSignsFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VitalSigns extends Model
{
    /** @use HasFactory<VitalSignsFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'vital_signs';

    public $timestamps = false;

    /**
     * `bmi` is GENERATED ALWAYS AS ... STORED on the table — Postgres rejects
     * any attempt to write to it. The factory and controllers must never
     * include it in their input.
     */
    protected $fillable = [
        'clinic_id',
        'patient_id',
        'appointment_id',
        'recorded_at',
        'temperature_c',
        'blood_pressure_sys',
        'blood_pressure_dia',
        'heart_rate',
        'respiratory_rate',
        'oxygen_saturation',
        'blood_glucose',
        'weight_kg',
        'height_cm',
        'pain_score',
        'notes',
        'recorded_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'temperature_c' => 'decimal:1',
            'oxygen_saturation' => 'decimal:1',
            'blood_glucose' => 'decimal:1',
            'weight_kg' => 'decimal:2',
            'height_cm' => 'decimal:1',
            'bmi' => 'decimal:2',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
