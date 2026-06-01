<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Http\Requests\Invoice\UpdateInvoiceRequest;
use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Clinic-scoped invoice management for the super-admin panel. The {clinic}
 * route binding is the billing target for every write.
 */
class InvoiceController extends Controller
{
    public function index(Request $request, string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('viewAny', Invoice::class);

        $query = Invoice::query()
            ->where('clinic_id', $clinic->id)
            ->select(['id', 'clinic_id', 'invoice_number', 'patient_id', 'invoice_date', 'due_date', 'currency', 'total', 'paid_amount', 'balance_due', 'status'])
            ->with(['patient:id,first_name,last_name,patient_code'])
            ->latest('invoice_date');

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        return Inertia::render('panels/super-admin/clinics/invoices/index', [
            'clinic' => $clinic->only(['id', 'name']),
            'invoices' => $query->paginate(25)->withQueryString(),
            'filters' => ['status' => $status ?: null],
            'patients' => Patient::query()
                ->where('clinic_id', $clinic->id)
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'patient_code']),
        ]);
    }

    public function create(string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('create', Invoice::class);

        return Inertia::render('panels/super-admin/clinics/invoices/create', [
            'clinic' => $clinic->only(['id', 'name']),
            'patients' => Patient::query()
                ->where('clinic_id', $clinic->id)
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'patient_code']),
        ]);
    }

    public function store(StoreInvoiceRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);

        $validated = $request->validated();
        $items = $validated['items'];
        unset($validated['items']);

        $subtotal = array_sum(array_map(
            static fn (array $item) => ($item['quantity'] * $item['unit_price']) - ($item['discount_amount'] ?? 0),
            $items
        ));

        DB::transaction(function () use ($validated, $items, $subtotal, $clinic): Invoice {
            $invoice = Invoice::create($validated + [
                'clinic_id' => $clinic->id,
                'currency' => $validated['currency'] ?? 'MAD',
                'subtotal' => $subtotal,
                'status' => $validated['status'] ?? 'pending',
            ]);

            foreach ($items as $item) {
                $invoice->items()->create($item);
            }

            return $invoice->refresh();
        });

        return back()->with('toast', ['type' => 'success', 'message' => __('invoices.created')]);
    }

    public function show(string $locale, Clinic $clinic, Invoice $invoice): Response
    {
        unset($locale);
        abort_unless($invoice->clinic_id === $clinic->id, 404);
        $this->authorize('view', $invoice);

        $invoice->load([
            'patient:id,first_name,last_name,patient_code',
            'items',
            'payments' => fn ($q) => $q->latest('payment_date'),
        ]);

        return Inertia::render('panels/super-admin/clinics/invoices/show', [
            'clinic' => $clinic->only(['id', 'name']),
            'invoice' => $invoice,
        ]);
    }

    public function edit(string $locale, Clinic $clinic, Invoice $invoice): Response
    {
        unset($locale);
        abort_unless($invoice->clinic_id === $clinic->id, 404);
        $this->authorize('update', $invoice);

        return Inertia::render('panels/super-admin/clinics/invoices/edit', [
            'clinic' => $clinic->only(['id', 'name']),
            'invoice' => $invoice->only(['id', 'invoice_number', 'invoice_date', 'due_date', 'status', 'notes', 'discount_amount', 'tax_percentage']),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, string $locale, Clinic $clinic, Invoice $invoice): RedirectResponse
    {
        unset($locale);
        abort_unless($invoice->clinic_id === $clinic->id, 404);

        $invoice->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('invoices.updated')]);

        return to_route('super-admin.clinics.invoices.show', ['clinic' => $clinic->id, 'invoice' => $invoice->id]);
    }

    public function destroy(string $locale, Clinic $clinic, Invoice $invoice): RedirectResponse
    {
        unset($locale);
        abort_unless($invoice->clinic_id === $clinic->id, 404);
        $this->authorize('delete', $invoice);

        $invoice->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('invoices.deleted')]);

        return to_route('super-admin.clinics.invoices.index', ['clinic' => $clinic->id]);
    }
}
