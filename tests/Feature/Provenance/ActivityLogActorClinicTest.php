<?php

use App\Models\ActivityLog;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

it('stamps activity_log.actor_clinic_id from the authenticated user\'s clinic', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();
    $patientOfA = Patient::factory()->create(['clinic_id' => $clinicA->id]);

    $actorB = User::factory()->secretary()->create(['clinic_id' => $clinicB->id]);

    $this->actingAs($actorB)
        ->patch(route('patients.update', $patientOfA), ['first_name' => 'X-Edit'])
        ->assertSessionHasNoErrors();

    $row = ActivityLog::query()
        ->where('entity_type', 'Patient')
        ->where('entity_id', $patientOfA->id)
        ->where('action', 'update')
        ->latest('created_at')
        ->first();

    expect($row)->not->toBeNull();
    expect($row->clinic_id)->toBe($clinicA->id); // record's origin clinic
    expect($row->actor_clinic_id)->toBe($clinicB->id); // editor's clinic
    expect($row->user_id)->toBe($actorB->id);
});
