<?php

namespace App\Models;

use Database\Factories\SecretaryChecklistCustomItemFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A recurring checklist item a secretary defined for themselves. Its UUID is
 * used as the `item_key` of the daily completion rows in
 * secretary_checklist_items.
 */
class SecretaryChecklistCustomItem extends Model
{
    /** @use HasFactory<SecretaryChecklistCustomItemFactory> */
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'user_id',
        'label',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
