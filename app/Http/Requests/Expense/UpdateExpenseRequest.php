<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('expense')) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'expense_date' => ['sometimes', 'date'],
            'category' => ['sometimes', 'in:rent,utilities,salaries,supplies,equipment,maintenance,marketing,insurance,taxes,licenses,training,travel,miscellaneous'],
            'description' => ['sometimes', 'nullable', 'string'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'payment_status' => ['sometimes', 'in:pending,paid,cancelled'],
            'paid_date' => ['sometimes', 'nullable', 'date'],
            'paid_to' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
