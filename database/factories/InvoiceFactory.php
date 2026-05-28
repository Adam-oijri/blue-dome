<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 100, 1500);

        return [
            'clinic_id' => Clinic::factory(),
            'patient_id' => fn (array $attributes) => Patient::factory()->create([
                'clinic_id' => $attributes['clinic_id'],
            ])->id,
            'invoice_number' => null,
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'currency' => 'MAD',
            'subtotal' => $subtotal,
            'tax_percentage' => 20,
            'status' => 'pending',
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => ['status' => 'paid']);
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => 'draft']);
    }
}
