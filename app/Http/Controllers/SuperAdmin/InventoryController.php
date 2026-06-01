<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreInventoryTransactionRequest;
use App\Http\Requests\SuperAdmin\Inventory\StoreInventoryRequest;
use App\Http\Requests\SuperAdmin\Inventory\UpdateInventoryRequest;
use App\Models\Clinic;
use App\Models\Inventory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Clinic-scoped inventory management for the super-admin panel. Every action
 * resolves its target clinic from the {clinic} route binding, so writes always
 * land on that clinic — never the super-admin's own ("Platform") clinic.
 */
class InventoryController extends Controller
{
    public function index(Request $request, string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('viewAny', Inventory::class);

        $query = Inventory::query()
            ->where('clinic_id', $clinic->id)
            ->select(['id', 'clinic_id', 'item_code', 'item_name', 'category', 'quantity_in_stock', 'min_stock_level', 'expiration_date', 'unit', 'is_active'])
            ->with(['supplier:id,vendor_name'])
            ->orderBy('item_name');

        if ($category = $request->string('category')->trim()->toString()) {
            $query->where('category', $category);
        }

        return Inertia::render('panels/super-admin/clinics/inventory/index', [
            'clinic' => $clinic->only(['id', 'name']),
            'inventory' => $query->paginate(25)->withQueryString(),
            'filters' => ['category' => $category ?: null],
        ]);
    }

    public function create(string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('create', Inventory::class);

        return Inertia::render('panels/super-admin/clinics/inventory/edit', [
            'clinic' => $clinic->only(['id', 'name']),
            'inventory' => null,
        ]);
    }

    public function store(StoreInventoryRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);

        Inventory::create($request->validated() + [
            'clinic_id' => $clinic->id,
            'currency' => $request->input('currency', 'MAD'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('inventory.created')]);

        return to_route('super-admin.clinics.inventory.index', ['clinic' => $clinic->id]);
    }

    public function edit(string $locale, Clinic $clinic, Inventory $inventory): Response
    {
        unset($locale);
        abort_unless($inventory->clinic_id === $clinic->id, 404);
        $this->authorize('update', $inventory);

        return Inertia::render('panels/super-admin/clinics/inventory/edit', [
            'clinic' => $clinic->only(['id', 'name']),
            'inventory' => $inventory,
        ]);
    }

    public function update(UpdateInventoryRequest $request, string $locale, Clinic $clinic, Inventory $inventory): RedirectResponse
    {
        unset($locale);
        abort_unless($inventory->clinic_id === $clinic->id, 404);

        $inventory->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('inventory.updated')]);

        return to_route('super-admin.clinics.inventory.index', ['clinic' => $clinic->id]);
    }

    public function destroy(string $locale, Clinic $clinic, Inventory $inventory): RedirectResponse
    {
        unset($locale);
        abort_unless($inventory->clinic_id === $clinic->id, 404);
        $this->authorize('delete', $inventory);

        $inventory->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('inventory.deleted')]);

        return back();
    }

    public function storeTransaction(StoreInventoryTransactionRequest $request, string $locale, Clinic $clinic, Inventory $inventory): RedirectResponse
    {
        unset($locale);
        abort_unless($inventory->clinic_id === $clinic->id, 404);

        DB::transaction(function () use ($request, $inventory): void {
            $inventory->transactions()->create($request->validated() + [
                'clinic_id' => $inventory->clinic_id,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('inventory.transaction_recorded')]);

        return back();
    }
}
