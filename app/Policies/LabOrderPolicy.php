<?php

namespace App\Policies;

use App\Models\LabOrder;
use App\Models\User;

class LabOrderPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function view(User $actor, LabOrder $labOrder): bool
    {
        // Phase 8: clinic-membership branch removed.
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function create(User $actor): bool
    {
        return $actor->role === 'doctor';
    }

    public function update(User $actor, LabOrder $labOrder): bool
    {
        // Phase 8: clinic check dropped; author check remains.
        return $actor->role === 'doctor'
            && $actor->id === $labOrder->doctor_id;
    }

    public function delete(User $actor, LabOrder $labOrder): bool
    {
        return $this->update($actor, $labOrder);
    }

    /**
     * Per the IG permission matrix, secretary or doctor can record results.
     */
    public function recordResults(User $actor, LabOrder $labOrder): bool
    {
        return in_array($actor->role, ['doctor', 'secretary'], true);
    }
}
