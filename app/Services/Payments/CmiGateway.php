<?php

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Exceptions\NotImplementedException;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Stub for the Moroccan CMI (Centre Monétique Interbancaire) gateway. The
 * database `payments.payment_method` CHECK constraint does NOT include
 * 'cmi' yet — that lands when this gateway becomes real (post-Phase 9).
 *
 * Until then any call raises NotImplementedException so a misconfigured
 * route never silently records a fake payment.
 */
class CmiGateway implements PaymentGateway
{
    public function charge(Invoice $invoice, array $details): PaymentResult
    {
        throw NotImplementedException::forGateway('CMI');
    }

    public function refund(Payment $payment): PaymentResult
    {
        throw NotImplementedException::forGateway('CMI');
    }

    public function verifyWebhook(Request $request): bool
    {
        throw NotImplementedException::forGateway('CMI');
    }
}
