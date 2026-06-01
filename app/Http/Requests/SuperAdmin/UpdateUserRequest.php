<?php

namespace App\Http\Requests\SuperAdmin;

use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /** Per-clinic active staff caps, mirrors fn_enforce_user_role_caps(). */
    private const ROLE_CAPS = ['doctor' => 2, 'secretary' => 3];

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
        /** @var User $target */
        $target = $this->route('user');

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users', 'email')
                    ->where(fn ($q) => $q->where('clinic_id', $target->clinic_id)->whereNull('deleted_at'))
                    ->ignore($target->id),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'role' => ['required', Rule::in(['super_admin', 'doctor', 'secretary'])],
            'is_active' => ['nullable', 'boolean'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var User $target */
            $target = $this->route('user');
            $actor = $this->user();

            // Self-protection: a super_admin must not lock themselves out by
            // changing their own role or deactivating their own account.
            if ($actor !== null && $actor->id === $target->id) {
                if ($this->input('role') !== $target->role) {
                    $validator->errors()->add('role', __('You cannot change your own role.'));
                }

                if (! $this->boolean('is_active')) {
                    $validator->errors()->add('is_active', __('You cannot deactivate your own account.'));
                }
            }

            // Role-cap pre-check (mirrors the DB trigger) for a clean 422 when
            // promoting/moving a user into an already-full capped role.
            $newRole = $this->input('role');

            if (isset(self::ROLE_CAPS[$newRole]) && $newRole !== $target->role) {
                $count = User::query()
                    ->where('clinic_id', $target->clinic_id)
                    ->where('role', $newRole)
                    ->whereNull('deleted_at')
                    ->where('id', '!=', $target->id)
                    ->count();

                if ($count >= self::ROLE_CAPS[$newRole]) {
                    $validator->errors()->add('role', __('This clinic already has the maximum number of :role accounts.', ['role' => $newRole]));
                }
            }
        });
    }
}
