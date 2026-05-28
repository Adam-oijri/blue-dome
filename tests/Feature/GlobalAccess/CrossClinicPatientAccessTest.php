<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * Phase 8 exit-gate: any staff role at any clinic can see and update any
 * patient. Origin clinic is preserved on the row; the editor's clinic is
 * captured in field_changes.
 */
beforeEach(function () {
    $this->clinicA = Clinic::factory()->create(['name' => 'Clinic A']);
    $this->clinicB = Clinic::factory()->create(['name' => 'Clinic B']);

    $this->patientOfA = Patient::factory()->create([
        'clinic_id' => $this->clinicA->id,
        'first_name' => 'Origin-A',
    ]);
});

it('lets every staff role at clinic B view clinic A\'s patient', function (string $role) {
    $actorB = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinicB->id]);

    $this->actingAs($actorB)
        ->get(route('patients.show', $this->patientOfA))
        ->assertSuccessful();
})->with(['doctor', 'secretary']);

it('lets a clinic B secretary update clinic A\'s patient', function () {
    $actorB = User::factory()->secretary()->create(['clinic_id' => $this->clinicB->id]);

    $this->actingAs($actorB)
        ->patch(route('patients.update', $this->patientOfA), ['first_name' => 'Edited-By-B'])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $fresh = $this->patientOfA->fresh();
    expect($fresh->first_name)->toBe('Edited-By-B');
    expect($fresh->clinic_id)->toBe($this->clinicA->id); // origin preserved
});

it('includes the origin clinic name in the patient show payload', function () {
    $actorB = User::factory()->doctor()->create(['clinic_id' => $this->clinicB->id]);

    $this->actingAs($actorB)
        ->get(route('patients.show', $this->patientOfA))
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('patients/show')
            ->where('patient.clinic.name', 'Clinic A')
            ->where('patient.clinic_id', $this->clinicA->id)
        );
});

it('still isolates invoices per clinic as a sanity check', function () {
    $adminB = User::factory()->secretary()->create(['clinic_id' => $this->clinicB->id]);

    // Seed an invoice owned by clinic A. Clinic B should NOT see it on
    // their invoices index because billing remains clinic-isolated.
    Invoice::factory()->create([
        'clinic_id' => $this->clinicA->id,
        'patient_id' => $this->patientOfA->id,
    ]);

    $response = $this->actingAs($adminB)
        ->get(route('invoices.index'))
        ->assertSuccessful();

    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->where('invoices.data', [])
    );
});
