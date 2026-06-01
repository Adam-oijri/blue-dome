<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    // The appointment-create reminder job (sync queue) overwrites
    // confirmation_status → reminder_sent; fake it so explicit statuses stick.
    Queue::fake();
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('renders the secretary reports page with all report props populated', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $today = CarbonImmutable::today();
    foreach ([9, 11, 14] as $hour) {
        Appointment::factory()->create([
            'clinic_id' => $this->clinic->id,
            'doctor_id' => $this->doctor->id,
            'patient_id' => $patient->id,
            'appointment_day' => $today->toDateString(),
            'scheduled_start' => $today->setTime($hour, 0),
            'scheduled_end' => $today->setTime($hour, 30),
            'status' => 'completed',
        ]);
    }

    Payment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
        'payment_status' => 'completed',
        'payment_date' => CarbonImmutable::today()->toDateString(),
        'amount' => 500,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.reports'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/reports')
            ->has('appointments_per_day', 7)
            ->has('revenue_per_week', 1)
            ->has('funnel')
            ->has('doctor_volumes', 1)
            // Today is the last day of the 7-day window; its count must reflect
            // the 3 appointments (0 if the grouping column were dropped).
            ->where('appointments_per_day.6.count', 3)
            ->where('doctor_volumes.0.count', 3)
            ->where('revenue_per_week.0.amount', 500)
            ->where('funnel.booked', 3)
            ->where('funnel.completed', 3)
            ->where('filters.period', '7d')
        );
});

it('honours the period filter window length', function () {
    $this->actingAs($this->secretary)
        ->get(route('secretary.reports', ['period' => '30d']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.period', '30d')
            ->has('appointments_per_day', 30)
        );
});

it('falls back to the default period for an invalid value', function () {
    $this->actingAs($this->secretary)
        ->get(route('secretary.reports', ['period' => 'bogus']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.period', '7d')
            ->has('appointments_per_day', 7)
        );
});

it('counts patient-confirmed appointments in the funnel even when status is still scheduled', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $start = CarbonImmutable::today()->setTime(8, 0);
    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
        'patient_id' => $patient->id,
        'scheduled_start' => $start,
        'scheduled_end' => $start->addMinutes(30),
        'appointment_day' => $start->toDateString(),
        'status' => 'scheduled',
        'confirmation_status' => 'confirmed_by_patient',
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.reports'))
        ->assertInertia(fn ($page) => $page
            ->where('funnel.booked', 1)
            ->where('funnel.confirmed', 1)
            ->where('funnel.arrived', 0)
            ->where('funnel.completed', 0)
        );
});

it('scopes reports to the secretary clinic', function () {
    $otherClinic = Clinic::factory()->create();
    $otherDoctor = User::factory()->doctor()->create(['clinic_id' => $otherClinic->id]);
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);

    Appointment::factory()->create([
        'clinic_id' => $otherClinic->id,
        'doctor_id' => $otherDoctor->id,
        'patient_id' => $otherPatient->id,
        'appointment_day' => CarbonImmutable::today()->toDateString(),
        'status' => 'completed',
    ]);
    Payment::factory()->create([
        'clinic_id' => $otherClinic->id,
        'patient_id' => $otherPatient->id,
        'payment_status' => 'completed',
        'payment_date' => CarbonImmutable::today()->toDateString(),
        'amount' => 900,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.reports'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('funnel.booked', 0)
            ->has('doctor_volumes', 0)
            ->has('revenue_per_week', 0)
        );
});
