<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\ExternalLab;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExternalLab>
 */
class ExternalLabFactory extends Factory
{
    protected $model = ExternalLab::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'lab_name' => fake()->company().' Laboratoire',
            'contact_person' => fake()->name(),
            'phone' => '+212 5'.fake()->numerify('## ## ## ##'),
            'email' => fake()->safeEmail(),
            'is_active' => true,
        ];
    }
}
