<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\SecretaryChecklistItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SecretaryChecklistItem>
 */
class SecretaryChecklistItemFactory extends Factory
{
    protected $model = SecretaryChecklistItem::class;

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
            'checklist_date' => now()->toDateString(),
            'item_key' => fake()->randomElement([
                'cl_open_drawer',
                'cl_sync_calendar',
                'cl_review_noshows',
                'cl_print_list',
                'cl_reconcile',
                'cl_send_recap',
                'cl_archive_files',
                'cl_lock_drawer',
            ]),
        ];
    }
}
