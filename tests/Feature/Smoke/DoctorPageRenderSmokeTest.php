<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Document;
use App\Models\LabOrder;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;

/**
 * Render smoke: every page a doctor can reach returns 200 with the expected
 * Inertia component. Catches controller 500s, wrong components and missing
 * props. Pages a doctor is *forbidden* from (invoices/expenses/vendors and the
 * inventory/medication create/edit screens) are covered by the secretary smoke
 * and the per-module CRUD permission tests instead.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('renders parameterless doctor pages', function (string $routeName, string $component) {
    $this->actingAs($this->doctor)
        // Satisfy Fortify's password.confirm gate on the settings/security pages.
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component($component));
})->with([
    ['appointments.index', 'appointments/index'],
    ['patients.index', 'patients/index'],
    ['prescriptions.index', 'prescriptions/index'],
    ['medical-records.index', 'medical-records/index'],
    ['lab-orders.index', 'lab-orders/index'],
    ['medications.index', 'medications/index'],
    ['inventory.index', 'inventory/index'],
    ['inventory.alerts', 'inventory/alerts'],
    ['documents.index', 'documents/index'],
    ['document-folders.index', 'document-folders/index'],
    ['doctor.dashboard', 'panels/doctor/dashboard'],
    ['doctor.calendar', 'panels/doctor/calendar'],
    ['doctor.confirmations', 'panels/doctor/confirmations'],
    ['doctor.settings', 'panels/doctor/settings'],
    ['appearance.edit', 'settings/appearance'],
    ['profile.edit', 'settings/profile'],
    ['security.edit', 'settings/security'],
]);

it('renders appointment show', function () {
    $appointment = Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->actingAs($this->doctor)->get(route('appointments.show', $appointment))
        ->assertOk()->assertInertia(fn ($p) => $p->component('appointments/show'));
});

it('renders patient show and vital-signs', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->doctor)->get(route('patients.show', $patient))
        ->assertOk()->assertInertia(fn ($p) => $p->component('patients/show'));
    $this->actingAs($this->doctor)->get(route('patients.vital-signs.index', $patient))
        ->assertOk()->assertInertia(fn ($p) => $p->component('patients/vital-signs'));
});

it('renders prescription show', function () {
    $rx = Prescription::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->actingAs($this->doctor)->get(route('prescriptions.show', $rx))
        ->assertOk()->assertInertia(fn ($p) => $p->component('prescriptions/show'));
});

it('renders medical record show', function () {
    $record = MedicalRecord::factory()->create([
        'clinic_id' => $this->clinic->id,
        'recorded_by' => $this->doctor->id,
        'is_signed' => false,
    ]);

    $this->actingAs($this->doctor)->get(route('medical-records.show', $record))
        ->assertOk()->assertInertia(fn ($p) => $p->component('medical-records/show'));
});

it('renders lab order show', function () {
    $order = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->actingAs($this->doctor)->get(route('lab-orders.show', $order))
        ->assertOk()->assertInertia(fn ($p) => $p->component('lab-orders/show'));
});

it('renders document show', function () {
    $document = Document::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->doctor)->get(route('documents.show', $document))
        ->assertOk()->assertInertia(fn ($p) => $p->component('documents/show'));
});

it('exposes patient options on the lab order index for the create sheet', function () {
    Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->doctor)->get(route('lab-orders.index'))
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->component('lab-orders/index')
            ->has('patients', 1)
        );
});

it('exposes patient options via the appointment form-options endpoint', function () {
    Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->doctor)->getJson(route('appointments.form-options'))
        ->assertOk()
        ->assertJsonCount(1, 'patients');
});
