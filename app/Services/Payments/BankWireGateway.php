<?php

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Records a bank-wire payment after the secretary has manually reconciled
 * the deposit. `reference_number` is the wire/transfer reference the patient
 * supplied. Same trigger-driven paid_amount sync as cash.
 */
class BankWireGateway implements PaymentGateway
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
                'payment_method' => 'bank_wire',
                'payment_status' => 'completed',
                'reference_number' => $details['reference_number'] ?? null,
                'bank_name' => $details['bank_name'] ?? null,
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
