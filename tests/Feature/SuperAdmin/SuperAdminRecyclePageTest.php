<?php

use App\Models\ActivityLog;
use App\Models\Clinic;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('lists soft-deleted clinics on the recycle page', function () {
    $clinic = Clinic::factory()->create();
    $clinic->delete();

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.recycle', ['type' => 'clinic']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/super-admin/recycle')
            ->where('type', 'clinic')
            ->has('records.data', 1)
            ->where('records.data.0.id', $clinic->id)
        );
});

it('restores a soft-deleted clinic and writes an activity log entry', function () {
    $clinic = Clinic::factory()->create();
    $clinic->delete();

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.recycle.restore', ['type' => 'clinic', 'id' => $clinic->id]))
        ->assertRedirect();

    expect($clinic->fresh()->deleted_at)->toBeNull();
    expect(ActivityLog::query()->where('action', 'restore')->where('entity_id', $clinic->id)->exists())->toBeTrue();
});

it('rejects unknown types', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.recycle.restore', ['type' => 'nonexistent', 'id' => 'whatever']))
        ->assertNotFound();
});

it('blocks non-super-admin from the recycle page', function () {
    $this->actingAs(User::factory()->doctor()->create())
        ->get(route('super-admin.recycle'))
        ->assertForbidden();
});
