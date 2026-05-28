<?php

use App\Models\Clinic;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\User;

/**
 * Phase 8 (global-patient-access pivot): the prior assertion that doctor B
 * gets a 403 reading clinic A's medical record was inverted on 2026-05-22.
 * Any doctor can now view any clinical record; provenance lives in
 * `field_changes`.
 */
it('lets a doctor from any clinic read a medical record', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();

    $patientA = Patient::factory()->create(['clinic_id' => $clinicA->id]);
    $recordA = MedicalRecord::factory()->soap()->create([
        'clinic_id' => $clinicA->id,
        'patient_id' => $patientA->id,
    ]);

    $doctorB = User::factory()->doctor()->create(['clinic_id' => $clinicB->id]);
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($doctorB)
        ->get(route('medical-records.show', $recordA))
        ->assertSuccessful();

    $this->actingAs($superAdmin)
        ->get(route('medical-records.show', $recordA))
        ->assertSuccessful();
});

it('blocks a secretary from reading a medical record', function () {
    // The IG permission matrix still restricts medical-record viewing to the
    // doctor role specifically; Phase 8 changed the cross-clinic rule, not
    // the role-rule.
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $record = MedicalRecord::factory()->soap()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
    ]);

    $actor = User::factory()->secretary()->create(['clinic_id' => $clinic->id]);

    $this->actingAs($actor)
        ->get(route('medical-records.show', $record))
        ->assertForbidden();
});
