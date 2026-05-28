<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
{
    protected $model = Vendor::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'vendor_name' => fake()->company(),
            'contact_person' => fake()->name(),
            'phone' => '+212 5'.fake()->numerify('## ## ## ##'),
            'email' => fake()->safeEmail(),
            'category' => fake()->randomElement(['supplies', 'utilities', 'maintenance', 'professional_services']),
            'is_active' => true,
        ];
    }
}
