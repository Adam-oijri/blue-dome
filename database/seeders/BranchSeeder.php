<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Clinic;
use Illuminate\Database\Seeder;

/**
 * Gives every clinic a single main branch derived from the clinic's own
 * record — no fabricated data. Idempotent on (clinic_id, is_main), which also
 * matches the `uq_branches_one_main` partial unique index, so re-running is
 * safe and picks up clinic profile fields (city, phone, …) as they fill in.
 */
class BranchSeeder extends Seeder
{
    public function run(): void
    {
        Clinic::query()->each(function (Clinic $clinic): void {
            Branch::firstOrCreate(
                [
                    'clinic_id' => $clinic->id,
                    'is_main' => true,
                ],
                [
                    'branch_name' => "{$clinic->name} — Main",
                    'branch_code' => 'MAIN',
                    'is_active' => true,
                    'phone' => $clinic->phone,
                    'email' => $clinic->email,
                    'address' => $clinic->address,
                    'city' => $clinic->city,
                    'country' => $clinic->country,
                    'postal_code' => $clinic->postal_code,
                    'timezone' => $clinic->timezone,
                ]
            );
        });
    }
}
