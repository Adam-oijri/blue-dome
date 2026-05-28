<?php

namespace App\Models;

use Database\Factories\ClinicFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Clinic extends Model
{
    /** @use HasFactory<ClinicFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'phone',
        'email',
        'address',
        'city',
        'country',
        'postal_code',
        'currency',
        'timezone',
        'locale',
        'date_format',
        'subscription_plan',
        'subscription_status',
        'subscription_started_at',
        'subscription_expiry',
        'max_users',
        'max_branches',
        'max_storage_mb',
        'is_active',
        'settings',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'settings' => 'array',
            'subscription_started_at' => 'datetime',
            'subscription_expiry' => 'date',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function sequences(): HasMany
    {
        return $this->hasMany(ClinicSequence::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function whatsappIntegration(): HasOne
    {
        return $this->hasOne(WhatsAppIntegration::class);
    }

    public function emailIntegration(): HasOne
    {
        return $this->hasOne(EmailIntegration::class);
    }
}
