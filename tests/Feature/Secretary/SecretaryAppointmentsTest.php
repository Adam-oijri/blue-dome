<?php

declare(strict_types=1);

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

test('secretary can view appointments page', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $start = now()->setTime(10, 0);

    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'appointment_day' => $start->toDateString(),
        'scheduled_start' => $start,
        'scheduled_end' => (clone $start)->addMinutes(30),
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.appointments'))
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/appointments')
            ->has('appointments', 1)
            ->has('kpis')
        );
});

test('appointments are scoped to the secretary clinic', function () {
    $otherClinic = Clinic::factory()->create();

    $start = now()->setTime(10, 0);

    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'appointment_day' => $start->toDateString(),
        'scheduled_start' => $start,
        'scheduled_end' => (clone $start)->addMinutes(30),
    ]);

    Appointment::factory()->create([
        'clinic_id' => $otherClinic->id,
        'appointment_day' => $start->toDateString(),
        'scheduled_start' => $start,
        'scheduled_end' => (clone $start)->addMinutes(30),
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.appointments'))
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/appointments')
            ->has('appointments', 1)
        );
});
