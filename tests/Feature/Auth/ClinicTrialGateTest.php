<?php

use App\Models\Clinic;
use App\Models\User;

/** A verified secretary seated in a clinic with the given subscription state. */
function trialGateUser(array $clinicAttributes): User
{
    $clinic = Clinic::factory()->create($clinicAttributes);

    return User::factory()->secretary()->create(['clinic_id' => $clinic->id]);
}

test('a clinic within its trial reaches the dashboard', function () {
    $user = trialGateUser([
        'subscription_status' => 'trial',
        'subscription_expiry' => today()->addDay(),
    ]);

    $this->actingAs($user)->get(route('secretary.dashboard'))->assertOk();
});

test('a clinic with a null expiry is grandfathered', function () {
    $user = trialGateUser([
        'subscription_status' => 'trial',
        'subscription_expiry' => null,
    ]);

    $this->actingAs($user)->get(route('secretary.dashboard'))->assertOk();
});

test('a lapsed trial is bounced to the trial-expired screen', function () {
    $user = trialGateUser([
        'subscription_status' => 'trial',
        'subscription_expiry' => today()->subDay(),
    ]);

    $this->actingAs($user)->get(route('secretary.dashboard'))
        ->assertRedirect(route('trial-expired', absolute: false));
});

test('a suspended clinic is bounced to the trial-expired screen', function () {
    $user = trialGateUser([
        'subscription_status' => 'suspended',
        'is_active' => false,
    ]);

    $this->actingAs($user)->get(route('secretary.dashboard'))
        ->assertRedirect(route('trial-expired', absolute: false));
});

test('the trial-expired screen itself stays reachable while blocked', function () {
    $user = trialGateUser([
        'subscription_status' => 'expired',
        'subscription_expiry' => today()->subDays(5),
    ]);

    $this->actingAs($user)->get(route('trial-expired'))->assertOk();
});

test('super admin is exempt from the trial gate', function () {
    $clinic = Clinic::factory()->create([
        'subscription_status' => 'expired',
        'subscription_expiry' => today()->subDay(),
    ]);
    $admin = User::factory()->superAdmin()->create(['clinic_id' => $clinic->id]);

    $this->actingAs($admin)->get(route('super-admin.dashboard'))->assertOk();
});

test('the expire-trials command flips lapsed trials to expired', function () {
    $lapsed = Clinic::factory()->create([
        'subscription_status' => 'trial',
        'subscription_expiry' => today()->subDay(),
    ]);
    $active = Clinic::factory()->create([
        'subscription_status' => 'trial',
        'subscription_expiry' => today()->addDay(),
    ]);
    $grandfathered = Clinic::factory()->create([
        'subscription_status' => 'trial',
        'subscription_expiry' => null,
    ]);

    $this->artisan('app:expire-trials')->assertExitCode(0);

    expect($lapsed->fresh()->subscription_status)->toBe('expired');
    expect($active->fresh()->subscription_status)->toBe('trial');
    expect($grandfathered->fresh()->subscription_status)->toBe('trial');
});
