<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('lists clinic appointments flagged for a follow-up call', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
        'doctor_id' => $this->doctor->id,
        'needs_follow_up_call' => true,
        'priority' => 'high',
    ]);

    // Completed follow-up must be excluded.
    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
        'doctor_id' => $this->doctor->id,
        'needs_follow_up_call' => true,
        'follow_up_call_status' => 'completed',
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.follow-up'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('secretary/follow-up')
            ->has('follow_ups.data', 1)
            ->where('kpis.due', 1)
            ->where('kpis.high_priority', 1)
        );
});

it('scopes the follow-up queue to the secretary clinic', function () {
    $otherClinic = Clinic::factory()->create();
    $otherDoctor = User::factory()->doctor()->create(['clinic_id' => $otherClinic->id]);
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);

    Appointment::factory()->create([
        'clinic_id' => $otherClinic->id,
        'patient_id' => $otherPatient->id,
        'doctor_id' => $otherDoctor->id,
        'needs_follow_up_call' => true,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.follow-up'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('follow_ups.data', 0));
});
