<?php

namespace App\Models;

use Database\Factories\SecretaryChecklistItemFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A single front-desk checklist item a secretary has marked done for a given
 * day. Presence of the row means "completed"; un-checking deletes it. Scoped to
 * the owning secretary and clinic.
 */
class SecretaryChecklistItem extends Model
{
    /** @use HasFactory<SecretaryChecklistItemFactory> */
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'user_id',
        'checklist_date',
        'item_key',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'checklist_date' => 'date',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
