<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\DoctorProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement("SELECT set_config('app.is_super_admin', 'true', false)");

        $platform = $this->upsertClinic('platform', [
            'name' => 'Platform Operations',
            'subscription_plan' => 'enterprise',
            'subscription_status' => 'active',
            'locale' => 'en',
        ]);

        $this->upsertUser($platform->id, 'super@bluedome.local', [
            'first_name' => 'Platform',
            'last_name' => 'Owner',
            'role' => 'super_admin',
        ]);

        $demo = $this->upsertClinic('demo-clinic', [
            'name' => 'Demo Clinic',
            'subscription_plan' => 'professional',
            'subscription_status' => 'trial',
            'locale' => 'fr',
        ]);

        foreach ([
            ['first_name' => 'Aïcha', 'last_name' => 'Bennani', 'email' => 'aicha@demo.local', 'specialty' => 'Cardiology'],
            ['first_name' => 'Youssef', 'last_name' => 'El Idrissi', 'email' => 'youssef@demo.local', 'specialty' => 'General Practice'],
        ] as $doctor) {
            $user = $this->upsertUser($demo->id, $doctor['email'], [
                'first_name' => $doctor['first_name'],
                'last_name' => $doctor['last_name'],
                'role' => 'doctor',
            ]);

            DoctorProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'clinic_id' => $demo->id,
                    'specialty' => $doctor['specialty'],
                    'consultation_duration' => 30,
                ]
            );
        }

        foreach ([
            ['first_name' => 'Salma', 'last_name' => 'Karimi', 'email' => 'salma@demo.local'],
            ['first_name' => 'Nadia', 'last_name' => 'Tahiri', 'email' => 'nadia@demo.local'],
            ['first_name' => 'Hind', 'last_name' => 'Amrani', 'email' => 'hind@demo.local'],
        ] as $secretary) {
            $this->upsertUser($demo->id, $secretary['email'], [
                'first_name' => $secretary['first_name'],
                'last_name' => $secretary['last_name'],
                'role' => 'secretary',
            ]);
        }

        $this->call(BranchSeeder::class);
        $this->call(MessageTemplateSeeder::class);
        $this->call(MedicationSeeder::class);
        $this->call(DrugInteractionSeeder::class);
        $this->call(ExternalLabSeeder::class);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function upsertClinic(string $slug, array $attributes): Clinic
    {
        return Clinic::firstOrCreate(
            ['slug' => $slug],
            [
                'country' => 'MA',
                'currency' => 'MAD',
                'timezone' => 'Africa/Casablanca',
                'is_active' => true,
                ...$attributes,
            ]
        );
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function upsertUser(string $clinicId, string $email, array $attributes): User
    {
        $existing = User::query()
            ->where('clinic_id', $clinicId)
            ->where('email', $email)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        return User::forceCreate([
            'clinic_id' => $clinicId,
            'email' => $email,
            'password_hash' => Hash::make('password'),
            'email_verified' => true,
            'email_verified_at' => now(),
            'is_active' => true,
            ...$attributes,
        ]);
    }
}
