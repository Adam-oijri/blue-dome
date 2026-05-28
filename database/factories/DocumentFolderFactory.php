<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\DocumentFolder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DocumentFolder>
 */
class DocumentFolderFactory extends Factory
{
    protected $model = DocumentFolder::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'folder_name' => fake()->unique()->word().' folder',
            'is_system' => false,
        ];
    }
}
