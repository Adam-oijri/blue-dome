<?php

namespace App\Observers;

use App\Models\Payment;
use App\Services\Notifications\NotificationService;
use App\Services\SequenceService;
use Illuminate\Support\Facades\Auth;

class PaymentObserver
{
    public function __construct(
        private readonly SequenceService $sequences,
        private readonly NotificationService $notifications,
    ) {}

    public function creating(Payment $payment): void
    {
        if (empty($payment->payment_number) && ! empty($payment->clinic_id)) {
            $payment->payment_number = $this->sequences->next(
                $payment->clinic_id,
                'payment_number',
            );
        }

        if (empty($payment->received_by) && Auth::check()) {
            $payment->received_by = Auth::id();
        }
    }

    /**
     * Alert clinic secretaries when a payment is recorded.
     */
    public function created(Payment $payment): void
    {
        $amount = number_format((float) $payment->amount, 2).' '.($payment->currency ?? '');

        $this->notifications->send(
            recipients: $this->notifications->clinicRole($payment->clinic_id, 'secretary'),
            type: 'payment_received',
            params: ['amount' => trim($amount)],
            actionUrl: $payment->invoice_id
                ? route('invoices.show', ['invoice' => $payment->invoice_id])
                : null,
            referenceType: 'Payment',
            referenceId: $payment->id,
        );
    }
}
