<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('renders the account settings page for super admin', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)
        ->get(route('super-admin.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('panels/super-admin/settings')
            ->where('canManageTwoFactor', true)
            ->where('twoFactorEnabled', false)
            ->where('mustVerifyEmail', true)
            ->has('passwordRules')
        );
});

test('settings page opens without password confirmation', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $superAdmin = User::factory()->superAdmin()->create();

    // Opening the page no longer bounces to the confirm-password screen; only
    // the embedded 2FA mutations stay gated by Fortify.
    $this->actingAs($superAdmin)
        ->get(route('super-admin.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('panels/super-admin/settings'));
});

test('blocks non-super-admin roles', function (callable $factory) {
    $this->actingAs($factory())
        ->get(route('super-admin.settings'))
        ->assertForbidden();
})->with([
    'doctor' => fn () => User::factory()->doctor()->create(),
    'secretary' => fn () => User::factory()->secretary()->create(),
]);
