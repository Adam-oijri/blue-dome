<?php

namespace App\Http\Requests\LabOrder;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLabOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('lab_order')) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->user()->clinic_id;

        return [
            'order_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:draft,pending,sample_collected,in_progress,completed,partially_completed,cancelled,rejected'],
            'urgency' => ['sometimes', 'in:routine,urgent,stat'],
            'fasting_required' => ['sometimes', 'boolean'],
            'clinical_diagnosis' => ['sometimes', 'nullable', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'external_lab_id' => [
                'sometimes', 'nullable', 'uuid',
                Rule::exists('external_labs', 'id')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ];
    }
}
