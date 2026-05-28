<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\ExternalLab;
use Illuminate\Database\Seeder;

class ExternalLabSeeder extends Seeder
{
    /**
     * @var array<int, array<string, string>>
     */
    public const LABS = [
        ['lab_name' => 'CERBA Maroc',       'phone' => '+212 5 22 67 89 00', 'email' => 'contact@cerba.ma'],
        ['lab_name' => 'Pasteur Maroc',     'phone' => '+212 5 22 43 44 45', 'email' => 'contact@pasteur.ma'],
        ['lab_name' => 'BIOSMUR Casablanca', 'phone' => '+212 5 22 30 40 50', 'email' => 'contact@biosmur.ma'],
    ];

    public function run(): void
    {
        Clinic::query()->each(function (Clinic $clinic): void {
            foreach (self::LABS as $row) {
                ExternalLab::firstOrCreate(
                    ['clinic_id' => $clinic->id, 'lab_name' => $row['lab_name']],
                    [
                        'phone' => $row['phone'],
                        'email' => $row['email'],
                        'is_active' => true,
                    ]
                );
            }
        });
    }
}
