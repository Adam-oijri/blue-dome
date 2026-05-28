<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\DrugInteraction;
use App\Models\Medication;
use Illuminate\Database\Seeder;

/**
 * Drug-interaction pairs are keyed by `medication_id` UUIDs and medications
 * are per-clinic, so this seeder iterates clinics and inserts the same
 * logical pairs against each tenant's local medication UUIDs. The schema
 * enforces `medication_id_1 < medication_id_2`; sort before insert.
 */
class DrugInteractionSeeder extends Seeder
{
    /**
     * Logical pairs by generic_name. Each row becomes one drug_interactions
     * row per clinic that has both medications seeded.
     *
     * @var array<int, array<string, string>>
     */
    public const PAIRS = [
        [
            'a' => 'warfarine',
            'b' => 'aspirine',
            'severity' => 'major',
            'interaction_type' => 'pharmacodynamic',
            'description' => 'Increased risk of bleeding when warfarin is combined with antiplatelet agents.',
            'recommendation' => 'Avoid concurrent use unless benefit outweighs risk; monitor INR closely.',
        ],
        [
            'a' => 'lisinopril',
            'b' => 'spironolactone',
            'severity' => 'moderate',
            'interaction_type' => 'pharmacodynamic',
            'description' => 'ACE inhibitors with potassium-sparing diuretics can cause hyperkalemia.',
            'recommendation' => 'Monitor serum potassium and renal function.',
        ],
        [
            'a' => 'metformine',
            'b' => 'atorvastatine',
            'severity' => 'minor',
            'interaction_type' => 'additive',
            'description' => 'Minor additive effect on lactate metabolism; clinically rarely relevant.',
            'recommendation' => 'No routine action required; monitor if patient develops symptoms.',
        ],
    ];

    public function run(): void
    {
        Clinic::query()->each(function (Clinic $clinic): void {
            foreach (self::PAIRS as $pair) {
                $medA = Medication::query()
                    ->where('clinic_id', $clinic->id)
                    ->where('generic_name', $pair['a'])
                    ->first();

                $medB = Medication::query()
                    ->where('clinic_id', $clinic->id)
                    ->where('generic_name', $pair['b'])
                    ->first();

                if ($medA === null || $medB === null) {
                    continue;
                }

                [$first, $second] = strcmp($medA->id, $medB->id) < 0
                    ? [$medA->id, $medB->id]
                    : [$medB->id, $medA->id];

                DrugInteraction::firstOrCreate(
                    [
                        'medication_id_1' => $first,
                        'medication_id_2' => $second,
                    ],
                    [
                        'severity' => $pair['severity'],
                        'interaction_type' => $pair['interaction_type'],
                        'description' => $pair['description'],
                        'recommendation' => $pair['recommendation'],
                    ]
                );
            }
        });
    }
}
