<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * Phase 8 (global-patient-access pivot): this file used to assert clinic A
 * cannot see clinic B's patients. That guarantee was deliberately removed in
 * the plan-mode session on 2026-05-22 (Option A). The tests below now assert
 * the opposite — clinic A can list, read, and update clinic B's patients —
 * with a sanity test confirming billing remains clinic-isolated.
 */
beforeEach(function () {
    $this->clinicA = Clinic::factory()->create(['name' => 'Clinic A']);
    $this->clinicB = Clinic::factory()->create(['name' => 'Clinic B']);

    $this->adminA = User::factory()->secretary()->create(['clinic_id' => $this->clinicA->id]);
    $this->adminB = User::factory()->secretary()->create(['clinic_id' => $this->clinicB->id]);

    Patient::factory()->count(2)->create(['clinic_id' => $this->clinicA->id]);
    Patient::factory()->count(2)->create(['clinic_id' => $this->clinicB->id]);
});

it('lists patients from every clinic on the index', function () {
    $this->actingAs($this->adminA)
        ->get(route('patients.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/index')
            ->has('patients.data', 4)
        );
});

it('lets the caller scope the index to a single origin clinic', function () {
    $this->actingAs($this->adminA)
        ->get(route('patients.index', ['origin_clinic' => $this->clinicB->id]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/index')
            ->has('patients.data', 2)
            ->where('patients.data.0.clinic_id', $this->clinicB->id)
        );
});

it('lets clinic A read clinic B\'s patient under the global-access model', function () {
    $clinicBPatient = Patient::query()->where('clinic_id', $this->clinicB->id)->first();

    $this->actingAs($this->adminA)
        ->get(route('patients.show', $clinicBPatient->id))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/show')
            ->where('patient.id', $clinicBPatient->id)
            ->where('patient.clinic_id', $this->clinicB->id)
            ->where('patient.clinic.name', $this->clinicB->name)
        );
});

it('lets clinic A update clinic B\'s patient and records the editor\'s clinic', function () {
    $clinicBPatient = Patient::query()->where('clinic_id', $this->clinicB->id)->first();

    $this->actingAs($this->adminA)
        ->patch(route('patients.update', $clinicBPatient->id), ['first_name' => 'Updated-By-A'])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $fresh = $clinicBPatient->fresh();

    expect($fresh->first_name)->toBe('Updated-By-A');
    // Origin clinic is preserved — clinic_id never changes.
    expect($fresh->clinic_id)->toBe($this->clinicB->id);
});

it('still isolates billing per clinic (sanity)', function () {
    // Invoices remain clinic-isolated per the Phase 8 locked scope.
    $clinicBInvoiceCount = Invoice::query()
        ->where('clinic_id', $this->clinicB->id)
        ->count();

    expect($clinicBInvoiceCount)->toBe(0);
});

it('lets a super_admin list patients across every clinic', function () {
    $superAdmin = User::factory()->superAdmin()->create(['clinic_id' => $this->clinicA->id]);

    $this->actingAs($superAdmin)
        ->get(route('patients.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/index')
            ->has('patients.data', 4)
        );
});
