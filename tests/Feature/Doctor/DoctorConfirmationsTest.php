<?php

use App\Models\Appointment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Queue;

// The AppointmentCreated listener would otherwise force confirmation_status
// to 'reminder_sent', breaking the confirmed/unconfirmed assertions below.
beforeEach(function () {
    Queue::fake();
});

function confirmationAppt(User $doctor, CarbonImmutable $start, array $overrides = []): Appointment
{
    return Appointment::factory()->create(array_merge([
        'clinic_id' => $doctor->clinic_id,
        'doctor_id' => $doctor->id,
        'appointment_day' => $start->toDateString(),
        'scheduled_start' => $start,
        'scheduled_end' => $start->addMinutes(30),
        'status' => 'scheduled',
        'confirmation_status' => 'pending',
    ], $overrides));
}

it('lists only the doctor upcoming unconfirmed appointments', function () {
    $doctor = User::factory()->doctor()->create();
    $other = User::factory()->doctor()->create();

    $pending = confirmationAppt($doctor, now()->addDays(1)->setTime(9, 0));

    // Excluded: already confirmed (both confirmation paths).
    confirmationAppt($doctor, now()->addDays(2)->setTime(9, 0), ['confirmation_status' => 'confirmed_by_patient']);
    confirmationAppt($doctor, now()->addDays(3)->setTime(9, 0), ['confirmation_status' => 'confirmed_by_call']);
    // Excluded: in the past.
    confirmationAppt($doctor, now()->subDays(2)->setTime(9, 0));
    // Excluded: belongs to another doctor.
    confirmationAppt($other, now()->addDays(1)->setTime(9, 0));

    $this->actingAs($doctor)
        ->get(route('doctor.confirmations'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/doctor/confirmations')
            ->has('appointments.data', 1)
            ->where('appointments.data.0.id', $pending->id)
        );
});

it('is forbidden for a secretary', function () {
    $secretary = User::factory()->secretary()->create();
    $this->actingAs($secretary)->get(route('doctor.confirmations'))->assertForbidden();
});

it('is forbidden for a super admin', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $this->actingAs($superAdmin)->get(route('doctor.confirmations'))->assertForbidden();
});
