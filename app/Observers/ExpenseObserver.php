<?php

namespace App\Observers;

use App\Models\Expense;
use App\Services\SequenceService;
use Illuminate\Support\Facades\Auth;

class ExpenseObserver
{
    public function __construct(private readonly SequenceService $sequences) {}

    public function creating(Expense $expense): void
    {
        if (empty($expense->expense_number) && ! empty($expense->clinic_id)) {
            $expense->expense_number = $this->sequences->next(
                $expense->clinic_id,
                'expense_number',
            );
        }

        if (empty($expense->created_by) && Auth::check()) {
            $expense->created_by = Auth::id();
        }
    }
}
