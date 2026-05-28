<?php

use App\Models\Clinic;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;

it('allocates prescription_number per clinic with RX- prefix and per-clinic series', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();

    // Phase 2 ClinicObserver seeded the prescription_number sequence on
    // clinic creation, so we can allocate directly here.
    $patientA = Patient::factory()->create(['clinic_id' => $clinicA->id]);
    $doctorA = User::factory()->doctor()->create(['clinic_id' => $clinicA->id]);
    $medA = Medication::factory()->create(['clinic_id' => $clinicA->id]);

    $patientB = Patient::factory()->create(['clinic_id' => $clinicB->id]);
    $doctorB = User::factory()->doctor()->create(['clinic_id' => $clinicB->id]);

    $first = Prescription::create([
        'clinic_id' => $clinicA->id,
        'patient_id' => $patientA->id,
        'doctor_id' => $doctorA->id,
        'status' => 'active',
    ]);
    $second = Prescription::create([
        'clinic_id' => $clinicA->id,
        'patient_id' => $patientA->id,
        'doctor_id' => $doctorA->id,
        'status' => 'active',
    ]);
    $clinicBFirst = Prescription::create([
        'clinic_id' => $clinicB->id,
        'patient_id' => $patientB->id,
        'doctor_id' => $doctorB->id,
        'status' => 'active',
    ]);

    expect($first->prescription_number)->toMatch('/^RX-\d{6}$/')
        ->and($second->prescription_number)->toMatch('/^RX-\d{6}$/')
        ->and($first->prescription_number)->not->toBe($second->prescription_number)
        ->and(intval(substr($second->prescription_number, 3)))
        ->toBe(intval(substr($first->prescription_number, 3)) + 1)
        ->and($clinicBFirst->prescription_number)->toMatch('/^RX-\d{6}$/');
});
