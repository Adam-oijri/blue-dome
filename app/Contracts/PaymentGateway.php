<?php

namespace App\Contracts;

use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Payments\PaymentResult;
use Illuminate\Http\Request;

/**
 * Common contract every payment method implements. Cash and bank wire are
 * fully implemented for Phase 5; CMI and Stripe are stub classes whose
 * methods raise NotImplementedException — see IG §forbidden rules.
 */
interface PaymentGateway
{
    /**
     * @param  array<string, mixed>  $details  Method-specific payload from the FormRequest.
     */
    public function charge(Invoice $invoice, array $details): PaymentResult;

    public function refund(Payment $payment): PaymentResult;

    public function verifyWebhook(Request $request): bool;
}
