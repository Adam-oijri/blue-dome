<?php

use App\Models\Clinic;
use App\Models\LabOrder;
use App\Models\MedicalRecord;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;

/**
 * Phase 8 exit-gate: a doctor at clinic B can create clinical records
 * (prescription, lab order, medical record) for a patient registered at
 * clinic A. The new record's `clinic_id` becomes clinic B (origin
 * attribution at the record level).
 */
beforeEach(function () {
    $this->clinicA = Clinic::factory()->create();
    $this->clinicB = Clinic::factory()->create();
    $this->patientOfA = Patient::factory()->create(['clinic_id' => $this->clinicA->id]);
    $this->doctorB = User::factory()->doctor()->create(['clinic_id' => $this->clinicB->id]);
});

it('lets doctor B write a medical record for clinic A\'s patient', function () {
    $this->actingAs($this->doctorB)->post(route('medical-records.store'), [
        'patient_id' => $this->patientOfA->id,
        'record_type' => 'progress',
        'title' => 'Cross-clinic visit',
        'assessment' => 'Patient stable on current regimen.',
    ])->assertSessionHasNoErrors();

    $record = MedicalRecord::query()
        ->where('patient_id', $this->patientOfA->id)
        ->first();

    expect($record)->not->toBeNull();
    expect($record->clinic_id)->toBe($this->clinicB->id);
});

it('lets doctor B prescribe for clinic A\'s patient', function () {
    $medicationB = Medication::factory()->create(['clinic_id' => $this->clinicB->id]);

    $this->actingAs($this->doctorB)->post(route('prescriptions.store'), [
        'patient_id' => $this->patientOfA->id,
        'items' => [[
            'medication_id' => $medicationB->id,
            'dosage' => '500mg',
            'frequency_per_day' => 3,
            'duration_days' => 5,
        ]],
    ])->assertSessionHasNoErrors();

    expect(Prescription::query()->where('patient_id', $this->patientOfA->id)->where('clinic_id', $this->clinicB->id)->exists())
        ->toBeTrue();
});

it('lets doctor B order labs for clinic A\'s patient', function () {
    $this->actingAs($this->doctorB)->post(route('lab-orders.store'), [
        'patient_id' => $this->patientOfA->id,
        'items' => [['test_name' => 'Hemoglobin A1c']],
    ])->assertSessionHasNoErrors();

    expect(LabOrder::query()->where('patient_id', $this->patientOfA->id)->where('clinic_id', $this->clinicB->id)->exists())
        ->toBeTrue();
});
