<?php

namespace App\Policies;

use App\Models\Prescription;
use App\Models\User;

class PrescriptionPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function view(User $actor, Prescription $prescription): bool
    {
        // Phase 8: open to every staff role at any clinic. The previous
        // clinic-membership branch is removed.
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function create(User $actor): bool
    {
        return $actor->role === 'doctor';
    }

    public function update(User $actor, Prescription $prescription): bool
    {
        // Phase 8: clinic check dropped; author check (doctor === prescriber)
        // remains the sole guard.
        return $actor->role === 'doctor'
            && $actor->id === $prescription->doctor_id;
    }

    public function delete(User $actor, Prescription $prescription): bool
    {
        return $this->update($actor, $prescription);
    }
}
