<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('lets doctor / secretary list appointments', function (string $role) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    Appointment::factory()->count(2)->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->actingAs($actor)->get(route('appointments.index'))->assertSuccessful();
})->with(['doctor', 'secretary']);

it('lets clinic staff and super_admin schedule an appointment', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $start = now()->addDays(2)->setTime(10, 0);
    $end = (clone $start)->addMinutes(30);

    $response = $this->actingAs($actor)
        ->post(route('appointments.store'), [
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctor->id,
            'scheduled_start' => $start->toDateTimeString(),
            'scheduled_end' => $end->toDateTimeString(),
            'type' => 'consultation',
        ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        expect(Appointment::query()->where('patient_id', $this->patient->id)->exists())->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', true],
    ['doctor', true],
    ['secretary', true],
]);

it('lets a secretary cancel an appointment', function () {
    $secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $appointment = Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->actingAs($secretary)
        ->post(route('appointments.cancel', $appointment), [
            'cancelled_reason' => 'Patient called to reschedule',
        ])
        ->assertSessionHasNoErrors();

    expect($appointment->fresh()->status)->toBe('cancelled');
    expect($appointment->fresh()->cancelled_reason)->toBe('Patient called to reschedule');
});

it('lets a clinic schedule an appointment for a patient from another clinic (Phase 8 global access)', function () {
    $otherClinic = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);

    $actor = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $start = now()->addDays(2)->setTime(10, 0);

    $this->actingAs($actor)
        ->post(route('appointments.store'), [
            'patient_id' => $otherPatient->id,
            'doctor_id' => $this->doctor->id,
            'scheduled_start' => $start->toDateTimeString(),
            'scheduled_end' => $start->copy()->addMinutes(30)->toDateTimeString(),
        ])
        ->assertSessionHasNoErrors();

    $appointment = Appointment::query()
        ->where('patient_id', $otherPatient->id)
        ->first();

    expect($appointment)->not->toBeNull();
    expect($appointment->clinic_id)->toBe($this->clinic->id); // appointment is at the actor's clinic
});
