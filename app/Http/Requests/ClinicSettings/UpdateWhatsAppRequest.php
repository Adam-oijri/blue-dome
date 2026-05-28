<?php

namespace App\Http\Requests\ClinicSettings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWhatsAppRequest extends FormRequest
{
    /**
     * Strip empty-string token fields so the controller's $fill() leaves
     * the existing encrypted credentials untouched. Without this, an admin
     * who edits the phone number but doesn't re-paste the access token
     * would silently wipe it.
     */
    protected function prepareForValidation(): void
    {
        $secrets = ['access_token', 'app_secret', 'webhook_verify_token'];

        $stripped = collect($secrets)
            ->mapWithKeys(fn (string $key): array => [$key => $this->input($key)])
            ->reject(fn (?string $value): bool => $value === null || $value === '')
            ->all();

        $this->merge($stripped + array_fill_keys(
            array_diff($secrets, array_keys($stripped)),
            null,
        ));
    }

    /**
     * @return array<string, string|array<int, string>>
     */
    public function rules(): array
    {
        return [
            'phone_number_id' => ['required', 'string', 'max:255'],
            'business_account_id' => ['required', 'string', 'max:255'],
            'display_phone_number' => ['nullable', 'string', 'max:50'],
            'access_token' => ['nullable', 'string', 'max:500'],
            'app_secret' => ['nullable', 'string', 'max:255'],
            'webhook_verify_token' => ['nullable', 'string', 'max:255'],
            'daily_message_limit' => ['required', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
