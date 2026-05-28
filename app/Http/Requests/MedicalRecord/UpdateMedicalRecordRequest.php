<?php

namespace App\Http\Requests\MedicalRecord;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('medical_record')) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'record_date' => ['sometimes', 'date'],
            'record_type' => ['sometimes', 'in:note,progress,lab_result,imaging,procedure,vaccination,surgery,discharge_summary,referral,other'],
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'content' => ['sometimes', 'nullable', 'string'],
            'subjective' => ['sometimes', 'nullable', 'string'],
            'objective' => ['sometimes', 'nullable', 'string'],
            'assessment' => ['sometimes', 'nullable', 'string'],
            'plan' => ['sometimes', 'nullable', 'string'],
            'diagnosis_codes' => ['sometimes', 'nullable', 'array'],
            'diagnosis_codes.*' => ['string', 'max:20'],
            'procedure_codes' => ['sometimes', 'nullable', 'array'],
            'procedure_codes.*' => ['string', 'max:20'],
            'is_confidential' => ['sometimes', 'boolean'],
        ];
    }
}
