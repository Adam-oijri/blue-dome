<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password hash being used by the factory.
     */
    protected static ?string $passwordHash;

    /**
     * Default state: an active secretary attached to a fresh clinic. Use the
     * state helpers (`doctor()`, `secretary()`, `superAdmin()`) to roll a
     * specific role; the `fn_enforce_user_role_caps` trigger constrains how
     * many of each role may coexist in a single clinic.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => static::$passwordHash ??= Hash::make('password'),
            'role' => 'secretary',
            'is_active' => true,
            'email_verified' => true,
            'email_verified_at' => now(),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
            'remember_token' => null,
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified' => false,
            'email_verified_at' => null,
        ]);
    }

    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_enabled' => true,
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }

    public function doctor(): static
    {
        return $this->state(fn (array $attributes) => ['role' => 'doctor']);
    }

    public function secretary(): static
    {
        return $this->state(fn (array $attributes) => ['role' => 'secretary']);
    }

    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => ['role' => 'super_admin']);
    }
}
