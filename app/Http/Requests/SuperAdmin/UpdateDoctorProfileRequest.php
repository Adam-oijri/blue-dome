<?php

namespace App\Http\Requests\SuperAdmin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDoctorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->route('user');

        return $this->user()?->can('update', $user instanceof User ? $user : User::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'specialty' => ['nullable', 'string', 'max:100'],
            'sub_specialty' => ['nullable', 'string', 'max:100'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'license_expiry' => ['nullable', 'date'],
            'consultation_duration' => ['nullable', 'integer', 'min:1', 'max:480'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'follow_up_fee' => ['nullable', 'numeric', 'min:0'],
            'emergency_fee' => ['nullable', 'numeric', 'min:0'],
            'accepts_new_patients' => ['nullable', 'boolean'],
            'bio' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
