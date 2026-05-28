<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\VitalSigns;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VitalSigns>
 */
class VitalSignsFactory extends Factory
{
    /**
     * Defaults sit inside healthy adult ranges so test assertions about
     * "is_critical"-style flags don't trip accidentally. Override via state
     * helpers when probing edge cases.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'patient_id' => Patient::factory(),
            'appointment_id' => null,
            'recorded_at' => now(),
            'temperature_c' => fake()->randomFloat(1, 36.2, 37.4),
            'blood_pressure_sys' => fake()->numberBetween(110, 130),
            'blood_pressure_dia' => fake()->numberBetween(70, 85),
            'heart_rate' => fake()->numberBetween(60, 100),
            'respiratory_rate' => fake()->numberBetween(12, 20),
            'oxygen_saturation' => fake()->randomFloat(1, 96, 100),
            'blood_glucose' => fake()->randomFloat(1, 70, 110),
            'weight_kg' => fake()->randomFloat(2, 50, 95),
            'height_cm' => fake()->randomFloat(1, 150, 195),
            'pain_score' => fake()->numberBetween(0, 3),
            'notes' => null,
            'recorded_by' => null,
        ];
    }
}
