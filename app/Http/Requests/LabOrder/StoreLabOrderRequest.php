<?php

namespace App\Http\Requests\LabOrder;

use App\Models\LabOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLabOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', LabOrder::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->user()->clinic_id;

        return [
            'patient_id' => [
                // Phase 8: cross-clinic patient_id allowed.
                'required', 'uuid',
                Rule::exists('patients', 'id')->whereNull('deleted_at'),
            ],
            'appointment_id' => [
                // Phase 8: cross-clinic appointment_id allowed.
                'nullable', 'uuid',
                Rule::exists('appointments', 'id')->whereNull('deleted_at'),
            ],
            'external_lab_id' => [
                'nullable', 'uuid',
                Rule::exists('external_labs', 'id')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
            'order_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:draft,pending,sample_collected,in_progress,completed,partially_completed,cancelled,rejected'],
            'urgency' => ['nullable', 'in:routine,urgent,stat'],
            'fasting_required' => ['nullable', 'boolean'],
            'clinical_diagnosis' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.test_name' => ['required', 'string', 'max:255'],
            'items.*.test_code' => ['nullable', 'string', 'max:50'],
            'items.*.test_category' => ['nullable', 'string', 'max:100'],
            'items.*.specimen_type' => ['nullable', 'string', 'max:100'],
            'items.*.normal_range' => ['nullable', 'string', 'max:255'],
            'items.*.unit' => ['nullable', 'string', 'max:50'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ];
    }
}
