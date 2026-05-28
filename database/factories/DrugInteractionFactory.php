<?php

namespace Database\Factories;

use App\Models\DrugInteraction;
use App\Models\Medication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DrugInteraction>
 *
 * The schema enforces `medication_id_1 < medication_id_2`. The factory sorts
 * the two UUIDs before persistence — callers can pass any two medication
 * IDs in either order via `->forPair($a, $b)`.
 */
class DrugInteractionFactory extends Factory
{
    protected $model = DrugInteraction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $m1 = Medication::factory();
        $m2 = Medication::factory();

        return [
            'medication_id_1' => $m1,
            'medication_id_2' => $m2,
            'severity' => fake()->randomElement(['major', 'moderate', 'minor']),
            'interaction_type' => fake()->randomElement(['pharmacokinetic', 'pharmacodynamic', 'additive', 'antagonistic']),
            'description' => fake()->sentence(),
            'recommendation' => fake()->sentence(),
        ];
    }

    public function forPair(string $idA, string $idB, string $severity = 'major'): static
    {
        [$first, $second] = strcmp($idA, $idB) < 0 ? [$idA, $idB] : [$idB, $idA];

        return $this->state(fn () => [
            'medication_id_1' => $first,
            'medication_id_2' => $second,
            'severity' => $severity,
        ]);
    }

    public function major(): static
    {
        return $this->state(fn () => ['severity' => 'major']);
    }

    public function moderate(): static
    {
        return $this->state(fn () => ['severity' => 'moderate']);
    }

    public function minor(): static
    {
        return $this->state(fn () => ['severity' => 'minor']);
    }
}
