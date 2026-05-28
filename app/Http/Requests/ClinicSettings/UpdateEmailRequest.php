<?php

namespace App\Http\Requests\ClinicSettings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmailRequest extends FormRequest
{
    /**
     * @return array<string, string|array<int, string>>
     */
    public function rules(): array
    {
        return [
            'from_email' => ['required', 'email:rfc', 'max:255'],
            'from_name' => ['nullable', 'string', 'max:255'],
            'reply_to' => ['nullable', 'email:rfc', 'max:255'],
        ];
    }
}
