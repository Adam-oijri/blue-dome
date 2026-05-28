<?php

namespace App\Policies;

use App\Models\Medication;
use App\Models\User;

class MedicationPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function view(User $actor, Medication $medication): bool
    {
        return $actor->role === 'super_admin'
            || $actor->clinic_id === $medication->clinic_id;
    }

    public function create(User $actor): bool
    {
        return $actor->role === 'secretary';
    }

    public function update(User $actor, Medication $medication): bool
    {
        return $actor->clinic_id === $medication->clinic_id
            && $actor->role === 'secretary';
    }

    public function delete(User $actor, Medication $medication): bool
    {
        return $this->update($actor, $medication);
    }
}
