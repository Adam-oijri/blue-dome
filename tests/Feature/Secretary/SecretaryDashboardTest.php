<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use Carbon\CarbonImmutable;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('renders the secretary dashboard with kpis, schedule and waiting room', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $start = CarbonImmutable::today()->setTime(10, 0);
    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
        'patient_id' => $patient->id,
        'scheduled_start' => $start,
        'scheduled_end' => $start->addMinutes(30),
        'appointment_day' => $start->toDateString(),
        'status' => 'arrived',
    ]);

    $invoice = Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
    ]);
    Payment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'invoice_id' => $invoice->id,
        'patient_id' => $patient->id,
        'amount' => 250,
        'payment_status' => 'completed',
        'payment_date' => CarbonImmutable::today()->toDateString(),
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/dashboard')
            ->has('kpis')
            ->where('kpis.today', 1)
            ->where('kpis.walkins', 1)
            ->where('kpis.cash', 250)
            ->has('schedule', 1)
            ->has('waiting_room', 1)
            ->has('whatsapp')
            ->has('now_minute')
            ->has('now_label')
        );
});

it('scopes the dashboard schedule and waiting room to the secretary clinic', function () {
    $otherClinic = Clinic::factory()->create();
    $otherDoctor = User::factory()->doctor()->create(['clinic_id' => $otherClinic->id]);
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);

    $start = CarbonImmutable::today()->setTime(11, 0);
    Appointment::factory()->create([
        'clinic_id' => $otherClinic->id,
        'doctor_id' => $otherDoctor->id,
        'patient_id' => $otherPatient->id,
        'scheduled_start' => $start,
        'scheduled_end' => $start->addMinutes(30),
        'appointment_day' => $start->toDateString(),
        'status' => 'arrived',
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('kpis.today', 0)
            ->has('schedule', 0)
            ->has('waiting_room', 0)
        );
});
