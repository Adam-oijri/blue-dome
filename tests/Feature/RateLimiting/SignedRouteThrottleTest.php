<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

beforeEach(function () {
    RateLimiter::clear('patient-confirmation');
});

it('returns 429 after 10 confirmation hits in the same minute', function () {
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);

    $appointment = Appointment::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
    ]);

    // First 10 hits are OK (the appointment is real, just idempotent).
    for ($i = 0; $i < 10; $i++) {
        $this->get(route('appointments.confirm', ['token' => $appointment->confirmation_token]))
            ->assertSuccessful();
    }

    // 11th hit gets throttled.
    $this->get(route('appointments.confirm', ['token' => $appointment->confirmation_token]))
        ->assertStatus(429);
});
