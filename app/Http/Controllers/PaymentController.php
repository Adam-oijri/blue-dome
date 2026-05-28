<?php

namespace App\Http\Controllers;

use App\Http\Requests\Payment\StorePaymentRequest;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Payments\PaymentGatewayManager;
use Illuminate\Http\RedirectResponse;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentGatewayManager $gateways) {}

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $invoice = Invoice::query()->whereKey($data['invoice_id'])->firstOrFail();

        $this->authorize('recordPayment', $invoice);

        $result = $this->gateways
            ->for($data['payment_method'])
            ->charge($invoice, $data);

        if (! $result->success) {
            return back()->with('toast', ['type' => 'error', 'message' => $result->message ?? __('payments.failed')]);
        }

        // Trigger fn_sync_invoice_paid_amount() already updated paid_amount;
        // refresh and flip the invoice status based on the new totals.
        $invoice = $invoice->fresh();
        $newStatus = $this->resolveInvoiceStatus($invoice);

        if ($newStatus !== $invoice->status) {
            $invoice->forceFill(['status' => $newStatus])->save();
        }

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('toast', ['type' => 'success', 'message' => __('payments.recorded')]);
    }

    public function refund(string $locale, Payment $payment): RedirectResponse
    {
        unset($locale);
        $this->authorize('refund', $payment);

        $result = $this->gateways
            ->for($payment->payment_method)
            ->refund($payment);

        if (! $result->success) {
            return back()->with('toast', ['type' => 'error', 'message' => $result->message ?? __('payments.refund_failed')]);
        }

        // Same status reconciliation after the trigger fires.
        $invoice = $payment->invoice->fresh();
        $newStatus = $this->resolveInvoiceStatus($invoice);
        if ($newStatus !== $invoice->status) {
            $invoice->forceFill(['status' => $newStatus])->save();
        }

        return redirect()
            ->route('invoices.show', $payment->invoice_id)
            ->with('toast', ['type' => 'success', 'message' => __('payments.refunded')]);
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
