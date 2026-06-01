<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'secretary'], true);
    }

    public function view(User $actor, Payment $payment): bool
    {
        return $actor->role === 'super_admin'
            || $actor->clinic_id === $payment->clinic_id;
    }

    public function create(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'secretary'], true);
    }

    /**
     * The clinic's secretary (manager) or a super_admin (cross-tenant) can refund.
     */
    public function refund(User $actor, Payment $payment): bool
    {
        return $actor->role === 'super_admin'
            || ($actor->clinic_id === $payment->clinic_id
                && $actor->role === 'secretary');
    }
}
