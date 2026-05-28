<?php

namespace App\Http\Requests\MedicalRecord;

use App\Models\MedicalRecord;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMedicalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', MedicalRecord::class) ?? false;
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
                // Phase 8: cross-clinic appointment_id allowed (the writer may
                // be a doctor at clinic B documenting a visit logged at
                // clinic A's calendar — both are globally visible).
                'nullable', 'uuid',
                Rule::exists('appointments', 'id')->whereNull('deleted_at'),
            ],
            'record_date' => ['nullable', 'date'],
            'record_type' => ['required', 'in:note,progress,lab_result,imaging,procedure,vaccination,surgery,discharge_summary,referral,other'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'subjective' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
            'assessment' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
            'diagnosis_codes' => ['nullable', 'array'],
            'diagnosis_codes.*' => ['string', 'max:20'],
            'procedure_codes' => ['nullable', 'array'],
            'procedure_codes.*' => ['string', 'max:20'],
            'attachments' => ['nullable', 'array'],
            'is_confidential' => ['nullable', 'boolean'],
        ];
    }
}
