<?php

namespace App\Models;

use App\Contracts\WhatsAppGateway;
use Database\Factories\UserFactory;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'clinic_id',
    'primary_branch_id',
    'first_name',
    'last_name',
    'email',
    'phone',
    'role',
    'locale',
    'avatar_url',
    'is_active',
])]
#[Hidden([
    'password_hash',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'two_factor_secret_enc',
    'two_factor_recovery_enc',
    'remember_token',
])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasUuids, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'last_login_at' => 'datetime',
            'locked_until' => 'datetime',
            'permissions' => 'array',
            'password_hash' => 'hashed',
            'is_active' => 'boolean',
            'email_verified' => 'boolean',
            'two_factor_enabled' => 'boolean',
        ];
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function primaryBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'primary_branch_id');
    }

    /**
     * Send the email reset link, and — when the user is reachable by
     * WhatsApp and the clinic has wired the Meta integration — also fire
     * the link through the WhatsApp gateway. Email is the always-on
     * fallback per IMPLEMENTATION_GUIDE.md §auth rules.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPassword($token));

        if ($this->phone === null || $this->phone === '') {
            return;
        }

        $this->loadMissing('clinic.whatsappIntegration');

        $integration = $this->clinic?->whatsappIntegration;
        if ($integration === null || ! $integration->is_active) {
            return;
        }

        $resetUrl = url(route('password.reset', [
            'token' => $token,
            'email' => $this->email,
        ], false));

        app(WhatsAppGateway::class)->sendPasswordReset($this, $resetUrl);
    }
}
