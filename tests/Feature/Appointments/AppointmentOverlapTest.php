<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->patientA = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $this->patientB = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $this->actor = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('returns 422 when scheduling an overlap on the same doctor (pre-flight check)', function () {
    $start = now()->addDays(3)->setTime(14, 0);

    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patientA->id,
        'doctor_id' => $this->doctor->id,
        'scheduled_start' => $start,
        'scheduled_end' => $start->copy()->addMinutes(45),
        'appointment_day' => $start->toDateString(),
    ]);

    // Overlapping 15 minutes into the existing slot
    $this->actingAs($this->actor)
        ->post(route('appointments.store'), [
            'patient_id' => $this->patientB->id,
            'doctor_id' => $this->doctor->id,
            'scheduled_start' => $start->copy()->addMinutes(30)->toDateTimeString(),
            'scheduled_end' => $start->copy()->addMinutes(60)->toDateTimeString(),
        ])
        ->assertSessionHasErrors('scheduled_start');
});

it('allows back-to-back appointments (exclusive upper bound)', function () {
    $start = now()->addDays(3)->setTime(15, 0);

    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patientA->id,
        'doctor_id' => $this->doctor->id,
        'scheduled_start' => $start,
        'scheduled_end' => $start->copy()->addMinutes(30),
        'appointment_day' => $start->toDateString(),
    ]);

    // Starts exactly when the previous ended — '[)' range, no overlap
    $this->actingAs($this->actor)
        ->post(route('appointments.store'), [
            'patient_id' => $this->patientB->id,
            'doctor_id' => $this->doctor->id,
            'scheduled_start' => $start->copy()->addMinutes(30)->toDateTimeString(),
            'scheduled_end' => $start->copy()->addMinutes(60)->toDateTimeString(),
        ])
        ->assertSessionHasNoErrors();
});

it('lets a cancelled appointment be replaced (cancelled excluded from overlap)', function () {
    $start = now()->addDays(3)->setTime(16, 0);

    Appointment::factory()->cancelled()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patientA->id,
        'doctor_id' => $this->doctor->id,
        'scheduled_start' => $start,
        'scheduled_end' => $start->copy()->addMinutes(30),
        'appointment_day' => $start->toDateString(),
    ]);

    $this->actingAs($this->actor)
        ->post(route('appointments.store'), [
            'patient_id' => $this->patientB->id,
            'doctor_id' => $this->doctor->id,
            'scheduled_start' => $start->copy()->addMinutes(5)->toDateTimeString(),
            'scheduled_end' => $start->copy()->addMinutes(45)->toDateTimeString(),
        ])
        ->assertSessionHasNoErrors();
});
