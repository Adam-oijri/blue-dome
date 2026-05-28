<?php

namespace Database\Factories;

use App\Models\Clinic;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Clinic>
 */
class ClinicFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'slug' => Str::slug(fake()->unique()->company()).'-'.Str::random(6),
            'country' => 'MA',
            'currency' => 'MAD',
            'timezone' => 'Africa/Casablanca',
            'locale' => 'fr',
            'subscription_plan' => 'free',
            'subscription_status' => 'trial',
            'is_active' => true,
        ];
    }
}
