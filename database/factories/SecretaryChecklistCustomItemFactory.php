<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\SecretaryChecklistCustomItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SecretaryChecklistCustomItem>
 */
class SecretaryChecklistCustomItemFactory extends Factory
{
    protected $model = SecretaryChecklistCustomItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'user_id' => fn (array $attrs) => User::factory()->secretary()->create([
                'clinic_id' => $attrs['clinic_id'],
            ])->id,
            'label' => fake()->sentence(3),
        ];
    }
}
