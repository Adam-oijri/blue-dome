<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Branch;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Public self-service signup. Provisions a brand-new clinic on a free
     * trial (config('billing.trial_days')), its single main branch, and seats
     * the registrant as the managing secretary — all in one transaction.
     *
     * RLS note: the `clinics` insert policy is WITH CHECK (fn_is_super_admin())
     * and branches/users require a matching clinic GUC, but a registrant is a
     * guest with no tenant context — and you cannot be "inside" a clinic that
     * does not exist yet. So the provisioning transaction elevates to the
     * super-admin GUC transaction-locally (auto-reverts on commit, never
     * leaking into the rest of the guest request). Harmless in local/test
     * where the connection role is a Postgres superuser and bypasses RLS.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'clinic_name' => ['nullable', 'string', 'max:255'],
            'password' => $this->passwordRules(),
        ])->validate();

        $locale = App::getLocale();
        $trialDays = (int) config('billing.trial_days');

        $clinicName = trim((string) ($input['clinic_name'] ?? '')) !== ''
            ? trim($input['clinic_name'])
            : $input['first_name'].' '.$input['last_name'].' Clinic';

        return DB::transaction(function () use ($input, $locale, $trialDays, $clinicName): User {
            // Tenant-provisioning elevation — scoped to this transaction only.
            DB::statement("SELECT set_config('app.is_super_admin', 'true', true)");

            $clinic = Clinic::create([
                'name' => $clinicName,
                'slug' => Str::slug($input['email']).'-'.Str::random(6),
                'locale' => $locale,
                'subscription_plan' => 'professional',
                'subscription_status' => 'trial',
                'subscription_started_at' => now(),
                'subscription_expiry' => now()->addDays($trialDays)->toDateString(),
            ]);

            // One main branch per clinic (matches uq_branches_one_main) so the
            // scheduling/appointment flows that assume a branch work out of the
            // box. Mirrors BranchSeeder, derived from the clinic's own record.
            Branch::create([
                'clinic_id' => $clinic->id,
                'is_main' => true,
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
            ]);

            return User::forceCreate([
                'clinic_id' => $clinic->id,
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'password_hash' => Hash::make($input['password']),
                'role' => 'secretary',
                'locale' => $locale,
            ]);
        });
    }
}
