<?php

namespace App\Models;

use Database\Factories\LabOrderItemFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabOrderItem extends Model
{
    /** @use HasFactory<LabOrderItemFactory> */
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    public const UPDATED_AT = null;

    protected $fillable = [
        'lab_order_id',
        'test_code',
        'test_name',
        'test_category',
        'specimen_type',
        'result',
        'result_date',
        'result_status',
        'normal_range',
        'normal_range_min',
        'normal_range_max',
        'is_abnormal',
        'is_critical',
        'unit',
        'methodology',
        'attachment_url',
        'notes',
        'reviewed_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'result_date' => 'date',
            'is_abnormal' => 'boolean',
            'is_critical' => 'boolean',
            'normal_range_min' => 'decimal:2',
            'normal_range_max' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function labOrder(): BelongsTo
    {
        return $this->belongsTo(LabOrder::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
