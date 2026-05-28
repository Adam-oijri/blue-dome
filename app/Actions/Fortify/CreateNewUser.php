<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Phase 0: self-signup is disabled in config/fortify.php. This action
     * remains functional so tests and the Phase 1 onboarding wizard can call
     * it. It creates a brand-new clinic and seats the registrant as its
     * managing secretary in one transaction.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input): User {
            $clinic = Clinic::create([
                'name' => $input['first_name'].' '.$input['last_name'].' Clinic',
                'slug' => Str::slug($input['email']).'-'.Str::random(6),
            ]);

            return User::forceCreate([
                'clinic_id' => $clinic->id,
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'password_hash' => Hash::make($input['password']),
                'role' => 'secretary',
            ]);
        });
    }
}
