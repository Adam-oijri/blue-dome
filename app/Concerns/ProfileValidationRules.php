<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?string $userId = null, ?string $clinicId = null): array
    {
        return [
            'first_name' => $this->nameRules(),
            'last_name' => $this->nameRules(),
            'email' => $this->emailRules($userId, $clinicId),
        ];
    }

    /**
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:100'];
    }

    /**
     * Email is unique per clinic — mirrors the partial unique index
     * `uq_users_email_per_clinic`. Pass `$clinicId` to scope the check;
     * omit to skip scoping (only safe when creating a brand-new clinic).
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?string $userId = null, ?string $clinicId = null): array
    {
        $unique = Rule::unique('users', 'email')->whereNull('deleted_at');

        if ($clinicId !== null) {
            $unique->where('clinic_id', $clinicId);
        }

        if ($userId !== null) {
            $unique->ignore($userId);
        }

        return [
            'required',
            'string',
            'email',
            'max:255',
            $unique,
        ];
    }
}
