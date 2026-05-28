<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\FieldChange;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FieldChange>
 */
class FieldChangeFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'entity_type' => 'Patient',
            'entity_id' => fake()->uuid(),
            'field_name' => 'phone',
            'old_value' => '+212600000000',
            'new_value' => '+212600000001',
            'changed_by_user_id' => User::factory(),
            'changed_by_clinic_id' => Clinic::factory(),
            'origin_clinic_id' => Clinic::factory(),
            'changed_at' => now(),
        ];
    }

    public function forCreate(): static
    {
        return $this->state(fn (array $attrs): array => [
            'old_value' => null,
        ]);
    }

    public function forDelete(): static
    {
        return $this->state(fn (array $attrs): array => [
            'new_value' => null,
        ]);
    }
}
