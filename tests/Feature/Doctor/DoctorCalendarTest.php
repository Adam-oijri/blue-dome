<?php

use App\Models\Appointment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Queue;

// Avoid the AppointmentCreated WhatsApp job mutating fixture state.
beforeEach(function () {
    Queue::fake();
});

function calendarAppt(User $doctor, CarbonImmutable $start, array $overrides = []): Appointment
{
    return Appointment::factory()->create(array_merge([
        'clinic_id' => $doctor->clinic_id,
        'doctor_id' => $doctor->id,
        'appointment_day' => $start->toDateString(),
        'scheduled_start' => $start,
        'scheduled_end' => $start->addMinutes(30),
        'status' => 'scheduled',
    ], $overrides));
}

it('returns only the acting doctor appointments for the current week', function () {
    $doctor = User::factory()->doctor()->create();
    $other = User::factory()->doctor()->create();

    $mine = calendarAppt($doctor, now()->startOfWeek()->setTime(9, 0));
    calendarAppt($other, now()->startOfWeek()->setTime(9, 0));

    $this->actingAs($doctor)
        ->get(route('doctor.calendar'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/doctor/calendar')
            ->has('appointments', 1)
            ->where('appointments.0.id', $mine->id)
            ->has('week.days', 7)
            ->has('prev_week')
            ->has('next_week')
            ->has('today')
        );
});

it('shifts the displayed week with the date query param', function () {
    $doctor = User::factory()->doctor()->create();

    $nextWeek = now()->addWeek()->startOfWeek()->setTime(9, 0);
    $appt = calendarAppt($doctor, $nextWeek);

    // Current week excludes the next-week appointment.
    $this->actingAs($doctor)
        ->get(route('doctor.calendar'))
        ->assertInertia(fn ($page) => $page->has('appointments', 0));

    // Navigating to that week returns it.
    $this->actingAs($doctor)
        ->get(route('doctor.calendar', ['date' => $nextWeek->toDateString()]))
        ->assertInertia(fn ($page) => $page
            ->has('appointments', 1)
            ->where('appointments.0.id', $appt->id)
        );
});

it('is forbidden for a secretary', function () {
    $secretary = User::factory()->secretary()->create();
    $this->actingAs($secretary)->get(route('doctor.calendar'))->assertForbidden();
});

it('is forbidden for a super admin', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $this->actingAs($superAdmin)->get(route('doctor.calendar'))->assertForbidden();
});
