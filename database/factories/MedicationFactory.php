<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Medication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medication>
 */
class MedicationFactory extends Factory
{
    protected $model = Medication::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $forms = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops'];
        $categories = ['analgesic', 'antibiotic', 'antihypertensive', 'antidiabetic', 'antihistamine', 'anticoagulant'];

        return [
            'clinic_id' => Clinic::factory(),
            'trade_name' => fake()->unique()->word().' '.fake()->numberBetween(100, 1000).'mg',
            'generic_name' => fake()->word(),
            'form' => fake()->randomElement($forms),
            'strength' => fake()->numberBetween(50, 1000).'mg',
            'manufacturer' => fake()->company(),
            'category' => fake()->randomElement($categories),
            'is_active' => true,
            'requires_prescription' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function softDeleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'deleted_at' => now()->subDay(),
        ]);
    }
}
