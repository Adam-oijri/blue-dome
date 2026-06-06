<?php

use App\Models\User;
use App\Notifications\NewDeviceLoginNotification;
use App\Notifications\PasswordChangedNotification;
use App\Notifications\TwoFactorChangedNotification;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed;
use Laravel\Fortify\Events\TwoFactorAuthenticationDisabled;

test('confirming two-factor sends an enabled alert', function () {
    Notification::fake();

    $user = User::factory()->create();
    event(new TwoFactorAuthenticationConfirmed($user));

    Notification::assertSentTo(
        $user,
        TwoFactorChangedNotification::class,
        fn (TwoFactorChangedNotification $n) => $n->enabled === true,
    );
});

test('disabling two-factor sends a disabled alert', function () {
    Notification::fake();

    $user = User::factory()->create();
    event(new TwoFactorAuthenticationDisabled($user));

    Notification::assertSentTo(
        $user,
        TwoFactorChangedNotification::class,
        fn (TwoFactorChangedNotification $n) => $n->enabled === false,
    );
});

test('markEmailAsVerified syncs the email_verified boolean', function () {
    $user = User::factory()->unverified()->create();

    expect((bool) $user->email_verified)->toBeFalse();

    $user->markEmailAsVerified();
    $user->refresh();

    expect($user->email_verified_at)->not->toBeNull();
    expect($user->email_verified)->toBeTrue();
});

test('emails render in the recipient locale', function () {
    $user = User::factory()->create(['locale' => 'fr']);

    expect($user->preferredLocale())->toBe('fr');

    app()->setLocale('fr');

    expect((new PasswordChangedNotification)->toMail($user)->subject)
        ->toBe('Votre mot de passe a été modifié');
});

test('a sign-in from a new device alerts, the first device is silent', function () {
    Notification::fake();

    $user = User::factory()->create();

    // First login (Device A): the account's first-ever device — recorded
    // silently so signup/first login does not self-alert.
    $this->withHeaders(['User-Agent' => 'Mozilla/5.0 DeviceA'])
        ->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasNoErrors();

    Notification::assertNotSentTo($user, NewDeviceLoginNotification::class);

    $this->post(route('logout'));

    // Second login from a different device — should alert.
    $this->withHeaders(['User-Agent' => 'Mozilla/5.0 DeviceB'])
        ->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasNoErrors();

    Notification::assertSentTo($user, NewDeviceLoginNotification::class);
});
