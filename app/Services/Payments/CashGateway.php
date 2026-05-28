<?php

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Records a cash payment against an invoice. Marks payment_status=completed
 * immediately — the trigger fn_sync_invoice_paid_amount() re-aggregates
 * invoices.paid_amount on insert, and the controller updates invoice.status
 * after this returns (paid vs partially_paid).
 *
 * No external integration. No webhooks. `verifyWebhook()` is a no-op that
 * always returns true so the interface stays uniform.
 */
class CashGateway implements PaymentGateway
{
    public function charge(Invoice $invoice, array $details): PaymentResult
    {
        $payment = DB::transaction(function () use ($invoice, $details): Payment {
            return Payment::create([
                'clinic_id' => $invoice->clinic_id,
                'invoice_id' => $invoice->id,
                'patient_id' => $invoice->patient_id,
                'amount' => $details['amount'],
                'currency' => $invoice->currency,
                'payment_date' => $details['payment_date'] ?? now()->toDateString(),
                'payment_method' => 'cash',
                'payment_status' => 'completed',
                'notes' => $details['notes'] ?? null,
                'received_by' => Auth::id(),
            ]);
        });

        return PaymentResult::ok((string) $payment->id, [
            'payment_id' => $payment->id,
            'payment_number' => $payment->payment_number,
        ]);
    }

    public function refund(Payment $payment): PaymentResult
    {
        $payment->forceFill([
            'payment_status' => 'refunded',
        ])->save();

        return PaymentResult::ok((string) $payment->id, ['refunded' => true]);
    }

    public function verifyWebhook(Request $request): bool
    {
        return true;
    }
}
