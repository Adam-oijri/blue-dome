<?php

namespace App\Models;

use Database\Factories\InventoryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Inventory extends Model
{
    /** @use HasFactory<InventoryFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'inventory';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'branch_id',
        'medication_id',
        'item_code',
        'item_name',
        'category',
        'batch_number',
        'serial_number',
        'expiration_date',
        'quantity_in_stock',
        'min_stock_level',
        'max_stock_level',
        'reorder_point',
        'unit',
        'purchase_price',
        'selling_price',
        'currency',
        'supplier_id',
        'location_in_clinic',
        'requires_refrigeration',
        'is_active',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expiration_date' => 'date',
            'quantity_in_stock' => 'decimal:2',
            'min_stock_level' => 'decimal:2',
            'max_stock_level' => 'decimal:2',
            'reorder_point' => 'decimal:2',
            'purchase_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'requires_refrigeration' => 'boolean',
            'is_active' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'supplier_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function scopeForCurrentClinic(Builder $query): Builder
    {
        $clinicId = DB::selectOne('SELECT fn_current_clinic_id() AS id')->id;

        return $query->where('clinic_id', $clinicId);
    }
}
