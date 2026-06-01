<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function view(User $actor, Appointment $appointment): bool
    {
        // Phase 8: any clinical-staff role at any clinic can view.
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function create(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function update(User $actor, Appointment $appointment): bool
    {
        // Phase 8: clinic-membership branch removed.
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function delete(User $actor, Appointment $appointment): bool
    {
        return $this->update($actor, $appointment);
    }

    public function confirm(User $actor, Appointment $appointment): bool
    {
        return $this->update($actor, $appointment);
    }

    public function followUp(User $actor, Appointment $appointment): bool
    {
        return in_array($actor->role, ['super_admin', 'secretary'], true);
    }
}
