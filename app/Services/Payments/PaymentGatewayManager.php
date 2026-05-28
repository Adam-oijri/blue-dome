<?php

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use InvalidArgumentException;

/**
 * Resolves a PaymentGateway implementation by method name. Controllers call
 * `$manager->for('cash')->charge(...)` so the dispatch table lives in one
 * place; adding CMI / Stripe later only means flipping their stub classes
 * to real ones and registering them here.
 */
class PaymentGatewayManager
{
    public function __construct(
        private readonly CashGateway $cash,
        private readonly BankWireGateway $bankWire,
        private readonly CmiGateway $cmi,
        private readonly StripeGateway $stripe,
    ) {}

    public function for(string $method): PaymentGateway
    {
        return match ($method) {
            'cash' => $this->cash,
            'bank_wire' => $this->bankWire,
            'cmi' => $this->cmi,
            'stripe' => $this->stripe,
            default => throw new InvalidArgumentException("Unknown payment method: {$method}"),
        };
    }
}
