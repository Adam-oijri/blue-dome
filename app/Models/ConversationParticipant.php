<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Membership of a user in a conversation, with their per-thread read
 * watermark (`last_read_at`) used to compute unread counts.
 */
class ConversationParticipant extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'clinic_id',
        'conversation_id',
        'user_id',
        'display_name',
        'last_read_at',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_read_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
