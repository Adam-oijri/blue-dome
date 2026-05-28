<?php

namespace App\Services\Payments;

/**
 * Lightweight result object that every PaymentGateway returns. Controllers
 * branch on `$success` and surface `$message` / `$transactionId` to the UI.
 */
final class PaymentResult
{
    public function __construct(
        public readonly bool $success,
        public readonly ?string $transactionId = null,
        public readonly ?string $message = null,
        /** @var array<string, mixed> */
        public readonly array $metadata = [],
    ) {}

    public static function ok(?string $transactionId = null, array $metadata = []): self
    {
        return new self(true, $transactionId, null, $metadata);
    }

    public static function failed(string $message, array $metadata = []): self
    {
        return new self(false, null, $message, $metadata);
    }
}
