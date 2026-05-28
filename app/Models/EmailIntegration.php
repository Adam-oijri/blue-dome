<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Per-clinic email configuration. Today the UI only exposes from_email +
 * from_name + reply_to; provider / smtp_* / api_key_enc fields stay on the
 * table for Phase 9 when the messaging module wires in per-clinic SMTP.
 * Until then, all clinics fall through to the system-wide config/mail.php.
 */
class EmailIntegration extends Model
{
    use HasUuids;

    protected $table = 'email_integration';

    protected $guarded = ['id'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'smtp_use_tls' => 'boolean',
            'smtp_password_enc' => 'encrypted',
            'api_key_enc' => 'encrypted',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
