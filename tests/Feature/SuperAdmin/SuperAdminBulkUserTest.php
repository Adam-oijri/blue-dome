<?php

use App\Models\Clinic;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->clinic = Clinic::factory()->create();
});

it('bulk-activates users', function () {
    $a = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id, 'is_active' => false]);
    $b = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id, 'is_active' => false]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.users.bulk'), ['action' => 'activate', 'ids' => [$a->id, $b->id]])
        ->assertSessionHasNoErrors();

    expect($a->fresh()->is_active)->toBeTrue()
        ->and($b->fresh()->is_active)->toBeTrue();
});

it('bulk-deactivates users', function () {
    $a = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id, 'is_active' => true]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.users.bulk'), ['action' => 'deactivate', 'ids' => [$a->id]])
        ->assertSessionHasNoErrors();

    expect($a->fresh()->is_active)->toBeFalse();
});

it('bulk-soft-deletes users', function () {
    $a = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.users.bulk'), ['action' => 'delete', 'ids' => [$a->id]])
        ->assertSessionHasNoErrors();

    expect(User::withTrashed()->find($a->id)->trashed())->toBeTrue();
});

it('never bulk-deletes the acting super-admin even if included', function () {
    $other = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.users.bulk'), [
            'action' => 'delete',
            'ids' => [$this->superAdmin->id, $other->id],
        ])
        ->assertSessionHasNoErrors();

    expect(User::withTrashed()->find($this->superAdmin->id)->trashed())->toBeFalse()
        ->and(User::withTrashed()->find($other->id)->trashed())->toBeTrue();
});

it('rejects an empty selection', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.users.bulk'), ['action' => 'activate', 'ids' => []])
        ->assertSessionHasErrors('ids');
});

it('rejects an unknown action', function () {
    $a = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.users.bulk'), ['action' => 'nuke', 'ids' => [$a->id]])
        ->assertSessionHasErrors('action');
});

it('forbids doctor and secretary from bulk user actions', function (string $role) {
    $a = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs(User::factory()->{$role}()->create())
        ->post(route('super-admin.users.bulk'), ['action' => 'deactivate', 'ids' => [$a->id]])
        ->assertForbidden();
})->with(['doctor', 'secretary']);
