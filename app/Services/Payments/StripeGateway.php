<?php

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Exceptions\NotImplementedException;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Stub for Stripe. Same status as CmiGateway — see that file for context.
 * Database CHECK constraint excludes 'stripe' until this gateway ships.
 */
class StripeGateway implements PaymentGateway
{
    public function charge(Invoice $invoice, array $details): PaymentResult
    {
        throw NotImplementedException::forGateway('Stripe');
    }

    public function refund(Payment $payment): PaymentResult
    {
        throw NotImplementedException::forGateway('Stripe');
    }

    public function verifyWebhook(Request $request): bool
    {
        throw NotImplementedException::forGateway('Stripe');
    }
}
