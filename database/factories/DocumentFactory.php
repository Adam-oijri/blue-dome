<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Document;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    protected $model = Document::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'entity_type' => 'Patient',
            'entity_id' => fn (array $attrs) => Patient::factory()->create([
                'clinic_id' => $attrs['clinic_id'],
            ])->id,
            'document_name' => fake()->sentence(3),
            'document_type' => 'patient_record',
            'file_name' => fake()->word().'.pdf',
            'file_path' => fn (array $attrs) => "clinics/{$attrs['clinic_id']}/".fake()->sha256().'.pdf',
            'file_size' => fake()->numberBetween(1024, 1024 * 1024),
            'mime_type' => 'application/pdf',
            'file_extension' => 'pdf',
            'file_hash' => fake()->sha256(),
            'uploaded_at' => now(),
        ];
    }
}
