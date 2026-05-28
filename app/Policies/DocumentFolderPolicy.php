<?php

namespace App\Policies;

use App\Models\DocumentFolder;
use App\Models\User;

class DocumentFolderPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'doctor', 'secretary'], true);
    }

    public function view(User $actor, DocumentFolder $folder): bool
    {
        return $actor->role === 'super_admin'
            || $actor->clinic_id === $folder->clinic_id;
    }

    public function create(User $actor): bool
    {
        return in_array($actor->role, ['secretary'], true);
    }

    public function update(User $actor, DocumentFolder $folder): bool
    {
        return $actor->clinic_id === $folder->clinic_id
            && in_array($actor->role, ['secretary'], true)
            && ! $folder->is_system;
    }

    public function delete(User $actor, DocumentFolder $folder): bool
    {
        return $actor->clinic_id === $folder->clinic_id
            && $actor->role === 'secretary'
            && ! $folder->is_system;
    }
}
