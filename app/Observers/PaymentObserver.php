<?php

namespace App\Observers;

use App\Models\Payment;
use App\Services\SequenceService;
use Illuminate\Support\Facades\Auth;

class PaymentObserver
{
    public function __construct(private readonly SequenceService $sequences) {}

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
}
