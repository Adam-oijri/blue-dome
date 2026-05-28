<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MedicalRecord>
 */
class MedicalRecordFactory extends Factory
{
    protected $model = MedicalRecord::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'patient_id' => fn (array $attributes) => Patient::factory()->create([
                'clinic_id' => $attributes['clinic_id'],
            ])->id,
            'record_date' => now(),
            'record_type' => 'progress',
            'title' => fake()->sentence(4),
            'is_confidential' => false,
            'is_signed' => false,
        ];
    }

    public function soap(): static
    {
        return $this->state(fn (array $attributes) => [
            'subjective' => 'Le patient se plaint de '.fake()->sentence(),
            'objective' => 'TA: 120/80, FC: 72, T°: 37.0, SpO2: 98%.',
            'assessment' => 'Bronchite aiguë probablement virale.',
            'plan' => 'Repos, hydratation, paracétamol 500mg si fièvre. Revoir si pas amélioration sous 5 jours.',
        ]);
    }

    public function signed(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_signed' => true,
            'signed_at' => now(),
            'signed_by' => fn (array $attrs) => User::factory()->doctor()->create([
                'clinic_id' => $attrs['clinic_id'],
            ])->id,
        ]);
    }

    public function confidential(): static
    {
        return $this->state(fn () => ['is_confidential' => true]);
    }
}
