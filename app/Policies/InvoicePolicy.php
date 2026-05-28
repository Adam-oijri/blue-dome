<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'secretary'], true);
    }

    public function view(User $actor, Invoice $invoice): bool
    {
        return $actor->role === 'super_admin'
            || $actor->clinic_id === $invoice->clinic_id;
    }

    public function create(User $actor): bool
    {
        return in_array($actor->role, ['secretary'], true);
    }

    public function update(User $actor, Invoice $invoice): bool
    {
        return $actor->clinic_id === $invoice->clinic_id
            && in_array($actor->role, ['secretary'], true);
    }

    public function recordPayment(User $actor, Invoice $invoice): bool
    {
        return $this->update($actor, $invoice);
    }

    public function refundPayment(User $actor, Invoice $invoice): bool
    {
        return $actor->clinic_id === $invoice->clinic_id
            && $actor->role === 'secretary';
    }

    public function delete(User $actor, Invoice $invoice): bool
    {
        return $actor->clinic_id === $invoice->clinic_id
            && $actor->role === 'secretary';
    }
}
