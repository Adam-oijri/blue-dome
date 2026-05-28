<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;

class ExpensePolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role, ['super_admin', 'secretary'], true);
    }

    public function view(User $actor, Expense $expense): bool
    {
        return $actor->role === 'super_admin'
            || $actor->clinic_id === $expense->clinic_id;
    }

    public function create(User $actor): bool
    {
        return $actor->role === 'secretary';
    }

    public function update(User $actor, Expense $expense): bool
    {
        return $actor->clinic_id === $expense->clinic_id
            && $actor->role === 'secretary';
    }

    public function delete(User $actor, Expense $expense): bool
    {
        return $this->update($actor, $expense);
    }
}
