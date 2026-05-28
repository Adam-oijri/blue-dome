<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceItem>
 */
class InvoiceItemFactory extends Factory
{
    protected $model = InvoiceItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'item_type' => fake()->randomElement(['consultation', 'procedure', 'lab_test', 'medication']),
            'description' => fake()->sentence(4),
            'quantity' => 1,
            'unit_price' => fake()->randomFloat(2, 50, 500),
        ];
    }
}
