<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'clinic_id' => fn (array $attrs) => Invoice::find($attrs['invoice_id'])->clinic_id,
            'patient_id' => fn (array $attrs) => Invoice::find($attrs['invoice_id'])->patient_id,
            'payment_number' => null,
            'amount' => fake()->randomFloat(2, 50, 500),
            'currency' => 'MAD',
            'payment_date' => now()->toDateString(),
            'payment_method' => 'cash',
            'payment_status' => 'completed',
        ];
    }

    public function bankWire(): static
    {
        return $this->state(fn () => [
            'payment_method' => 'bank_wire',
            'reference_number' => 'TRF-'.fake()->numerify('######'),
            'bank_name' => 'Attijariwafa Bank',
        ]);
    }

    public function refunded(): static
    {
        return $this->state(fn () => ['payment_status' => 'refunded']);
    }
}
