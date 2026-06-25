<?php

namespace App\Policies;

use App\Models\Prescription;
use App\Models\User;

class PrescriptionPolicy
{
    public function viewAny(User $actor): bool
    {
        // Clinical separation: prescriptions are the treating doctor's domain;
        // the secretary/clinic manager has no access. Super admin retained for
        // cross-clinic oversight.
        return in_array($actor->role, ['super_admin', 'doctor'], true);
    }

    public function view(User $actor, Prescription $prescription): bool
    {
        // Phase 8: any doctor (or super admin) reads any prescription
        // regardless of origin clinic. The secretary is excluded.
        return in_array($actor->role, ['super_admin', 'doctor'], true);
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
