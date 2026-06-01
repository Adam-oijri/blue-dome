<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('lets a super-admin schedule on the route clinic with a route-clinic doctor', function () {
    $start = now()->addDays(2)->setTime(10, 0);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.appointments.store', $this->clinic), [
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctor->id,
            'scheduled_start' => $start->toDateTimeString(),
            'scheduled_end' => $start->copy()->addMinutes(30)->toDateTimeString(),
            'type' => 'consultation',
        ])
        ->assertSessionHasNoErrors();

    $appt = Appointment::query()->where('patient_id', $this->patient->id)->first();

    expect($appt)->not->toBeNull()
        ->and($appt->clinic_id)->toBe($this->clinic->id)
        ->and($appt->clinic_id)->not->toBe($this->superAdmin->clinic_id);
});

it('rejects scheduling with a doctor from another clinic', function () {
    $otherDoctor = User::factory()->doctor()->create();
    $start = now()->addDays(2)->setTime(10, 0);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.appointments.store', $this->clinic), [
            'patient_id' => $this->patient->id,
            'doctor_id' => $otherDoctor->id,
            'scheduled_start' => $start->toDateTimeString(),
            'scheduled_end' => $start->copy()->addMinutes(30)->toDateTimeString(),
        ])
        ->assertSessionHasErrors('doctor_id');
});

it('rejects an overlapping appointment for the same doctor', function () {
    $start = now()->addDays(2)->setTime(10, 0);

    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
        'scheduled_start' => $start,
        'scheduled_end' => $start->copy()->addMinutes(30),
        'appointment_day' => $start->toDateString(),
        'status' => 'scheduled',
    ]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.appointments.store', $this->clinic), [
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctor->id,
            'scheduled_start' => $start->copy()->addMinutes(10)->toDateTimeString(),
            'scheduled_end' => $start->copy()->addMinutes(40)->toDateTimeString(),
        ])
        ->assertSessionHasErrors('scheduled_start');
});

it('lets a super-admin cancel a route-clinic appointment', function () {
    $appt = Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.appointments.cancel', ['clinic' => $this->clinic->id, 'appointment' => $appt->id]), [
            'cancelled_reason' => 'Rescheduled by admin',
        ])
        ->assertSessionHasNoErrors();

    expect($appt->fresh()->status)->toBe('cancelled')
        ->and($appt->fresh()->cancelled_by)->toBe($this->superAdmin->id);
});

it('404s editing an appointment from a different clinic via the route clinic', function () {
    $other = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $other->id]);
    $otherDoctor = User::factory()->doctor()->create(['clinic_id' => $other->id]);
    $appt = Appointment::factory()->create(['clinic_id' => $other->id, 'patient_id' => $otherPatient->id, 'doctor_id' => $otherDoctor->id]);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.clinics.appointments.edit', ['clinic' => $this->clinic->id, 'appointment' => $appt->id]))
        ->assertNotFound();
});

it('forbids doctor and secretary from clinic-scoped appointment routes', function (string $role) {
    $actor = User::factory()->{$role}()->create();

    $this->actingAs($actor)
        ->get(route('super-admin.clinics.appointments.index', $this->clinic))
        ->assertForbidden();
})->with(['doctor', 'secretary']);
