<?php

namespace Database\Factories;

use App\Models\Medication;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PrescriptionItem>
 */
class PrescriptionItemFactory extends Factory
{
    protected $model = PrescriptionItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'prescription_id' => Prescription::factory(),
            'medication_id' => fn (array $attributes) => Medication::factory()->create([
                'clinic_id' => Prescription::find($attributes['prescription_id'])->clinic_id,
            ])->id,
            'dosage' => fake()->randomElement(['500mg', '250mg', '1g', '10mg']),
            'frequency_per_day' => fake()->numberBetween(1, 4),
            'duration_days' => fake()->numberBetween(3, 14),
            'route' => 'oral',
            'instructions' => 'À prendre après les repas',
            'quantity' => fake()->numberBetween(10, 60),
            'unit' => 'comprimé',
            'refills' => 0,
            'start_date' => now()->toDateString(),
        ];
    }
}
