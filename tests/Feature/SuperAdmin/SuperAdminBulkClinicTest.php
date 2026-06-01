<?php

use App\Models\ActivityLog;
use App\Models\Clinic;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('bulk-suspends clinics and logs the change', function () {
    $a = Clinic::factory()->create(['subscription_status' => 'active', 'is_active' => true]);
    $b = Clinic::factory()->create(['subscription_status' => 'trial', 'is_active' => true]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.bulk'), ['action' => 'suspend', 'ids' => [$a->id, $b->id]])
        ->assertSessionHasNoErrors();

    expect($a->fresh()->subscription_status)->toBe('suspended')
        ->and($a->fresh()->is_active)->toBeFalse()
        ->and($b->fresh()->subscription_status)->toBe('suspended');

    expect(
        ActivityLog::query()
            ->where('action', 'subscription_changed')
            ->where('entity_id', $a->id)
            ->exists()
    )->toBeTrue();
});

it('bulk-restores clinics', function () {
    $a = Clinic::factory()->create(['subscription_status' => 'suspended', 'is_active' => false]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.bulk'), ['action' => 'restore', 'ids' => [$a->id]])
        ->assertSessionHasNoErrors();

    expect($a->fresh()->is_active)->toBeTrue()
        ->and($a->fresh()->subscription_status)->not->toBe('suspended');
});

it('forbids doctor and secretary from bulk clinic actions', function (string $role) {
    $clinic = Clinic::factory()->create();

    $this->actingAs(User::factory()->{$role}()->create())
        ->post(route('super-admin.clinics.bulk'), ['action' => 'suspend', 'ids' => [$clinic->id]])
        ->assertForbidden();
})->with(['doctor', 'secretary']);
