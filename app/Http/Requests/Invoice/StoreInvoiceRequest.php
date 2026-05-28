<?php

namespace App\Http\Requests\Invoice;

use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Invoice::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->user()->clinic_id;

        return [
            'patient_id' => [
                // Phase 8: cross-clinic patient_id allowed. The invoice's
                // clinic_id remains the actor's clinic — billing stays
                // clinic-isolated, the patient is the only globally-visible piece.
                'required', 'uuid',
                Rule::exists('patients', 'id')->whereNull('deleted_at'),
            ],
            'appointment_id' => [
                // Phase 8: cross-clinic appointment_id allowed.
                'nullable', 'uuid',
                Rule::exists('appointments', 'id')->whereNull('deleted_at'),
            ],
            'invoice_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:invoice_date'],
            'currency' => ['nullable', 'string', 'size:3'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'tax_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'status' => ['nullable', 'in:draft,pending,paid,partially_paid,overdue,cancelled,refunded,collections'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_type' => ['required', 'in:consultation,procedure,lab_test,imaging,medication,vaccination,supplies,other'],
            'items.*.description' => ['required', 'string', 'max:500'],
            'items.*.code' => ['nullable', 'string', 'max:50'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.is_insurance_covered' => ['nullable', 'boolean'],
        ];
    }
}
