<?php

use App\Contracts\WhatsAppGateway;
use App\Models\Clinic;
use App\Models\User;
use App\Models\WhatsAppIntegration;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;
use Mockery\MockInterface;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::resetPasswords());
});

test('reset password link screen can be rendered', function () {
    $response = $this->get(route('password.request'));

    $response->assertOk();
});

test('reset password link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('reset password screen can be rendered', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
        $response = $this->get(route('password.reset', $notification->token));

        $response->assertOk();

        return true;
    });
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->post(route('password.update'), [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        return true;
    });
});

test('password cannot be reset with invalid token', function () {
    $user = User::factory()->create();

    $response = $this->post(route('password.update'), [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('password reset link is also pushed via WhatsApp when phone + integration present', function () {
    Notification::fake();

    $gateway = $this->mock(WhatsAppGateway::class, function (MockInterface $mock) {
        $mock->shouldReceive('sendPasswordReset')
            ->once()
            ->with(Mockery::on(fn ($user) => $user->phone === '+212600000000'), Mockery::type('string'));
    });

    $clinic = Clinic::factory()->create();
    WhatsAppIntegration::create([
        'clinic_id' => $clinic->id,
        'phone_number_id' => '1234567890',
        'business_account_id' => '9876543210',
        'access_token_enc' => 'encrypted-stub',
        'is_active' => true,
    ]);

    $user = User::factory()->create([
        'clinic_id' => $clinic->id,
        'phone' => '+212600000000',
    ]);

    $this->post(route('password.email'), ['email' => $user->email])->assertSessionHasNoErrors();

    Notification::assertSentTo($user, ResetPassword::class);
});

test('password reset link skips WhatsApp when phone is missing', function () {
    Notification::fake();

    $this->mock(WhatsAppGateway::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('sendPasswordReset');
    });

    $clinic = Clinic::factory()->create();
    WhatsAppIntegration::create([
        'clinic_id' => $clinic->id,
        'phone_number_id' => '1234567890',
        'business_account_id' => '9876543210',
        'access_token_enc' => 'encrypted-stub',
        'is_active' => true,
    ]);

    $user = User::factory()->create([
        'clinic_id' => $clinic->id,
        'phone' => null,
    ]);

    $this->post(route('password.email'), ['email' => $user->email])->assertSessionHasNoErrors();

    Notification::assertSentTo($user, ResetPassword::class);
});

test('password reset link skips WhatsApp when the clinic has no integration row', function () {
    Notification::fake();

    $this->mock(WhatsAppGateway::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('sendPasswordReset');
    });

    $clinic = Clinic::factory()->create();

    $user = User::factory()->create([
        'clinic_id' => $clinic->id,
        'phone' => '+212600000000',
    ]);

    $this->post(route('password.email'), ['email' => $user->email])->assertSessionHasNoErrors();

    Notification::assertSentTo($user, ResetPassword::class);
});
