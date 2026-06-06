<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Targeted, per-user in-app notification (the "alerts" half of the dashboard
 * notification feed; the other half is read live from activity_log). Custom,
 * monthly-partitioned table — composite PK (id, created_at) like ActivityLog,
 * but Eloquent treats `id` as the logical key. `created_by` is the actor.
 */
class Notification extends Model
{
    use HasUuids;

    protected $table = 'notifications';

    public $timestamps = false;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'user_id',
        'type',
        'title',
        'message',
        'is_read',
        'is_important',
        'action_url',
        'reference_type',
        'reference_id',
        'read_at',
        'created_by',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'is_important' => 'boolean',
            'read_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @param  Builder<Notification>  $query
     */
    public function scopeForUser(Builder $query, string $userId): void
    {
        $query->where('user_id', $userId);
    }

    /**
     * @param  Builder<Notification>  $query
     */
    public function scopeUnread(Builder $query): void
    {
        $query->where('is_read', false);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
