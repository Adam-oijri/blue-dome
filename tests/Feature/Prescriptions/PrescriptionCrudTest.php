<?php

use App\Models\Clinic;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $this->medication = Medication::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('lets all clinic staff list prescriptions', function (string $role) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    Prescription::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
    ]);

    $this->actingAs($actor)
        ->get(route('prescriptions.index'))
        ->assertSuccessful();
})->with(['super_admin', 'doctor', 'secretary']);

it('only lets doctors create prescriptions', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [[
            'medication_id' => $this->medication->id,
            'dosage' => '500mg',
            'frequency_per_day' => 3,
            'duration_days' => 7,
            'route' => 'oral',
        ]],
    ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect(Prescription::query()->where('patient_id', $this->patient->id)->exists())->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', false],
    ['doctor', true],
    ['secretary', false],
]);

it('lets a doctor prescribe for a patient from another clinic (Phase 8 global access)', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $otherClinic = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);

    $this->actingAs($doctor)->post(route('prescriptions.store'), [
        'patient_id' => $otherPatient->id,
        'items' => [[
            'medication_id' => $this->medication->id,
            'dosage' => '500mg',
            'frequency_per_day' => 3,
            'duration_days' => 7,
            'route' => 'oral',
        ]],
    ])->assertSessionHasNoErrors();

    $prescription = Prescription::query()
        ->where('patient_id', $otherPatient->id)
        ->first();

    expect($prescription)->not->toBeNull();
    // The prescription's clinic_id is the prescriber's clinic, not the
    // patient's — origin attribution for the Rx itself, while the patient
    // record's origin clinic stays $otherClinic.
    expect($prescription->clinic_id)->toBe($this->clinic->id);
});
