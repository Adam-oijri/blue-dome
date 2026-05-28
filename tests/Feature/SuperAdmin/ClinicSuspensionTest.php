<?php

use App\Models\ActivityLog;
use App\Models\Clinic;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->clinic = Clinic::factory()->create([
        'subscription_status' => 'active',
        'is_active' => true,
    ]);
});

it('suspends a clinic, flips status and is_active, and writes a subscription_changed activity row', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.suspend', $this->clinic), [
            'reason' => 'non-payment',
        ])
        ->assertRedirect();

    $this->clinic->refresh();
    expect($this->clinic->subscription_status)->toBe('suspended');
    expect($this->clinic->is_active)->toBeFalse();

    $row = ActivityLog::query()
        ->where('action', 'subscription_changed')
        ->where('entity_type', 'Clinic')
        ->where('entity_id', $this->clinic->id)
        ->first();

    expect($row)->not->toBeNull();
    expect($row->description)->toBe('non-payment');
    expect($row->user_id)->toBe($this->superAdmin->id);
    expect($row->new_values['subscription_status'])->toBe('suspended');
    expect($row->new_values['is_active'])->toBeFalse();
    expect($row->old_values['subscription_status'])->toBe('active');
});

it('restores a suspended clinic back to active and writes a second activity row', function () {
    $this->clinic->forceFill([
        'subscription_status' => 'suspended',
        'is_active' => false,
        'subscription_expiry' => now()->addMonths(3)->toDateString(),
    ])->save();

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.restore', $this->clinic), [
            'reason' => 'paid up',
        ])
        ->assertRedirect();

    $this->clinic->refresh();
    expect($this->clinic->subscription_status)->toBe('active');
    expect($this->clinic->is_active)->toBeTrue();

    $row = ActivityLog::query()
        ->where('action', 'subscription_changed')
        ->where('entity_id', $this->clinic->id)
        ->where('description', 'paid up')
        ->first();

    expect($row)->not->toBeNull();
    expect($row->new_values['subscription_status'])->toBe('active');
});

it('falls back to trial status when restoring a clinic with no future expiry', function () {
    $this->clinic->forceFill([
        'subscription_status' => 'suspended',
        'is_active' => false,
        'subscription_expiry' => now()->subDay()->toDateString(),
    ])->save();

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.restore', $this->clinic));

    $this->clinic->refresh();
    expect($this->clinic->subscription_status)->toBe('trial');
});

it('rejects a secretary trying to suspend a clinic', function () {
    $secretary = User::factory()->secretary()->create();

    $this->actingAs($secretary)
        ->post(route('super-admin.clinics.suspend', $this->clinic), ['reason' => 'x'])
        ->assertForbidden();
});

it('requires a reason when suspending', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.suspend', $this->clinic), [])
        ->assertSessionHasErrors('reason');

    $this->clinic->refresh();
    expect($this->clinic->subscription_status)->toBe('active');
});
