<?php

namespace App\Http\Requests\Medication;

use App\Models\Medication;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMedicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Medication::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->user()->clinic_id;

        return [
            'trade_name' => [
                'required', 'string', 'max:255',
                Rule::unique('medications', 'trade_name')
                    ->where(fn ($query) => $query
                        ->where('clinic_id', $clinicId)
                        ->where('strength', $this->input('strength'))
                        ->where('form', $this->input('form')))
                    ->whereNull('deleted_at'),
            ],
            'generic_name' => ['nullable', 'string', 'max:255'],
            'form' => ['nullable', 'in:tablet,capsule,syrup,injection,cream,drops,inhaler,spray,gel,suppository,other'],
            'strength' => ['nullable', 'string', 'max:100'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'atc_code' => ['nullable', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
            'requires_prescription' => ['nullable', 'boolean'],
            'side_effects' => ['nullable', 'string'],
            'contraindications' => ['nullable', 'string'],
            'storage_instructions' => ['nullable', 'string'],
        ];
    }
}
