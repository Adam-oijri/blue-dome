<?php

use App\Models\Clinic;
use App\Models\Prescription;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('streams a prescription PDF for the prescribing doctor', function () {
    $rx = Prescription::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $response = $this->actingAs($this->doctor)->get(route('prescriptions.pdf', $rx));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
    expect(strlen((string) $response->getContent()))->toBeGreaterThan(500);
});
