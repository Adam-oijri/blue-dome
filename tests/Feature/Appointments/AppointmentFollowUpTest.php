<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('lets secretary record the follow-up call outcome', function () {
    $secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $appointment = Appointment::factory()->needingFollowUp()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->actingAs($secretary)
        ->post(route('appointments.follow-up-call', $appointment), [
            'follow_up_call_status' => 'completed',
            'follow_up_call_notes' => 'Patient confirmed by phone.',
        ])
        ->assertSessionHasNoErrors();

    $fresh = $appointment->fresh();
    expect($fresh->follow_up_call_status)->toBe('completed');
    expect($fresh->follow_up_call_notes)->toBe('Patient confirmed by phone.');
    expect($fresh->follow_up_call_attempts)->toBe(1);
    expect($fresh->follow_up_call_by)->toBe($secretary->id);
    expect($fresh->follow_up_call_at)->not->toBeNull();
});

it('blocks a doctor from recording follow-up calls (matrix: secretary only)', function () {
    $appointment = Appointment::factory()->needingFollowUp()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->actingAs($this->doctor)
        ->post(route('appointments.follow-up-call', $appointment), [
            'follow_up_call_status' => 'completed',
        ])
        ->assertForbidden();
});

it('serves the secretary follow-up queue from v_appointments_needing_followup', function () {
    $secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $needsFollowUpStart = now()->addHours(6);
    $secondStart = now()->addDays(5)->setTime(10, 0);

    // One appointment in need of follow-up
    Appointment::factory()->needingFollowUp()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
        'scheduled_start' => $needsFollowUpStart,
        'scheduled_end' => $needsFollowUpStart->copy()->addMinutes(30),
        'appointment_day' => $needsFollowUpStart->toDateString(),
    ]);

    // One that doesn't need follow-up — shouldn't appear. Distinct, narrow
    // slot so the GiST exclusion on the same doctor doesn't trip.
    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
        'scheduled_start' => $secondStart,
        'scheduled_end' => $secondStart->copy()->addMinutes(30),
        'appointment_day' => $secondStart->toDateString(),
    ]);

    $this->actingAs($secretary)
        ->get(route('secretary.follow-up'))
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('secretary/follow-up')
            ->has('follow_ups.data', 1)
        );
});

it('increments follow_up_call_attempts each time a call outcome is logged', function () {
    $secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $appointment = Appointment::factory()->needingFollowUp()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
    ]);

    foreach (['no_answer', 'no_answer', 'completed'] as $status) {
        $this->actingAs($secretary)
            ->post(route('appointments.follow-up-call', $appointment), [
                'follow_up_call_status' => $status,
            ])
            ->assertSessionHasNoErrors();
    }

    expect($appointment->fresh()->follow_up_call_attempts)->toBe(3);
    expect($appointment->fresh()->follow_up_call_status)->toBe('completed');
});
