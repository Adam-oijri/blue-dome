<?php

namespace App\Http\Controllers;

use App\Http\Requests\Vendor\StoreVendorRequest;
use App\Http\Requests\Vendor\UpdateVendorRequest;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Vendor::class);

        $query = Vendor::query()
            ->select(['id', 'clinic_id', 'vendor_name', 'contact_person', 'phone', 'email', 'category', 'is_active'])
            ->orderBy('vendor_name');

        if ($request->user()->role !== 'super_admin') {
            $query->where('clinic_id', $request->user()->clinic_id);
        }

        return Inertia::render('vendors/index', [
            'vendors' => $query->paginate(25)->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Vendor::class);

        return Inertia::render('vendors/create');
    }

    public function store(StoreVendorRequest $request): RedirectResponse
    {
        $vendor = Vendor::create($request->validated() + [
            'clinic_id' => $request->user()->clinic_id,
        ]);

        return redirect()
            ->route('vendors.show', $vendor)
            ->with('toast', ['type' => 'success', 'message' => __('vendors.created')]);
    }

    public function show(string $locale, Vendor $vendor): Response
    {
        unset($locale);
        $this->authorize('view', $vendor);

        return Inertia::render('vendors/show', [
            'vendor' => $vendor,
        ]);
    }

    public function edit(string $locale, Vendor $vendor): Response
    {
        unset($locale);
        $this->authorize('update', $vendor);

        return Inertia::render('vendors/edit', [
            'vendor' => $vendor,
        ]);
    }

    public function update(UpdateVendorRequest $request, string $locale, Vendor $vendor): RedirectResponse
    {
        unset($locale);
        $vendor->update($request->validated());

        return redirect()
            ->route('vendors.show', $vendor)
            ->with('toast', ['type' => 'success', 'message' => __('vendors.updated')]);
    }

    public function destroy(string $locale, Vendor $vendor): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $vendor);

        $vendor->delete();

        return redirect()
            ->route('vendors.index')
            ->with('toast', ['type' => 'success', 'message' => __('vendors.deleted')]);
    }
}
