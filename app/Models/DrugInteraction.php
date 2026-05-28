<?php

namespace App\Models;

use Database\Factories\DrugInteractionFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pair of medications with a known clinical interaction. The schema enforces
 * `medication_id_1 < medication_id_2` so each unordered pair has exactly one
 * row — always sort the two UUIDs before inserting.
 *
 * The table has no `updated_at`; rows are effectively immutable reference
 * data (re-seed if interaction catalogues change).
 */
class DrugInteraction extends Model
{
    /** @use HasFactory<DrugInteractionFactory> */
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    public const UPDATED_AT = null;

    protected $fillable = [
        'medication_id_1',
        'medication_id_2',
        'severity',
        'interaction_type',
        'description',
        'recommendation',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function medicationOne(): BelongsTo
    {
        return $this->belongsTo(Medication::class, 'medication_id_1');
    }

    public function medicationTwo(): BelongsTo
    {
        return $this->belongsTo(Medication::class, 'medication_id_2');
    }
}
