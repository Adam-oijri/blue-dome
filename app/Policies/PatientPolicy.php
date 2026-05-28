<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

/**
 * Phase 8 (global-patient-access pivot): the clinic-membership branches were
 * removed from view/update/create/delete. Any staff role at any clinic can
 * see and update a patient — provenance is recorded per-field in `field_changes`.
 *
 * `export` and `erase` keep the origin-clinic constraint as a Loi 09-08 /
 * GDPR carve-out: only the patient's home clinic may produce a portable
 * export or invoke the anonymization flow.
 */
class PatientPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function view(User $actor, Patient $patient): bool
    {
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function create(User $actor): bool
    {
        return in_array($actor->role, ['doctor', 'secretary'], true);
    }

    public function update(User $actor, Patient $patient): bool
    {
        return in_array($actor->role, ['doctor', 'secretary'], true);
    }

    public function delete(User $actor, Patient $patient): bool
    {
        return $actor->role === 'secretary';
    }

    public function export(User $actor, Patient $patient): bool
    {
        return $actor->clinic_id === $patient->clinic_id
            && $actor->role === 'secretary';
    }

    public function erase(User $actor, Patient $patient): bool
    {
        return $actor->clinic_id === $patient->clinic_id
            && $actor->role === 'secretary';
    }
}
