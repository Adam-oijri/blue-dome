<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\Payment\StorePaymentRequest;
use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Payments\PaymentGatewayManager;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/**
 * Clinic-scoped payment recording + refunds for the super-admin panel. The
 * target invoice/payment must belong to the {clinic} route binding.
 */
class PaymentController extends Controller
{
    public function __construct(private readonly PaymentGatewayManager $gateways) {}

    public function store(StorePaymentRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);

        $data = $request->validated();
        $invoice = Invoice::query()->whereKey($data['invoice_id'])->firstOrFail();
        abort_unless($invoice->clinic_id === $clinic->id, 404);

        $this->authorize('recordPayment', $invoice);

        $result = $this->gateways->for($data['payment_method'])->charge($invoice, $data);

        if (! $result->success) {
            return back()->with('toast', ['type' => 'error', 'message' => $result->message ?? __('payments.failed')]);
        }

        $invoice = $invoice->fresh();
        $newStatus = $this->resolveInvoiceStatus($invoice);
        if ($newStatus !== $invoice->status) {
            $invoice->forceFill(['status' => $newStatus])->save();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('payments.recorded')]);

        return to_route('super-admin.clinics.invoices.show', ['clinic' => $clinic->id, 'invoice' => $invoice->id]);
    }

    public function refund(string $locale, Clinic $clinic, Payment $payment): RedirectResponse
    {
        unset($locale);
        abort_unless($payment->clinic_id === $clinic->id, 404);

        $this->authorize('refund', $payment);

        $result = $this->gateways->for($payment->payment_method)->refund($payment);

        if (! $result->success) {
            return back()->with('toast', ['type' => 'error', 'message' => $result->message ?? __('payments.refund_failed')]);
        }

        $invoice = $payment->invoice->fresh();
        $newStatus = $this->resolveInvoiceStatus($invoice);
        if ($newStatus !== $invoice->status) {
            $invoice->forceFill(['status' => $newStatus])->save();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('payments.refunded')]);

        return to_route('super-admin.clinics.invoices.show', ['clinic' => $clinic->id, 'invoice' => $payment->invoice_id]);
    }

    private function resolveInvoiceStatus(Invoice $invoice): string
    {
        $paid = (float) $invoice->paid_amount;
        $total = (float) $invoice->total;

        if ($paid <= 0.0) {
            return in_array($invoice->status, ['draft', 'cancelled'], true) ? $invoice->status : 'pending';
        }

        if ($paid >= $total) {
            return 'paid';
        }

        return 'partially_paid';
    }
}
