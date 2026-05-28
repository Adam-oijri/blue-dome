<?php

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

/**
 * Phase 8 carve-out: patient erasure (Loi 09-08 / GDPR anonymization) is
 * restricted to the patient's origin clinic secretary. Clinic B's secretary
 * may view and update, but cannot trigger destructive erasure for a clinic A
 * patient.
 *
 * The Phase 5 PatientPolicy::erase still gates on origin-clinic membership;
 * this test re-asserts the contract under the new global-access regime so a
 * future cleanup doesn't accidentally relax it.
 */
it('lets only the origin clinic\'s secretary invoke erasure (policy gate)', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();
    $patientOfA = Patient::factory()->create(['clinic_id' => $clinicA->id]);

    $adminA = User::factory()->secretary()->create(['clinic_id' => $clinicA->id]);
    $adminB = User::factory()->secretary()->create(['clinic_id' => $clinicB->id]);

    expect($adminA->can('erase', $patientOfA))->toBeTrue();
    expect($adminB->can('erase', $patientOfA))->toBeFalse();

    // The export ability gets the same carve-out.
    expect($adminA->can('export', $patientOfA))->toBeTrue();
    expect($adminB->can('export', $patientOfA))->toBeFalse();
});
