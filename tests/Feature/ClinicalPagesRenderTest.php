<?php

use App\Models\Clinic;
use App\Models\MedicalRecord;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

// --- Patients ---------------------------------------------------------------

it('renders the patients index with paginated data and filters', function () {
    Patient::factory()->count(2)->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->doctor)
        ->get(route('patients.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('patients/index')
            ->has('patients.data', 2)
            ->has('filters')
        );
});

it('filters the patients index by search query', function () {
    Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'first_name' => 'Zorglubzz',
        'last_name' => 'Xyzzy',
    ]);
    Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'first_name' => 'Common',
        'last_name' => 'Name',
    ]);

    $this->actingAs($this->doctor)
        ->get(route('patients.index', ['q' => 'Zorglubzz']))
        ->assertInertia(fn ($page) => $page
            ->where('filters.q', 'Zorglubzz')
            ->has('patients.data', 1)
        );
});

it('renders the patient show with PII and deferred props', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->doctor)
        ->get(route('patients.show', $patient))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('patients/show')
            ->where('patient.id', $patient->id)
            ->has('national_id')
            ->has('insurance_number')
        );
});

// --- Prescriptions ----------------------------------------------------------

it('renders the prescriptions index with data and filters', function () {
    Prescription::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => Patient::factory()->create(['clinic_id' => $this->clinic->id])->id,
    ]);

    $this->actingAs($this->doctor)
        ->get(route('prescriptions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('prescriptions/index')
            ->has('prescriptions.data')
            ->has('filters')
        );
});

it('renders the prescription create form with patient and medication options', function () {
    Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    Medication::factory()->create(['clinic_id' => $this->clinic->id, 'is_active' => true]);

    $this->actingAs($this->doctor)
        ->get(route('prescriptions.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('prescriptions/create')
            ->has('patients', 1)
            ->has('medications', 1)
        );
});

it('renders the prescription show with items and edit form', function () {
    $rx = Prescription::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
        'patient_id' => Patient::factory()->create(['clinic_id' => $this->clinic->id])->id,
    ]);

    $this->actingAs($this->doctor)
        ->get(route('prescriptions.show', $rx))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('prescriptions/show')
            ->where('prescription.id', $rx->id)
            ->has('prescription.items')
        );

    $this->actingAs($this->doctor)
        ->get(route('prescriptions.edit', $rx))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('prescriptions/edit')
            ->where('prescription.id', $rx->id)
        );
});

// --- Medical records --------------------------------------------------------

it('renders the medical-records index with data and filters', function () {
    MedicalRecord::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => Patient::factory()->create(['clinic_id' => $this->clinic->id])->id,
    ]);

    $this->actingAs($this->doctor)
        ->get(route('medical-records.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('medical-records/index')
            ->has('records.data')
            ->has('filters')
        );
});

it('renders the medical record create form with patient options', function () {
    Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->doctor)
        ->get(route('medical-records.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('medical-records/create')
            ->has('patients', 1)
        );
});

it('renders the medical record show and edit with decrypted clinical props', function () {
    $record = MedicalRecord::factory()->create([
        'clinic_id' => $this->clinic->id,
        'recorded_by' => $this->doctor->id,
        'is_signed' => false,
        'patient_id' => Patient::factory()->create(['clinic_id' => $this->clinic->id])->id,
    ]);

    $this->actingAs($this->doctor)
        ->get(route('medical-records.show', $record))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('medical-records/show')
            ->where('record.id', $record->id)
            ->has('clinical.subjective')
            ->has('clinical.plan')
        );

    $this->actingAs($this->doctor)
        ->get(route('medical-records.edit', $record))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('medical-records/edit')
            ->where('record.id', $record->id)
            ->has('clinical')
        );
});
