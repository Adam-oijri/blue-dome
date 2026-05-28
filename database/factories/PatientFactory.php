<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gender = fake()->randomElement(['male', 'female']);
        $first = $gender === 'male' ? fake()->firstNameMale() : fake()->firstNameFemale();

        return [
            'clinic_id' => Clinic::factory(),
            'branch_id' => null,
            // patient_code left null on purpose — PatientObserver allocates it
            // via fn_next_seq so the per-clinic sequence is the source of truth.
            'patient_code' => null,
            'first_name' => $first,
            'last_name' => fake()->lastName(),
            'date_of_birth' => fake()->dateTimeBetween('-80 years', '-5 years')->format('Y-m-d'),
            'gender' => $gender,
            'phone' => '+212 6'.fake()->numerify('## ## ## ##'),
            'phone_e164' => '+2126'.fake()->numerify('########'),
            'email' => fake()->unique()->safeEmail(),
            'city' => fake()->randomElement(['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tangier', 'Agadir']),
            'country' => 'MA',
            'blood_type' => fake()->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'is_active' => true,
            'registration_date' => now()->toDateString(),
        ];
    }

    public function withInsurance(): static
    {
        return $this->state(fn (array $attributes) => [
            'insurance_number' => 'INS-'.fake()->numerify('########'),
            'insurance_company' => fake()->randomElement(['CNSS', 'CNOPS', 'AXA Maroc', 'Saham Assurance']),
            'insurance_expiry' => fake()->dateTimeBetween('+1 month', '+3 years')->format('Y-m-d'),
            'insurance_type' => fake()->randomElement(['private', 'public', 'employer']),
        ]);
    }

    public function withNationalId(): static
    {
        return $this->state(fn (array $attributes) => [
            'national_id' => 'CIN-'.fake()->bothify('??######'),
        ]);
    }

    public function softDeleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'deleted_at' => now()->subDay(),
        ]);
    }
}
