<?php

namespace App\Models;

use Database\Factories\PatientFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Patient extends Model
{
    /** @use HasFactory<PatientFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'branch_id',
        'patient_code',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'phone',
        'phone_e164',
        'alternative_phone',
        'email',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'national_id',
        'passport_number',
        'blood_type',
        'marital_status',
        'occupation',
        'insurance_number',
        'insurance_company',
        'insurance_expiry',
        'insurance_type',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'allergies',
        'chronic_diseases',
        'current_medications',
        'family_history',
        'surgical_history',
        'smoking_status',
        'alcohol_consumption',
        'profile_picture_url',
        'notes',
        'is_active',
        'registration_date',
        'created_by',
    ];

    protected $hidden = [
        'national_id',
        'insurance_number',
    ];

    /**
     * Keep the deterministic national-ID blind index in sync on every write.
     * The `national_id` column is encrypted with a random IV, so it cannot be
     * uniquely indexed directly; `national_id_hash` is a deterministic HMAC of
     * the plaintext that backs the per-clinic uniqueness constraint.
     */
    protected static function booted(): void
    {
        static::saving(function (Patient $patient): void {
            $patient->national_id_hash = self::nationalIdHash($patient->national_id);
        });
    }

    /**
     * Deterministic blind-index hash of a national ID (HMAC-SHA256 keyed on the
     * app key), or null when empty. Used for per-clinic uniqueness without
     * exposing or decrypting the stored ciphertext.
     */
    public static function nationalIdHash(?string $value): ?string
    {
        $normalized = is_string($value) ? trim($value) : '';

        if ($normalized === '') {
            return null;
        }

        return hash_hmac('sha256', $normalized, (string) config('app.key'));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'insurance_expiry' => 'date',
            'registration_date' => 'date',
            'is_active' => 'boolean',
            'national_id' => 'encrypted',
            'insurance_number' => 'encrypted',
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

    public function communicationPreferences(): HasOne
    {
        return $this->hasOne(PatientCommunicationPreference::class);
    }

    public function vitalSigns(): HasMany
    {
        return $this->hasMany(VitalSigns::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Restrict to the current tenant. RLS does this at the DB level for
     * normal requests, but the scope is useful for super-admin tooling and
     * console commands that explicitly want to constrain by clinic.
     */
    public function scopeForCurrentClinic(Builder $query): Builder
    {
        $clinicId = DB::selectOne('SELECT fn_current_clinic_id() AS id')->id;

        return $query->where('clinic_id', $clinicId);
    }
}
