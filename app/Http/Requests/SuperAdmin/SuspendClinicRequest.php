<?php

namespace App\Http\Requests\SuperAdmin;

use App\Models\Clinic;
use Illuminate\Foundation\Http\FormRequest;

class SuspendClinicRequest extends FormRequest
{
    public function authorize(): bool
    {
        $clinic = $this->route('clinic');

        return $this->user()?->can('suspend', $clinic instanceof Clinic ? $clinic : Clinic::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'max:500'],
        ];
    }
}
