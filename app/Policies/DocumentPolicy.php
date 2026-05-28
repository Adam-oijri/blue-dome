<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function view(User $actor, Document $document): bool
    {
        return $actor->role === 'super_admin'
            || $actor->clinic_id === $document->clinic_id;
    }

    public function create(User $actor): bool
    {
        return in_array($actor->role, ['doctor', 'secretary'], true);
    }

    public function update(User $actor, Document $document): bool
    {
        return $actor->clinic_id === $document->clinic_id
            && in_array($actor->role, ['doctor', 'secretary'], true);
    }

    public function delete(User $actor, Document $document): bool
    {
        return $actor->clinic_id === $document->clinic_id
            && $actor->role === 'secretary';
    }
}
