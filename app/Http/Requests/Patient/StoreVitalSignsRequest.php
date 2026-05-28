<?php

namespace App\Http\Requests\Patient;

use App\Models\Patient;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVitalSignsRequest extends FormRequest
{
    /**
     * Doctors and secretaries record vitals during intake. Cross-clinic
     * access is blocked by Patient policy's view() rule.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        if ($user === null) {
            return false;
        }

        if (! in_array($user->role, ['doctor', 'secretary'], true)) {
            return false;
        }

        $patient = $this->route('patient');

        return $patient instanceof Patient && $user->can('view', $patient);
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        return [
            'recorded_at' => ['nullable', 'date'],
            'temperature_c' => ['nullable', 'numeric', 'between:30,45'],
            'blood_pressure_sys' => ['nullable', 'integer', 'between:40,260'],
            'blood_pressure_dia' => ['nullable', 'integer', 'between:20,200'],
            'heart_rate' => ['nullable', 'integer', 'between:20,250'],
            'respiratory_rate' => ['nullable', 'integer', 'between:5,80'],
            'oxygen_saturation' => ['nullable', 'numeric', 'between:50,100'],
            'blood_glucose' => ['nullable', 'numeric', 'between:20,800'],
            'weight_kg' => ['nullable', 'numeric', 'between:0.1,500'],
            'height_cm' => ['nullable', 'numeric', 'between:20,260'],
            'pain_score' => ['nullable', 'integer', 'between:0,10'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
