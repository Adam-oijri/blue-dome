<?php

namespace App\Policies;

use App\Models\Clinic;
use App\Models\User;

/**
 * Cross-tenant clinic access (viewing and management — suspend / restore /
 * update) is super_admin-only. Doctors and secretaries never reach the
 * super-admin panel.
 */
class ClinicPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin'], true);
    }

    public function view(User $actor, Clinic $clinic): bool
    {
        return in_array($actor->role, ['super_admin'], true);
    }

    public function create(User $actor): bool
    {
        return $actor->role === 'super_admin';
    }

    public function suspend(User $actor, Clinic $clinic): bool
    {
        return $actor->role === 'super_admin';
    }

    public function restore(User $actor, Clinic $clinic): bool
    {
        return $actor->role === 'super_admin';
    }

    public function update(User $actor, Clinic $clinic): bool
    {
        return $actor->role === 'super_admin';
    }
}
