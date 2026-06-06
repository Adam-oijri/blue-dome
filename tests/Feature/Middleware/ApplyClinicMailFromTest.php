<?php

use App\Models\Clinic;
use App\Models\EmailIntegration;
use App\Models\User;

it('overrides config(mail.from) when the authenticated clinic has an email integration', function (): void {
    $clinic = Clinic::factory()->create(['name' => 'Tazi Clinic']);
    $admin = User::factory()->secretary()->create(['clinic_id' => $clinic->id]);

    $integration = new EmailIntegration;
    $integration->clinic_id = $clinic->id;
    $integration->provider = 'smtp';
    $integration->from_email = 'appointments@tazi.ma';
    $integration->from_name = 'Tazi Appointments';
    $integration->is_active = true;
    $integration->save();

    config(['mail.from.address' => 'default@bluedome.local', 'mail.from.name' => 'Blue Dome']);

    $this->actingAs($admin)
        ->get('/ma-fr/secretary')
        ->assertOk();

    expect(config('mail.from.address'))->toBe('appointments@tazi.ma')
        ->and(config('mail.from.name'))->toBe('Tazi Appointments');
});

it('leaves the default config(mail.from) intact when no integration exists', function (): void {
    $clinic = Clinic::factory()->create();
    $admin = User::factory()->secretary()->create(['clinic_id' => $clinic->id]);

    config(['mail.from.address' => 'default@bluedome.local', 'mail.from.name' => 'Blue Dome']);

    $this->actingAs($admin)
        ->get('/ma-fr/secretary')
        ->assertOk();

    expect(config('mail.from.address'))->toBe('default@bluedome.local')
        ->and(config('mail.from.name'))->toBe('Blue Dome');
});

it('falls through silently for unauthenticated requests', function (): void {
    config(['mail.from.address' => 'default@bluedome.local']);

    $this->get('/ma-fr/')->assertOk();

    expect(config('mail.from.address'))->toBe('default@bluedome.local');
});
