<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * A public newsletter opt-in (landing page). Not tenant-scoped; see the
 * migration for why it's outside RLS.
 */
class NewsletterSubscriber extends Model
{
    use HasUuids;

    protected $table = 'newsletter_subscribers';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'email',
        'locale',
        'status',
        'subscribed_at',
        'unsubscribed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subscribed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }
}
