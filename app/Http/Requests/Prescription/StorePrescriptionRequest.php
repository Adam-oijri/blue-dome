<?php

namespace App\Http\Requests\Prescription;

use App\Models\Prescription;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
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
                'required', 'uuid',
                Rule::exists('medications', 'id')
                    ->where('clinic_id', $clinicId)
                    ->where('is_active', true)
                    ->whereNull('deleted_at'),
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

    /**
     * @return array<int, \Closure>
     */
    public function after(): array
    {
        return [
            function (ValidatorContract $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $items = (array) $this->input('items', []);
                $medicationIds = array_values(array_unique(array_filter(
                    array_map(static fn ($item) => is_array($item) ? ($item['medication_id'] ?? null) : null, $items)
                )));

                if (count($medicationIds) < 2) {
                    return;
                }

                $placeholders = implode(',', array_fill(0, count($medicationIds), '?::uuid'));
                $bindings = array_merge($medicationIds, $medicationIds);

                $interaction = DB::selectOne(
                    "SELECT severity FROM drug_interactions
                     WHERE medication_id_1 IN ($placeholders)
                       AND medication_id_2 IN ($placeholders)
                       AND severity IN ('major', 'moderate')
                     ORDER BY CASE severity WHEN 'major' THEN 1 WHEN 'moderate' THEN 2 END
                     LIMIT 1",
                    $bindings
                );

                if ($interaction !== null) {
                    $validator->errors()->add(
                        'items',
                        __('prescriptions.drug_interaction_'.$interaction->severity)
                    );
                }
            },
        ];
    }
}
