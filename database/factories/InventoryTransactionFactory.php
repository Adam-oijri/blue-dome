<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryTransaction>
 */
class InventoryTransactionFactory extends Factory
{
    protected $model = InventoryTransaction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'inventory_id' => Inventory::factory(),
            'clinic_id' => fn (array $attrs) => Inventory::find($attrs['inventory_id'])->clinic_id,
            'transaction_type' => 'purchase',
            'quantity' => fake()->numberBetween(1, 50),
            'unit_price' => fake()->randomFloat(2, 1, 100),
            'transaction_date' => now()->toDateString(),
        ];
    }
}
