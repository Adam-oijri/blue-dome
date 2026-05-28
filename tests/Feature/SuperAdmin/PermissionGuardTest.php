<?php

use App\Models\Clinic;
use App\Models\User;

/**
 * Access matrix for the super-admin panel: it is super_admin-only. Doctors and
 * secretaries are locked out of every route — read and write alike.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
});

dataset('locked_out_actors', [
    'doctor' => fn () => User::factory()->doctor()->create(),
    'secretary' => fn () => User::factory()->secretary()->create(),
]);

it('forbids the dashboard for doctor and secretary', function (callable $factory) {
    $this->actingAs($factory())
        ->get(route('super-admin.dashboard'))
        ->assertForbidden();
})->with('locked_out_actors');

it('forbids the clinic list for doctor and secretary', function (callable $factory) {
    $this->actingAs($factory())
        ->get(route('super-admin.clinics.index'))
        ->assertForbidden();
})->with('locked_out_actors');

it('forbids the clinic show for doctor and secretary', function (callable $factory) {
    $this->actingAs($factory())
        ->get(route('super-admin.clinics.show', $this->clinic))
        ->assertForbidden();
})->with('locked_out_actors');

it('forbids the activity log viewer for doctor and secretary', function (callable $factory) {
    $this->actingAs($factory())
        ->get(route('super-admin.activity-log'))
        ->assertForbidden();
})->with('locked_out_actors');

it('forbids clinic suspend for doctor and secretary', function (callable $factory) {
    $this->actingAs($factory())
        ->post(route('super-admin.clinics.suspend', $this->clinic), ['reason' => 'x'])
        ->assertForbidden();
})->with('locked_out_actors');

it('forbids clinic restore for doctor and secretary', function (callable $factory) {
    $this->actingAs($factory())
        ->post(route('super-admin.clinics.restore', $this->clinic))
        ->assertForbidden();
})->with('locked_out_actors');

it('forbids creating invitations for doctor and secretary', function (callable $factory) {
    $this->actingAs($factory())
        ->post(route('super-admin.invitations.store'), [
            'role' => 'doctor',
            'clinic_id' => $this->clinic->id,
            'first_name' => 'X',
            'last_name' => 'Y',
        ])
        ->assertForbidden();
})->with('locked_out_actors');

it('lets a super_admin reach the panel', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)->get(route('super-admin.dashboard'))->assertOk();
    $this->actingAs($superAdmin)->get(route('super-admin.clinics.index'))->assertOk();
    $this->actingAs($superAdmin)->get(route('super-admin.activity-log'))->assertOk();
});
