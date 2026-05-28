<?php

use App\Models\Clinic;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\User;

it('allocates lab_order_number per clinic with LAB- prefix and per-clinic series', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();

    $patientA = Patient::factory()->create(['clinic_id' => $clinicA->id]);
    $doctorA = User::factory()->doctor()->create(['clinic_id' => $clinicA->id]);

    $patientB = Patient::factory()->create(['clinic_id' => $clinicB->id]);
    $doctorB = User::factory()->doctor()->create(['clinic_id' => $clinicB->id]);

    $first = LabOrder::create([
        'clinic_id' => $clinicA->id,
        'patient_id' => $patientA->id,
        'doctor_id' => $doctorA->id,
    ]);
    $second = LabOrder::create([
        'clinic_id' => $clinicA->id,
        'patient_id' => $patientA->id,
        'doctor_id' => $doctorA->id,
    ]);
    $clinicBFirst = LabOrder::create([
        'clinic_id' => $clinicB->id,
        'patient_id' => $patientB->id,
        'doctor_id' => $doctorB->id,
    ]);

    expect($first->lab_order_number)->toMatch('/^LAB-\d{6}$/')
        ->and($second->lab_order_number)->toMatch('/^LAB-\d{6}$/')
        ->and($first->lab_order_number)->not->toBe($second->lab_order_number)
        ->and($clinicBFirst->lab_order_number)->toMatch('/^LAB-\d{6}$/');
});
