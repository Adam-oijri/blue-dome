<?php

use App\Models\Clinic;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('lets a super-admin create a clinic with an auto-generated slug', function () {
    $this->actingAs($this->superAdmin)
        ->from(route('super-admin.clinics.create'))
        ->post(route('super-admin.clinics.store'), [
            'name' => 'Atlas Medical Center',
            'subscription_plan' => 'professional',
            'subscription_status' => 'active',
            'max_users' => 25,
        ])
        ->assertSessionHasNoErrors();

    $clinic = Clinic::query()->where('name', 'Atlas Medical Center')->first();

    expect($clinic)->not->toBeNull()
        ->and($clinic->slug)->toStartWith('atlas-medical-center-')
        ->and($clinic->subscription_plan)->toBe('professional')
        ->and($clinic->subscription_status)->toBe('active')
        ->and((int) $clinic->max_users)->toBe(25)
        ->and($clinic->is_active)->toBeTrue();
});

it('rejects an invalid subscription plan', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.store'), [
            'name' => 'Bad Plan Clinic',
            'subscription_plan' => 'platinum',
            'subscription_status' => 'active',
        ])
        ->assertSessionHasErrors('subscription_plan');

    expect(Clinic::query()->where('name', 'Bad Plan Clinic')->exists())->toBeFalse();
});

it('requires a clinic name', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.store'), [
            'subscription_plan' => 'free',
            'subscription_status' => 'trial',
        ])
        ->assertSessionHasErrors('name');
});

it('lets a super-admin update a clinic', function () {
    $clinic = Clinic::factory()->create(['name' => 'Old Name', 'max_users' => 5]);

    $this->actingAs($this->superAdmin)
        ->from(route('super-admin.clinics.edit', $clinic))
        ->patch(route('super-admin.clinics.update', $clinic), [
            'name' => 'New Name',
            'subscription_plan' => 'enterprise',
            'subscription_status' => 'active',
            'max_users' => 40,
        ])
        ->assertRedirect(route('super-admin.clinics.show', $clinic));

    $fresh = $clinic->fresh();
    expect($fresh->name)->toBe('New Name')
        ->and($fresh->subscription_plan)->toBe('enterprise')
        ->and((int) $fresh->max_users)->toBe(40);
});

it('forbids doctor and secretary from creating or editing clinics', function (string $role) {
    $clinic = Clinic::factory()->create();
    $actor = User::factory()->{$role}()->create();

    $this->actingAs($actor)->get(route('super-admin.clinics.create'))->assertForbidden();
    $this->actingAs($actor)
        ->post(route('super-admin.clinics.store'), [
            'name' => 'X', 'subscription_plan' => 'free', 'subscription_status' => 'trial',
        ])->assertForbidden();
    $this->actingAs($actor)->get(route('super-admin.clinics.edit', $clinic))->assertForbidden();
    $this->actingAs($actor)
        ->patch(route('super-admin.clinics.update', $clinic), [
            'name' => 'Y', 'subscription_plan' => 'free', 'subscription_status' => 'trial',
        ])->assertForbidden();
})->with(['doctor', 'secretary']);
