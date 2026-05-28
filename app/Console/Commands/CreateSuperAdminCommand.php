<?php

namespace App\Console\Commands;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class CreateSuperAdminCommand extends Command
{
    protected $signature = 'app:create-super-admin
        {--email= : The super admin email}
        {--first-name= : First name}
        {--last-name= : Last name}
        {--password= : Initial password (prompted if omitted)}';

    protected $description = 'Seat (or reseat) the platform-level super_admin. The role bypasses RLS via fn_is_super_admin() and is the only account that can manage clinics across tenants.';

    public function handle(): int
    {
        $email = $this->option('email') ?: text('Super admin email', required: true);
        $firstName = $this->option('first-name') ?: text('First name', default: 'Platform', required: true);
        $lastName = $this->option('last-name') ?: text('Last name', default: 'Owner', required: true);
        $passwordPlain = $this->option('password') ?: password('Password (min 12 chars in production)', required: true);

        try {
            validator(
                ['email' => $email, 'password' => $passwordPlain],
                ['email' => ['required', 'email'], 'password' => ['required', 'string', Password::default()]]
            )->validate();
        } catch (ValidationException $e) {
            foreach ($e->errors() as $messages) {
                foreach ($messages as $msg) {
                    $this->error($msg);
                }
            }

            return self::INVALID;
        }

        DB::statement("SELECT set_config('app.is_super_admin', 'true', false)");

        $platformClinic = Clinic::firstOrCreate(
            ['slug' => 'platform'],
            [
                'name' => 'Platform Operations',
                'country' => 'MA',
                'currency' => 'MAD',
                'timezone' => 'Africa/Casablanca',
                'locale' => 'en',
                'subscription_plan' => 'enterprise',
                'subscription_status' => 'active',
                'is_active' => true,
            ]
        );

        try {
            $existing = User::query()
                ->where('clinic_id', $platformClinic->id)
                ->where('email', $email)
                ->first();

            if ($existing !== null) {
                $existing->forceFill([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'password_hash' => Hash::make($passwordPlain),
                    'role' => 'super_admin',
                    'is_active' => true,
                    'email_verified' => true,
                    'email_verified_at' => now(),
                ])->save();

                $user = $existing;
            } else {
                $user = User::forceCreate([
                    'clinic_id' => $platformClinic->id,
                    'email' => $email,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'password_hash' => Hash::make($passwordPlain),
                    'role' => 'super_admin',
                    'is_active' => true,
                    'email_verified' => true,
                    'email_verified_at' => now(),
                ]);
            }
        } catch (QueryException $e) {
            $this->error('Database error: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info("Super admin seated: {$user->email} (id {$user->id})");

        return self::SUCCESS;
    }
}
