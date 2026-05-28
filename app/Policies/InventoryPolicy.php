<?php

namespace App\Policies;

use App\Models\Inventory;
use App\Models\User;

class InventoryPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function view(User $actor, Inventory $inventory): bool
    {
        return $actor->role === 'super_admin'
            || $actor->clinic_id === $inventory->clinic_id;
    }

    public function create(User $actor): bool
    {
        return in_array($actor->role, ['secretary'], true);
    }

    public function update(User $actor, Inventory $inventory): bool
    {
        return $actor->clinic_id === $inventory->clinic_id
            && in_array($actor->role, ['secretary'], true);
    }

    public function delete(User $actor, Inventory $inventory): bool
    {
        return $actor->clinic_id === $inventory->clinic_id
            && $actor->role === 'secretary';
    }

    public function recordTransaction(User $actor, Inventory $inventory): bool
    {
        return $this->update($actor, $inventory);
    }
}
