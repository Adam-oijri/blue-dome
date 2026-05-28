<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Inventory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inventory>
 */
class InventoryFactory extends Factory
{
    protected $model = Inventory::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'item_name' => fake()->words(2, true),
            'category' => fake()->randomElement(['medication', 'supplies', 'equipment', 'office_supplies']),
            'quantity_in_stock' => fake()->numberBetween(10, 100),
            'min_stock_level' => 5,
            'unit' => 'box',
            'is_active' => true,
            'currency' => 'MAD',
        ];
    }

    public function lowStock(): static
    {
        return $this->state(fn () => [
            'quantity_in_stock' => 2,
            'min_stock_level' => 5,
        ]);
    }

    public function expiringSoon(): static
    {
        return $this->state(fn () => [
            'expiration_date' => now()->addDays(15)->toDateString(),
        ]);
    }
}
