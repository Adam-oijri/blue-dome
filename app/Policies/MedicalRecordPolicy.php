<?php

namespace App\Policies;

use App\Models\MedicalRecord;
use App\Models\User;

class MedicalRecordPolicy
{
    /**
     * Only doctors edit their own records, and only within the 24h
     * post-creation window. Tracked here rather than in a FormRequest so
     * the rule is enforced uniformly whether the entry point is the
     * controller, an action, or an artisan command.
     */
    private const AUTHOR_EDIT_WINDOW_HOURS = 24;

    public function viewAny(User $actor): bool
    {
        return $actor->role === 'doctor';
    }

    public function view(User $actor, MedicalRecord $record): bool
    {
        // Phase 8: clinic-membership branch removed — any doctor (or
        // super_admin) reads any record, regardless of origin clinic. The
        // matrix still restricts medical-record viewing to the doctor role.
        return $actor->role === 'super_admin' || $actor->role === 'doctor';
    }

    public function create(User $actor): bool
    {
        return $actor->role === 'doctor';
    }

    public function update(User $actor, MedicalRecord $record): bool
    {
        // Phase 8: the author-edit window survives unchanged because the
        // author is identified by user_id, not by clinic. A doctor who
        // changes clinics mid-shift can still edit their own record within
        // the 24h window.
        if ($actor->role !== 'doctor') {
            return false;
        }

        if ($actor->id !== $record->recorded_by) {
            return false;
        }

        if ($record->created_at === null) {
            return true;
        }

        return $record->created_at->diffInHours(now()) < self::AUTHOR_EDIT_WINDOW_HOURS;
    }

    public function delete(User $actor, MedicalRecord $record): bool
    {
        return false;
    }

    public function sign(User $actor, MedicalRecord $record): bool
    {
        return $actor->role === 'doctor' && ! $record->is_signed;
    }
}
