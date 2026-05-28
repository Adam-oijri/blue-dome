<?php

namespace App\Http\Requests\Document;

use App\Models\Document;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Document::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->user()->clinic_id;

        return [
            'file' => ['required', 'file', 'max:20480'],
            'document_name' => ['required', 'string', 'max:255'],
            'document_type' => ['required', 'in:patient_record,lab_result,imaging,prescription,invoice,consent_form,insurance_card,national_id,doctor_license,clinic_license,contract,report,certificate,medical_report,discharge_summary,other'],
            'entity_type' => ['required', 'string', 'max:50'],
            'entity_id' => ['required', 'uuid'],
            'folder_id' => [
                'nullable', 'uuid',
                Rule::exists('document_folders', 'id')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
            'description' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'is_private' => ['nullable', 'boolean'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ];
    }
}
