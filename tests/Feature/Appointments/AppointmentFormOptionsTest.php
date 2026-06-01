<?php

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('returns the actor clinic patients for the create-appointment sheet', function () {
    $mine = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $otherClinic = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);

    $response = $this->actingAs($this->doctor)
        ->getJson(route('appointments.form-options'));

    $response->assertOk();

    $ids = collect($response->json('patients'))->pluck('id');

    expect($ids)->toContain($mine->id);
    expect($ids)->not->toContain($otherPatient->id);
});

it('rejects guests', function () {
    $this->getJson(route('appointments.form-options'))->assertUnauthorized();
});
