<?php

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

/**
 * Permission matrix verification per IMPLEMENTATION_GUIDE.md §permission rules:
 *
 *   index   create   view   update   delete
 *   ─────   ──────   ────   ──────   ──────
 *   sa  ✓     ✓       ✓       ✓        ✓
 *   dr  ✓     ✓       ✓       ✓        ✗
 *   sec ✓     ✓       ✓       ✓        ✓
 *
 * The secretary is the clinic manager and holds the full staff permission set.
 * super_admin can manage operational data cross-tenant (Phase: super-admin
 * operational management). Each test slice creates a fresh clinic + actor.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
});

it('lets the right roles list patients', function (string $role) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    Patient::factory()->count(3)->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($actor)
        ->get(route('patients.index'))
        ->assertSuccessful();
})->with(['super_admin', 'doctor', 'secretary']);

it('lets clinic staff and super_admin create a patient', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)
        ->post(route('patients.store'), [
            'first_name' => 'Created',
            'last_name' => 'By'.ucfirst($role),
            'phone_e164' => '+212600000001',
        ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect(Patient::query()->where('clinic_id', $this->clinic->id)->where('last_name', 'By'.ucfirst($role))->exists())->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', true],
    ['doctor', true],
    ['secretary', true],
]);

it('lets secretary and super_admin destroy a patient', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->delete(route('patients.destroy', $patient));

    if ($allowed) {
        $response->assertRedirect();
        expect($patient->fresh()->trashed())->toBeTrue();
    } else {
        $response->assertForbidden();
        expect($patient->fresh()->trashed())->toBeFalse();
    }
})->with([
    ['super_admin', true],
    ['doctor', false],
    ['secretary', true],
]);

it('lets clinic staff and super_admin update a patient', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id, 'first_name' => 'Original']);

    $response = $this->actingAs($actor)
        ->patch(route('patients.update', $patient), ['first_name' => 'Updated']);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect($patient->fresh()->first_name)->toBe('Updated');
    } else {
        $response->assertForbidden();
        expect($patient->fresh()->first_name)->toBe('Original');
    }
})->with([
    ['super_admin', true],
    ['doctor', true],
    ['secretary', true],
]);

it('returns 422 when patient_code is duplicated within the same clinic', function () {
    $admin = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    Patient::factory()->create(['clinic_id' => $this->clinic->id, 'patient_code' => 'PAT-CUSTOM']);

    $this->actingAs($admin)
        ->post(route('patients.store'), [
            'first_name' => 'Dup',
            'last_name' => 'Code',
            'patient_code' => 'PAT-CUSTOM',
        ])
        ->assertSessionHasErrors('patient_code');
});
