<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inventory\StoreInventoryTransactionRequest;
use App\Models\Inventory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class InventoryTransactionController extends Controller
{
    public function store(StoreInventoryTransactionRequest $request, string $locale, Inventory $inventory): RedirectResponse
    {
        unset($locale);
        DB::transaction(function () use ($request, $inventory): void {
            $inventory->transactions()->create($request->validated() + [
                'clinic_id' => $inventory->clinic_id,
            ]);
        });

        return redirect()
            ->route('inventory.show', $inventory)
            ->with('toast', ['type' => 'success', 'message' => __('inventory.transaction_recorded')]);
    }
}
