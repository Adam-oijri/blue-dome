<?php

declare(strict_types=1);

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia;

test('secretary walk-ins page renders with same-day walk-in appointments', function (): void {
    $clinic = Clinic::factory()->create();
    $secretary = User::factory()->secretary()->create(['clinic_id' => $clinic->id]);
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);

    $start = Carbon::today()->setTime(9, 0);

    Appointment::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'scheduled_start' => $start,
        'scheduled_end' => (clone $start)->addMinutes(30),
        'appointment_day' => $start->toDateString(),
        'status' => 'arrived',
        'priority' => 'high',
    ]);

    $response = $this->actingAs($secretary)->get(route('secretary.walkins'));

    $response->assertOk();
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('panels/secretary/walk-ins')
        ->has('walk_ins', 1)
    );
});

test('secretary walk-ins page excludes appointments booked on a previous day', function (): void {
    $clinic = Clinic::factory()->create();
    $secretary = User::factory()->secretary()->create(['clinic_id' => $clinic->id]);
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);

    $start = Carbon::today()->setTime(10, 0);

    Appointment::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'scheduled_start' => $start,
        'scheduled_end' => (clone $start)->addMinutes(30),
        'appointment_day' => $start->toDateString(),
        'status' => 'scheduled',
        'created_at' => Carbon::yesterday(),
    ]);

    $response = $this->actingAs($secretary)->get(route('secretary.walkins'));

    $response->assertOk();
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('panels/secretary/walk-ins')
        ->has('walk_ins', 0)
    );
});

test('secretary walk-ins page is scoped to the secretary clinic', function (): void {
    $clinic = Clinic::factory()->create();
    $secretary = User::factory()->secretary()->create(['clinic_id' => $clinic->id]);

    $otherClinic = Clinic::factory()->create();
    $otherDoctor = User::factory()->doctor()->create(['clinic_id' => $otherClinic->id]);
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);

    $start = Carbon::today()->setTime(11, 0);

    Appointment::factory()->create([
        'clinic_id' => $otherClinic->id,
        'patient_id' => $otherPatient->id,
        'doctor_id' => $otherDoctor->id,
        'scheduled_start' => $start,
        'scheduled_end' => (clone $start)->addMinutes(30),
        'appointment_day' => $start->toDateString(),
        'status' => 'arrived',
    ]);

    $response = $this->actingAs($secretary)->get(route('secretary.walkins'));

    $response->assertOk();
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('panels/secretary/walk-ins')
        ->has('walk_ins', 0)
    );
});
