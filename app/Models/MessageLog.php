<?php

namespace App\Models;

use Database\Factories\MessageLogFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Partitioned table (RANGE created_at, monthly). The composite primary key
 * `(id, created_at)` is a Postgres requirement for partitioning — Eloquent
 * still treats `id` as the logical key. Writes are append-only; the
 * super-admin panel (Phase 7) reads from here for delivery dashboards.
 */
class MessageLog extends Model
{
    /** @use HasFactory<MessageLogFactory> */
    use HasFactory, HasUuids;

    protected $table = 'message_log';

    public $timestamps = false;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'message_type',
        'direction',
        'recipient_type',
        'recipient_id',
        'recipient_contact',
        'recipient_name',
        'subject',
        'body',
        'attachments',
        'provider_message_id',
        'template_used',
        'template_variables',
        'status',
        'status_details',
        'error_code',
        'error_message',
        'cost',
        'cost_currency',
        'reference_type',
        'reference_id',
        'sent_at',
        'delivered_at',
        'read_at',
        'failed_at',
        'retry_count',
        'max_retries',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'attachments' => 'array',
            'template_variables' => 'array',
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'read_at' => 'datetime',
            'failed_at' => 'datetime',
            'created_at' => 'datetime',
            'cost' => 'decimal:4',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(MessageTemplate::class, 'template_used');
    }
}
