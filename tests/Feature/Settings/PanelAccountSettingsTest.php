<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('doctor sees a working account settings page', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $this->actingAs(User::factory()->doctor()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('doctor.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('panels/doctor/settings')
            ->where('canManageTwoFactor', true)
            ->where('twoFactorEnabled', false)
            ->has('passwordRules')
        );
});

test('secretary sees a working account settings page', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $this->actingAs(User::factory()->secretary()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('secretary.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('panels/secretary/settings')
            ->where('canManageTwoFactor', true)
            ->has('passwordRules')
        );
});

test('panel settings require password confirmation when 2FA confirmPassword is enabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $this->actingAs(User::factory()->doctor()->create())
        ->get(route('doctor.settings'))
        ->assertRedirect(route('password.confirm'));
});

test('doctor settings is forbidden for non-doctor roles', function () {
    $this->actingAs(User::factory()->secretary()->create())
        ->get(route('doctor.settings'))
        ->assertForbidden();
});

test('secretary settings is forbidden for a doctor', function () {
    $this->actingAs(User::factory()->doctor()->create())
        ->get(route('secretary.settings'))
        ->assertForbidden();
});
