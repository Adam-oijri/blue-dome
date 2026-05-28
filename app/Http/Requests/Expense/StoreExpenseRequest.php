<?php

namespace App\Http\Requests\Expense;

use App\Models\Expense;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Expense::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->user()->clinic_id;

        return [
            'expense_date' => ['nullable', 'date'],
            'category' => ['required', 'in:rent,utilities,salaries,supplies,equipment,maintenance,marketing,insurance,taxes,licenses,training,travel,miscellaneous'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'payment_status' => ['nullable', 'in:pending,paid,cancelled'],
            'paid_date' => ['nullable', 'date'],
            'paid_to' => ['nullable', 'string', 'max:255'],
            'vendor_id' => [
                'nullable', 'uuid',
                Rule::exists('vendors', 'id')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
            'is_recurring' => ['nullable', 'boolean'],
            'recurring_frequency' => ['nullable', 'required_if:is_recurring,true', 'in:daily,weekly,monthly,quarterly,yearly'],
            'recurring_end_date' => ['nullable', 'date', 'after:expense_date'],
            'attachment_url' => ['nullable', 'string', 'max:500'],
        ];
    }
}
