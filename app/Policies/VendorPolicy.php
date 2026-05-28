<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vendor;

class VendorPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'secretary'], true);
    }

    public function view(User $actor, Vendor $vendor): bool
    {
        return $actor->role === 'super_admin'
            || $actor->clinic_id === $vendor->clinic_id;
    }

    public function create(User $actor): bool
    {
        return $actor->role === 'secretary';
    }

    public function update(User $actor, Vendor $vendor): bool
    {
        return $actor->clinic_id === $vendor->clinic_id
            && $actor->role === 'secretary';
    }

    public function delete(User $actor, Vendor $vendor): bool
    {
        return $this->update($actor, $vendor);
    }
}
