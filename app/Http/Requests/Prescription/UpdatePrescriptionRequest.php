<?php

namespace App\Http\Requests\Prescription;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('prescription')) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->user()->clinic_id;

        return [
            'prescription_date' => ['sometimes', 'date'],
            'expiry_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:prescription_date'],
            'status' => ['sometimes', 'in:draft,active,completed,discontinued,cancelled,expired'],
            'diagnosis_related' => ['sometimes', 'nullable', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'appointment_id' => [
                'sometimes', 'nullable', 'uuid',
                Rule::exists('appointments', 'id')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
        ];
    }
}
