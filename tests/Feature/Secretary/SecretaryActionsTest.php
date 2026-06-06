<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

/**
 * Covers the newly-wired secretary actions: the patient/report CSV exports and
 * the waiting-room "Call / Done" status advance.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

// --- CSV exports ------------------------------------------------------------

it('streams the patient roster as CSV for a secretary', function () {
    Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'first_name' => 'Zorglubzz',
        'last_name' => 'Xyzzy',
    ]);

    $response = $this->actingAs($this->secretary)->get(route('secretary.patients.export'));

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    expect($response->streamedContent())->toContain('Zorglubzz');
});

it('streams the report summary as CSV for a secretary', function () {
    $response = $this->actingAs($this->secretary)
        ->get(route('secretary.reports.export', ['period' => '7d']));

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    expect($response->streamedContent())->toContain('Date');
});

it('blocks a doctor from the secretary exports', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($doctor)->get(route('secretary.patients.export'))->assertForbidden();
});

// --- Waiting-room advance ---------------------------------------------------

it('advances an arrived patient to in consultation, staying on the dashboard', function () {
    $appointment = Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'status' => 'arrived',
    ]);

    $this->actingAs($this->secretary)
        ->post(route('secretary.waiting-room.advance', $appointment))
        ->assertSessionHasNoErrors();

    expect($appointment->fresh()->status)->toBe('in_progress');
});

it('advances an in-consultation patient to completed', function () {
    $appointment = Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'status' => 'in_progress',
    ]);

    $this->actingAs($this->secretary)
        ->post(route('secretary.waiting-room.advance', $appointment))
        ->assertSessionHasNoErrors();

    expect($appointment->fresh()->status)->toBe('completed');
});

it('forbids advancing an appointment from another clinic', function () {
    $otherClinic = Clinic::factory()->create();
    $appointment = Appointment::factory()->create([
        'clinic_id' => $otherClinic->id,
        'status' => 'arrived',
    ]);

    $this->actingAs($this->secretary)
        ->post(route('secretary.waiting-room.advance', $appointment))
        ->assertForbidden();
});
