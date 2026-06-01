<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inventory\StoreInventoryRequest;
use App\Http\Requests\Inventory\UpdateInventoryRequest;
use App\Models\Branch;
use App\Models\Inventory;
use App\Models\Medication;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Inventory::class);

        $query = Inventory::query()
            ->select(['id', 'clinic_id', 'item_code', 'item_name', 'category', 'quantity_in_stock', 'min_stock_level', 'expiration_date', 'unit', 'is_active', 'notes'])
            ->with(['supplier:id,vendor_name'])
            ->orderBy('item_name');

        if ($request->user()->role !== 'super_admin') {
            $query->where('clinic_id', $request->user()->clinic_id);
        }

        if ($category = $request->string('category')->trim()->toString()) {
            $query->where('category', $category);
        }

        if ($branch = $request->string('branch')->trim()->toString()) {
            $query->where('branch_id', $branch);
        }

        $clinicId = $request->user()->clinic_id;

        return Inertia::render('inventory/index', [
            'inventory' => $query->paginate(25)->withQueryString(),
            'medications' => Medication::query()
                ->where('clinic_id', $clinicId)
                ->where('is_active', true)
                ->orderBy('trade_name')
                ->get(['id', 'trade_name as name']),
            'vendors' => Vendor::query()
                ->where('clinic_id', $clinicId)
                ->orderBy('vendor_name')
                ->get(['id', 'vendor_name as name']),
            'branches' => Branch::query()
                ->where('clinic_id', $clinicId)
                ->orderBy('branch_name')
                ->get(['id', 'branch_name as name']),
            'filters' => ['category' => $category ?: null, 'branch' => $branch ?: null],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Inventory::class);

        return Inertia::render('inventory/create');
    }

    public function store(StoreInventoryRequest $request): RedirectResponse
    {
        Inventory::create($request->validated() + [
            'clinic_id' => $request->user()->clinic_id,
            'currency' => $request->input('currency', 'MAD'),
        ]);

        return back()
            ->with('toast', ['type' => 'success', 'message' => __('inventory.created')]);
    }

    public function show(string $locale, Inventory $inventory): Response
    {
        unset($locale);
        $this->authorize('view', $inventory);

        $inventory->load(['supplier:id,vendor_name', 'medication:id,trade_name,strength']);

        return Inertia::render('inventory/show', [
            'inventory' => $inventory,
            'transactions' => Inertia::defer(
                fn () => $inventory->transactions()
                    ->latest('transaction_date')
                    ->limit(50)
                    ->get(['id', 'transaction_type', 'quantity', 'unit_price', 'total_amount', 'transaction_date', 'notes'])
            ),
        ]);
    }

    public function edit(string $locale, Inventory $inventory): Response
    {
        unset($locale);
        $this->authorize('update', $inventory);

        return Inertia::render('inventory/edit', [
            'inventory' => $inventory,
        ]);
    }

    public function update(UpdateInventoryRequest $request, string $locale, Inventory $inventory): RedirectResponse
    {
        unset($locale);
        $inventory->update($request->validated());

        return back()
            ->with('toast', ['type' => 'success', 'message' => __('inventory.updated')]);
    }

    public function destroy(string $locale, Inventory $inventory): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $inventory);

        $inventory->delete();

        return redirect()
            ->route('inventory.index')
            ->with('toast', ['type' => 'success', 'message' => __('inventory.deleted')]);
    }

    public function alerts(Request $request): Response
    {
        $this->authorize('viewAny', Inventory::class);

        $clinicId = $request->user()->clinic_id;

        // v_inventory_alerts is a Postgres view that filters inventory to
        // low-stock / expiring-soon rows and tags each with an `alert_type`.
        $rows = DB::table('v_inventory_alerts')
            ->where('clinic_id', $clinicId)
            ->select(['id', 'item_code', 'item_name', 'category', 'quantity_in_stock', 'min_stock_level', 'expiration_date', 'alert_type'])
            ->orderByRaw("CASE alert_type WHEN 'out_of_stock' THEN 1 WHEN 'expired' THEN 2 WHEN 'low_stock' THEN 3 WHEN 'expiring_soon' THEN 4 ELSE 5 END")
            ->get();

        return Inertia::render('inventory/alerts', [
            'alerts' => $rows,
        ]);
    }
}
