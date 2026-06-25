<?php

namespace App\Http\Requests\Secretary;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A clinic secretary (the clinic manager) invites a doctor or secretary to
 * their OWN clinic. The clinic is never taken from input — the controller forces
 * it to the actor's clinic. Authorization maps the requested role to the
 * matching UserPolicy ability.
 */
class StoreStaffInvitationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ability = $this->input('role') === 'doctor' ? 'createDoctor' : 'createSecretary';

        return $this->user()?->can($ability, User::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'role' => ['required', Rule::in(['doctor', 'secretary'])],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
        ];
    }
}
