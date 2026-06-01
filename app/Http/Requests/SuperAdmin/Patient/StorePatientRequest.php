<?php

namespace App\Http\Requests\SuperAdmin\Patient;

use App\Models\Patient;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Super-admin patient create, scoped to the {clinic} route binding.
 */
class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Patient::class) ?? false;
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $clinicId = $this->route('clinic')->id;

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'in:male,female,other'],
            'phone' => ['nullable', 'string', 'max:50'],
            'phone_e164' => ['nullable', 'string', 'regex:/^\+[1-9]\d{6,14}$/'],
            'alternative_phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'size:2'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'patient_code' => [
                'nullable', 'string', 'max:50',
                Rule::unique('patients', 'patient_code')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
            'national_id' => [
                'nullable', 'string', 'max:255',
                // national_id is encrypted; uniqueness is enforced via the
                // deterministic blind-index column instead of the ciphertext.
                function (string $attribute, mixed $value, Closure $fail) use ($clinicId): void {
                    if (! is_string($value) || trim($value) === '') {
                        return;
                    }

                    $taken = Patient::query()
                        ->where('clinic_id', $clinicId)
                        ->where('national_id_hash', Patient::nationalIdHash($value))
                        ->exists();

                    if ($taken) {
                        $fail(__('validation.unique', ['attribute' => $attribute]));
                    }
                },
            ],
            'passport_number' => ['nullable', 'string', 'max:100'],
            'blood_type' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'marital_status' => ['nullable', 'string', 'max:20'],
            'occupation' => ['nullable', 'string', 'max:200'],
            'insurance_number' => ['nullable', 'string', 'max:255'],
            'insurance_company' => ['nullable', 'string', 'max:200'],
            'emergency_contact_name' => ['nullable', 'string', 'max:200'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'allergies' => ['nullable', 'string'],
            'chronic_diseases' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'branch_id' => [
                'nullable', 'uuid',
                Rule::exists('branches', 'id')->where('clinic_id', $clinicId)->whereNull('deleted_at'),
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone_e164') && is_string($this->input('phone_e164'))) {
            $normalized = Str::of($this->input('phone_e164'))->replaceMatches('/[^+\d]/', '')->toString();
            $this->merge(['phone_e164' => $normalized === '' ? null : $normalized]);
        }
    }
}
