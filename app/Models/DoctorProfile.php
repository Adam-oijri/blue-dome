<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorProfile extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'clinic_id',
        'specialty',
        'sub_specialty',
        'license_number',
        'license_expiry',
        'consultation_duration',
        'consultation_fee',
        'follow_up_fee',
        'emergency_fee',
        'languages_spoken',
        'board_certifications',
        'accepts_new_patients',
        'bio',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'license_expiry' => 'date',
            'languages_spoken' => 'array',
            'board_certifications' => 'array',
            'accepts_new_patients' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
