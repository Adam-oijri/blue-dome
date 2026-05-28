<?php

use App\Models\Clinic;
use App\Models\DrugInteraction;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->actingAs($this->doctor);
});

it('blocks a prescription with a major drug interaction with 422', function () {
    $warfarin = Medication::factory()->create([
        'clinic_id' => $this->clinic->id,
        'trade_name' => 'Coumadine',
        'generic_name' => 'warfarine',
    ]);
    $aspirin = Medication::factory()->create([
        'clinic_id' => $this->clinic->id,
        'trade_name' => 'Aspégic',
        'generic_name' => 'aspirine',
    ]);

    DrugInteraction::factory()->forPair($warfarin->id, $aspirin->id, 'major')->create();

    $this->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [
            ['medication_id' => $warfarin->id, 'dosage' => '5mg'],
            ['medication_id' => $aspirin->id, 'dosage' => '100mg'],
        ],
    ])->assertSessionHasErrors('items');
});

it('blocks a prescription with a moderate drug interaction', function () {
    $ace = Medication::factory()->create(['clinic_id' => $this->clinic->id, 'generic_name' => 'lisinopril']);
    $diuretic = Medication::factory()->create(['clinic_id' => $this->clinic->id, 'generic_name' => 'spironolactone']);

    DrugInteraction::factory()->forPair($ace->id, $diuretic->id, 'moderate')->create();

    $this->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [
            ['medication_id' => $ace->id, 'dosage' => '10mg'],
            ['medication_id' => $diuretic->id, 'dosage' => '25mg'],
        ],
    ])->assertSessionHasErrors('items');
});

it('allows a prescription with no known interactions', function () {
    $m1 = Medication::factory()->create(['clinic_id' => $this->clinic->id, 'generic_name' => 'paracetamol']);
    $m2 = Medication::factory()->create(['clinic_id' => $this->clinic->id, 'generic_name' => 'amoxicilline']);

    $this->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [
            ['medication_id' => $m1->id, 'dosage' => '500mg'],
            ['medication_id' => $m2->id, 'dosage' => '500mg'],
        ],
    ])->assertSessionHasNoErrors();
});

it('allows a prescription with a minor interaction (warning only, not blocked)', function () {
    $m1 = Medication::factory()->create(['clinic_id' => $this->clinic->id, 'generic_name' => 'metformine']);
    $m2 = Medication::factory()->create(['clinic_id' => $this->clinic->id, 'generic_name' => 'atorvastatine']);

    DrugInteraction::factory()->forPair($m1->id, $m2->id, 'minor')->create();

    $this->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [
            ['medication_id' => $m1->id, 'dosage' => '850mg'],
            ['medication_id' => $m2->id, 'dosage' => '20mg'],
        ],
    ])->assertSessionHasNoErrors();
});
