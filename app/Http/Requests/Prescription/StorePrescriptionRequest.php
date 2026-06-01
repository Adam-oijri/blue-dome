<?php

namespace App\Http\Requests\Prescription;

use App\Models\Prescription;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Prescription::class) ?? false;
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
            'prescription_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date', 'after_or_equal:prescription_date'],
            'status' => ['nullable', 'in:draft,active,completed,discontinued,cancelled,expired'],
            'diagnosis_related' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medication_id' => [
                'nullable', 'required_without:items.*.medication_name', 'uuid',
                Rule::exists('medications', 'id')
                    ->where('clinic_id', $clinicId)
                    ->where('is_active', true)
                    ->whereNull('deleted_at'),
            ],
            'items.*.medication_name' => [
                'nullable', 'required_without:items.*.medication_id', 'string', 'max:255',
            ],
            'items.*.dosage' => ['required', 'string', 'max:255'],
            'items.*.frequency_per_day' => ['nullable', 'integer', 'min:1', 'max:24'],
            'items.*.interval_hours' => ['nullable', 'integer', 'min:1', 'max:72'],
            'items.*.frequency_text' => ['nullable', 'string', 'max:255'],
            'items.*.duration_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'items.*.route' => ['nullable', 'in:oral,topical,intravenous,intramuscular,subcutaneous,sublingual,rectal,inhalation,ophthalmic,otic'],
            'items.*.instructions' => ['nullable', 'string'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1'],
            'items.*.unit' => ['nullable', 'string', 'max:50'],
            'items.*.refills' => ['nullable', 'integer', 'min:0', 'max:12'],
            'items.*.start_date' => ['nullable', 'date'],
        ];
    }
}
