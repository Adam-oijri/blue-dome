<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Expense;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'expense_number' => null,
            'expense_date' => now()->toDateString(),
            'category' => fake()->randomElement(['rent', 'utilities', 'supplies', 'maintenance']),
            'description' => fake()->sentence(),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'currency' => 'MAD',
            'payment_status' => 'pending',
            'is_recurring' => false,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'payment_status' => 'paid',
            'paid_date' => now()->toDateString(),
        ]);
    }
}
