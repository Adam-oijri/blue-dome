<?php

use App\Models\Branch;
use App\Models\Clinic;
use App\Models\User;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $this->get(route('register'))->assertOk();
});

test('a new user gets a clinic on a free trial with a main branch', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => 'Sara',
        'last_name' => 'Idrissi',
        'clinic_name' => 'Idrissi Clinic',
        'email' => 'sara@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $this->assertAuthenticated();
    // The freshly-registered (still unverified) managing secretary is routed to
    // their panel; the `verified` middleware then steers them to verification.
    $response->assertRedirect(route('secretary.dashboard', absolute: false));

    $user = User::where('email', 'sara@example.com')->firstOrFail();
    expect($user->role)->toBe('secretary');
    expect((bool) $user->email_verified)->toBeFalse();

    $clinic = Clinic::findOrFail($user->clinic_id);
    expect($clinic->name)->toBe('Idrissi Clinic');
    expect($clinic->subscription_status)->toBe('trial');
    expect($clinic->subscription_plan)->toBe('professional');
    expect($clinic->subscription_expiry->toDateString())
        ->toBe(today()->addDays(config('billing.trial_days'))->toDateString());

    expect(
        Branch::where('clinic_id', $clinic->id)->where('is_main', true)->exists()
    )->toBeTrue();
});

test('the clinic name defaults to the registrant name when omitted', function () {
    $this->post(route('register.store'), [
        'first_name' => 'Omar',
        'last_name' => 'Benali',
        'email' => 'omar@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])->assertRedirect(route('secretary.dashboard', absolute: false));

    $user = User::where('email', 'omar@example.com')->firstOrFail();
    expect(Clinic::find($user->clinic_id)->name)->toBe('Omar Benali Clinic');
});

test('registration validates required fields and a unique email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $response = $this->from(route('register'))->post(route('register.store'), [
        'first_name' => '',
        'last_name' => 'Benali',
        'email' => 'taken@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertSessionHasErrors(['first_name', 'email']);
    $this->assertGuest();
});
