<?php

namespace App\Http\Requests\SuperAdmin;

use App\Models\Clinic;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateClinicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Clinic::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'size:2'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'currency' => ['nullable', 'string', 'size:3'],
            'timezone' => ['nullable', 'string', Rule::in(timezone_identifiers_list())],
            'locale' => ['nullable', 'string', 'max:10'],
            'date_format' => ['nullable', 'string', 'max:20'],
            'subscription_plan' => ['required', Rule::in(['free', 'basic', 'professional', 'enterprise'])],
            'subscription_status' => ['required', Rule::in(['active', 'trial', 'expired', 'suspended', 'cancelled'])],
            'subscription_expiry' => ['nullable', 'date'],
            'max_users' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'max_branches' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'max_storage_mb' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
