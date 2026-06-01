<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    Queue::fake();
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('renders the secretary patients page with data and kpis', function () {
    Patient::factory()->count(3)->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.patients'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/patients')
            ->has('patients.data', 3)
            ->has('kpis')
        );
});

it('filters patients by the q search term', function () {
    Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'first_name' => 'Yasmine',
        'last_name' => 'El Amrani',
    ]);
    Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'first_name' => 'Karim',
        'last_name' => 'Benali',
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.patients', ['q' => 'yasm']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/patients')
            ->has('patients.data', 1)
            ->where('patients.data.0.first_name', 'Yasmine')
        );
});

it('excludes cancelled appointments from next_appt', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    // Only future appointment is cancelled → next_appt should stay null.
    $start = CarbonImmutable::tomorrow()->setTime(10, 0);
    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $doctor->id,
        'patient_id' => $patient->id,
        'scheduled_start' => $start,
        'scheduled_end' => $start->addMinutes(30),
        'appointment_day' => $start->toDateString(),
        'status' => 'cancelled',
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.patients'))
        ->assertInertia(fn ($page) => $page
            ->where('patients.data.0.next_appt', null)
        );
});

it('scopes patients to the secretary clinic', function () {
    $otherClinic = Clinic::factory()->create();
    Patient::factory()->create(['clinic_id' => $otherClinic->id]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.patients'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('patients.data', 0));
});
