<?php

namespace App\Policies;

use App\Models\LabOrder;
use App\Models\User;

class LabOrderPolicy
{
    public function viewAny(User $actor): bool
    {
        // Clinical separation: lab orders are the treating doctor's domain;
        // the secretary/clinic manager has no access. Super admin retained for
        // cross-clinic oversight.
        return in_array($actor->role, ['super_admin', 'doctor'], true);
    }

    public function view(User $actor, LabOrder $labOrder): bool
    {
        // Phase 8: any doctor (or super admin) reads any lab order regardless
        // of origin clinic. The secretary is excluded.
        return in_array($actor->role, ['super_admin', 'doctor'], true);
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
     * Clinical separation: only the treating doctor records results. (The
     * secretary's earlier front-desk result-entry role was removed.)
     */
    public function recordResults(User $actor, LabOrder $labOrder): bool
    {
        return $actor->role === 'doctor';
    }
}
