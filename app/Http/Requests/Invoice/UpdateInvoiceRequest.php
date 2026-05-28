<?php

namespace App\Http\Requests\Invoice;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('invoice')) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'invoice_date' => ['sometimes', 'date'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'discount_amount' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'tax_percentage' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
            'status' => ['sometimes', 'in:draft,pending,paid,partially_paid,overdue,cancelled,refunded,collections'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'payment_terms' => ['sometimes', 'nullable', 'string', 'max:100'],
            'insurance_claim_number' => ['sometimes', 'nullable', 'string', 'max:100'],
            'insurance_coverage_percentage' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
