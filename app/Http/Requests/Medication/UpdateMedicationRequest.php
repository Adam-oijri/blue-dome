<?php

namespace App\Http\Requests\Medication;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMedicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('medication')) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->user()->clinic_id;
        $medicationId = $this->route('medication')->id;

        return [
            'trade_name' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('medications', 'trade_name')
                    ->where(fn ($query) => $query
                        ->where('clinic_id', $clinicId)
                        ->where('strength', $this->input('strength', $this->route('medication')->strength))
                        ->where('form', $this->input('form', $this->route('medication')->form)))
                    ->whereNull('deleted_at')
                    ->ignore($medicationId),
            ],
            'generic_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'form' => ['sometimes', 'nullable', 'string', 'max:50'],
            'strength' => ['sometimes', 'nullable', 'string', 'max:100'],
            'manufacturer' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'atc_code' => ['sometimes', 'nullable', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
            'requires_prescription' => ['sometimes', 'boolean'],
            'side_effects' => ['sometimes', 'nullable', 'string'],
            'contraindications' => ['sometimes', 'nullable', 'string'],
            'storage_instructions' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
