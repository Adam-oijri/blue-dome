<?php

namespace App\Http\Controllers;

use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Http\Requests\Invoice\UpdateInvoiceRequest;
use App\Models\Invoice;
use App\Models\Patient;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $user = $request->user();
        $isSuperAdmin = $user->role === 'super_admin';

        /** Scope every aggregate to the acting user's clinic (super-admin sees all). */
        $scopeClinic = function ($query) use ($isSuperAdmin, $user) {
            return $isSuperAdmin ? $query : $query->where('clinic_id', $user->clinic_id);
        };

        $query = Invoice::query()
            ->select(['id', 'clinic_id', 'invoice_number', 'patient_id', 'invoice_date', 'due_date', 'currency', 'subtotal', 'total', 'paid_amount', 'balance_due', 'status'])
            ->with(['patient:id,first_name,last_name,patient_code'])
            ->latest('invoice_date');

        $scopeClinic($query);

        if ($patientId = $request->string('patient_id')->trim()->toString()) {
            $query->where('patient_id', $patientId);
        }

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        $today = CarbonImmutable::today();
        $monthStart = $today->startOfMonth()->toDateString();

        $monthTotals = $scopeClinic(Invoice::query())
            ->where('invoice_date', '>=', $monthStart)
            ->selectRaw('COALESCE(SUM(total), 0) AS invoiced, COALESCE(SUM(paid_amount), 0) AS collected')
            ->toBase()
            ->first();

        return Inertia::render('invoices/index', [
            'invoices' => $query->paginate(25)->withQueryString(),
            'patients' => Patient::query()
                ->where('clinic_id', $user->clinic_id)
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'patient_code']),
            'kpis' => [
                'invoiced_mtd' => (float) ($monthTotals->invoiced ?? 0),
                'collected_mtd' => (float) ($monthTotals->collected ?? 0),
                'outstanding' => (float) $scopeClinic(Invoice::query())->where('balance_due', '>', 0)->sum('balance_due'),
                'overdue' => $scopeClinic(Invoice::query())->where('balance_due', '>', 0)->whereDate('due_date', '<', $today)->count(),
            ],
            'filters' => [
                'patient_id' => $patientId ?: null,
                'status' => $status ?: null,
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Invoice::class);

        return Inertia::render('invoices/create');
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $items = $validated['items'];
        unset($validated['items']);

        // Compute subtotal from items so the GENERATED columns line up.
        $subtotal = array_sum(array_map(
            static fn (array $item) => ($item['quantity'] * $item['unit_price']) - ($item['discount_amount'] ?? 0),
            $items
        ));

        DB::transaction(function () use ($request, $validated, $items, $subtotal): void {
            $invoice = Invoice::create($validated + [
                'clinic_id' => $request->user()->clinic_id,
                'currency' => $validated['currency'] ?? 'MAD',
                'subtotal' => $subtotal,
                'status' => $validated['status'] ?? 'pending',
            ]);

            foreach ($items as $item) {
                $invoice->items()->create($item);
            }
        });

        return back()
            ->with('toast', ['type' => 'success', 'message' => __('invoices.created')]);
    }

    public function show(string $locale, Invoice $invoice): Response
    {
        unset($locale);
        $this->authorize('view', $invoice);

        $invoice->load([
            'patient:id,first_name,last_name,patient_code,phone_e164',
            'items',
            'payments' => fn ($q) => $q->latest('payment_date'),
            'createdBy:id,first_name,last_name',
        ]);

        return Inertia::render('invoices/show', [
            'invoice' => $invoice,
        ]);
    }

    public function edit(string $locale, Invoice $invoice): Response
    {
        unset($locale);
        $this->authorize('update', $invoice);

        $invoice->load(['items']);

        return Inertia::render('invoices/edit', [
            'invoice' => $invoice,
        ]);
    }

    public function update(UpdateInvoiceRequest $request, string $locale, Invoice $invoice): RedirectResponse
    {
        unset($locale);
        $invoice->update($request->validated());

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('toast', ['type' => 'success', 'message' => __('invoices.updated')]);
    }

    public function destroy(string $locale, Invoice $invoice): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $invoice);

        $invoice->delete();

        return redirect()
            ->route('invoices.index')
            ->with('toast', ['type' => 'success', 'message' => __('invoices.deleted')]);
    }
}
