<?php

namespace App\Policies;

use App\Models\User;

/**
 * Enforces the staff-management corner of the permission matrix
 * (IMPLEMENTATION_GUIDE.md §permission rules):
 *
 *   - secretary manages doctors / secretaries within their own clinic.
 *   - super_admin can manage anyone, anywhere.
 *   - doctors can only see / update themselves.
 *
 * Account-creation caps live in the FormRequests so the user gets a clean
 * HTTP 422; the DB trigger fn_enforce_user_role_caps is the last-line
 * defense and would manifest as a 500.
 */
class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin'], true);
    }

    public function view(User $actor, User $target): bool
    {
        if ($actor->role === 'super_admin') {
            return true;
        }

        if ($actor->clinic_id !== $target->clinic_id) {
            return false;
        }

        return $actor->role === 'secretary' || $actor->id === $target->id;
    }

    public function createDoctor(User $actor): bool
    {
        return $actor->role === 'secretary';
    }

    public function createSecretary(User $actor): bool
    {
        return $actor->role === 'secretary';
    }

    public function update(User $actor, User $target): bool
    {
        if ($actor->role === 'super_admin') {
            return true;
        }

        if ($actor->clinic_id !== $target->clinic_id) {
            return false;
        }

        if ($actor->id === $target->id) {
            return true;
        }

        return $actor->role === 'secretary'
            && in_array($target->role, ['doctor', 'secretary'], true);
    }

    public function delete(User $actor, User $target): bool
    {
        if ($actor->role === 'super_admin') {
            return true;
        }

        if ($actor->clinic_id !== $target->clinic_id) {
            return false;
        }

        if ($actor->id === $target->id) {
            return false;
        }

        return $actor->role === 'secretary'
            && in_array($target->role, ['doctor', 'secretary'], true);
    }

    public function restore(User $actor, User $target): bool
    {
        return $this->delete($actor, $target);
    }
}
