<?php

namespace App\Observers;

use App\Models\InventoryTransaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InventoryTransactionObserver
{
    /**
     * Direction of effect on inventory.quantity_in_stock per transaction_type.
     * `adjustment` keeps the caller's sign; negative quantity removes stock.
     */
    private const POSITIVE = ['purchase', 'return', 'adjustment'];

    private const NEGATIVE = ['sale', 'consumption', 'expired', 'damaged', 'transfer'];

    public function creating(InventoryTransaction $tx): void
    {
        if (empty($tx->performed_by) && Auth::check()) {
            $tx->performed_by = Auth::id();
        }
    }

    public function created(InventoryTransaction $tx): void
    {
        $delta = $this->resolveDelta($tx);

        if ($delta === null) {
            return;
        }

        // Atomic UPDATE — avoids the read-then-write race that would lose
        // concurrent transactions writing against the same inventory row.
        DB::table('inventory')
            ->where('id', $tx->inventory_id)
            ->update([
                'quantity_in_stock' => DB::raw('quantity_in_stock + ('.((float) $delta).')'),
                'updated_at' => now(),
            ]);
    }

    private function resolveDelta(InventoryTransaction $tx): ?float
    {
        if ($tx->transaction_type === 'reversal' && $tx->reverses_id !== null) {
            $original = InventoryTransaction::query()->whereKey($tx->reverses_id)->first();
            if ($original === null) {
                return null;
            }
            $originalDelta = $this->resolveDelta($original);

            return $originalDelta === null ? null : -$originalDelta;
        }

        if (in_array($tx->transaction_type, self::POSITIVE, true)) {
            return (float) $tx->quantity;
        }

        if (in_array($tx->transaction_type, self::NEGATIVE, true)) {
            return -abs((float) $tx->quantity);
        }

        return null;
    }
}
