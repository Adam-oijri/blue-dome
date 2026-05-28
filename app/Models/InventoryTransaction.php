<?php

namespace App\Models;

use Database\Factories\InventoryTransactionFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Append-only ledger of stock movements. The InventoryTransactionObserver
 * keeps `inventory.quantity_in_stock` in sync — the schema does not ship
 * a trigger for this so the math lives in app code.
 *
 * The transaction_type drives direction:
 *   purchase / return                       → +quantity
 *   sale / consumption / expired / damaged  → −quantity
 *   transfer                                → −quantity (outgoing leg)
 *   adjustment                              → +quantity (pass negative
 *                                              `quantity` to remove stock)
 *   reversal                                → mirrors `reverses_id`
 */
class InventoryTransaction extends Model
{
    /** @use HasFactory<InventoryTransactionFactory> */
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    public const UPDATED_AT = null;

    protected $fillable = [
        'clinic_id',
        'inventory_id',
        'transaction_type',
        'quantity',
        'unit_price',
        'transaction_date',
        'reference_type',
        'reference_id',
        'reverses_id',
        'batch_number',
        'notes',
        'performed_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'transaction_date' => 'date',
            'created_at' => 'datetime',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    public function reverses(): BelongsTo
    {
        return $this->belongsTo(InventoryTransaction::class, 'reverses_id');
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
