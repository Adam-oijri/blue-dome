<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabOrder>
 */
class LabOrderFactory extends Factory
{
    protected $model = LabOrder::class;

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
            'doctor_id' => fn (array $attributes) => User::factory()->doctor()->create([
                'clinic_id' => $attributes['clinic_id'],
            ])->id,
            'lab_order_number' => null,
            'order_date' => now()->toDateString(),
            'status' => 'pending',
            'urgency' => 'routine',
            'fasting_required' => false,
            'clinical_diagnosis' => fake()->sentence(),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function urgent(): static
    {
        return $this->state(fn () => ['urgency' => 'urgent']);
    }
}
