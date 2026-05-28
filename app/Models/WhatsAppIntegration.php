<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Phase 1 stub. Full fillable / casts (including encrypted access tokens)
 * land with the WhatsApp messaging module in Phase 3. The presence of a row
 * for a clinic is the signal used by User::sendPasswordResetNotification()
 * to also dispatch a WhatsApp reset link.
 */
class WhatsAppIntegration extends Model
{
    use HasUuids;

    protected $table = 'whatsapp_integration';

    protected $guarded = ['id'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'webhook_verified' => 'boolean',
            'access_token_enc' => 'encrypted',
            'app_secret_enc' => 'encrypted',
            'webhook_verify_token_enc' => 'encrypted',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
