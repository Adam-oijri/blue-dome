<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prescription>
 */
class PrescriptionFactory extends Factory
{
    protected $model = Prescription::class;

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
            'prescription_number' => null,
            'prescription_date' => now()->toDateString(),
            'expiry_date' => now()->addMonths(3)->toDateString(),
            'status' => 'active',
        ];
    }

    public function dispensed(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_dispensed' => true,
            'dispensed_at' => now(),
            'dispensed_by' => 'Pharmacy',
        ]);
    }

    public function softDeleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'deleted_at' => now()->subDay(),
        ]);
    }
}
