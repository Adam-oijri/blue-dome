<?php

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->clinic = Clinic::factory()->create();
});

it('lets a super-admin create a patient on the route clinic, not their own', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.patients.store', $this->clinic), [
            'first_name' => 'Cross',
            'last_name' => 'Tenant',
        ])
        ->assertSessionHasNoErrors();

    $patient = Patient::query()->where('last_name', 'Tenant')->first();

    expect($patient)->not->toBeNull()
        ->and($patient->clinic_id)->toBe($this->clinic->id)
        ->and($patient->clinic_id)->not->toBe($this->superAdmin->clinic_id);
});

it('lets a super-admin update and delete a route-clinic patient', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id, 'first_name' => 'Old']);

    $this->actingAs($this->superAdmin)
        ->patch(route('super-admin.clinics.patients.update', ['clinic' => $this->clinic->id, 'patient' => $patient->id]), ['first_name' => 'New'])
        ->assertSessionHasNoErrors();
    expect($patient->fresh()->first_name)->toBe('New');

    $this->actingAs($this->superAdmin)
        ->delete(route('super-admin.clinics.patients.destroy', ['clinic' => $this->clinic->id, 'patient' => $patient->id]))
        ->assertSessionHasNoErrors();
    expect(Patient::withTrashed()->find($patient->id)->trashed())->toBeTrue();
});

it('404s editing a patient from a different clinic via the route clinic', function () {
    $other = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $other->id]);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.clinics.patients.edit', ['clinic' => $this->clinic->id, 'patient' => $patient->id]))
        ->assertNotFound();
});

it('scopes patient_code uniqueness to the route clinic', function () {
    Patient::factory()->create(['clinic_id' => $this->clinic->id, 'patient_code' => 'P-DUP']);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.patients.store', $this->clinic), ['first_name' => 'X', 'last_name' => 'Y', 'patient_code' => 'P-DUP'])
        ->assertSessionHasErrors('patient_code');

    $other = Clinic::factory()->create();
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.patients.store', $other), ['first_name' => 'X', 'last_name' => 'Y', 'patient_code' => 'P-DUP'])
        ->assertSessionHasNoErrors();
});

it('forbids doctor and secretary from clinic-scoped patient routes', function (string $role) {
    $actor = User::factory()->{$role}()->create();

    $this->actingAs($actor)
        ->get(route('super-admin.clinics.patients.index', $this->clinic))
        ->assertForbidden();
    $this->actingAs($actor)
        ->post(route('super-admin.clinics.patients.store', $this->clinic), ['first_name' => 'X', 'last_name' => 'Y'])
        ->assertForbidden();
})->with(['doctor', 'secretary']);
