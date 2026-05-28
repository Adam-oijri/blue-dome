<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\Medication;
use Illuminate\Database\Seeder;

/**
 * Seeds a small per-clinic Moroccan-market formulary so doctors have a
 * starting catalog to prescribe from. Each clinic gets the same logical
 * meds with its own UUIDs — the DrugInteractionSeeder then pairs those
 * UUIDs per clinic so interaction warnings fire within each tenant.
 */
class MedicationSeeder extends Seeder
{
    /**
     * @var array<int, array<string, string>>
     */
    public const CATALOG = [
        ['trade_name' => 'Doliprane',    'generic_name' => 'paracetamol',   'form' => 'tablet',    'strength' => '500mg', 'category' => 'analgesic'],
        ['trade_name' => 'Brufen',       'generic_name' => 'ibuprofen',     'form' => 'tablet',    'strength' => '400mg', 'category' => 'analgesic'],
        ['trade_name' => 'Clamoxyl',     'generic_name' => 'amoxicilline',  'form' => 'capsule',   'strength' => '500mg', 'category' => 'antibiotic'],
        ['trade_name' => 'Coumadine',    'generic_name' => 'warfarine',     'form' => 'tablet',    'strength' => '5mg',   'category' => 'anticoagulant'],
        ['trade_name' => 'Aspégic',      'generic_name' => 'aspirine',      'form' => 'tablet',    'strength' => '100mg', 'category' => 'antiplatelet'],
        ['trade_name' => 'Zestril',      'generic_name' => 'lisinopril',    'form' => 'tablet',    'strength' => '10mg',  'category' => 'antihypertensive'],
        ['trade_name' => 'Aldactone',    'generic_name' => 'spironolactone', 'form' => 'tablet',   'strength' => '25mg',  'category' => 'diuretic'],
        ['trade_name' => 'Glucophage',   'generic_name' => 'metformine',    'form' => 'tablet',    'strength' => '850mg', 'category' => 'antidiabetic'],
        ['trade_name' => 'Tahor',        'generic_name' => 'atorvastatine', 'form' => 'tablet',    'strength' => '20mg',  'category' => 'statin'],
        ['trade_name' => 'Mopral',       'generic_name' => 'omeprazole',    'form' => 'capsule',   'strength' => '20mg',  'category' => 'ppi'],
    ];

    public function run(): void
    {
        Clinic::query()->each(function (Clinic $clinic): void {
            foreach (self::CATALOG as $row) {
                Medication::firstOrCreate(
                    [
                        'clinic_id' => $clinic->id,
                        'trade_name' => $row['trade_name'],
                        'strength' => $row['strength'],
                        'form' => $row['form'],
                    ],
                    [
                        'generic_name' => $row['generic_name'],
                        'category' => $row['category'],
                        'manufacturer' => 'Generic',
                        'is_active' => true,
                        'requires_prescription' => true,
                    ]
                );
            }
        });
    }
}
