<?php

namespace App\Models;

use Database\Factories\PrescriptionItemFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * No `updated_at` and no soft delete in the schema — items are append-only.
 * To edit a prescription, replace its item set in the same transaction
 * the controller uses for store/update.
 */
class PrescriptionItem extends Model
{
    /** @use HasFactory<PrescriptionItemFactory> */
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    public const UPDATED_AT = null;

    protected $fillable = [
        'prescription_id',
        'medication_id',
        'medication_name',
        'dosage',
        'frequency_per_day',
        'interval_hours',
        'frequency_text',
        'duration_days',
        'route',
        'instructions',
        'quantity',
        'unit',
        'refills',
        'start_date',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'frequency_per_day' => 'integer',
            'interval_hours' => 'integer',
            'duration_days' => 'integer',
            'quantity' => 'integer',
            'refills' => 'integer',
            'start_date' => 'date',
            'created_at' => 'datetime',
        ];
    }

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }
}
