<?php

use App\Models\Appointment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Queue;

// The AppointmentCreated listener queues a WhatsApp job that force-sets
// confirmation_status to 'reminder_sent'. Faking the queue keeps the
// confirmation states asserted below deterministic.
beforeEach(function () {
    Queue::fake();
});

function dashboardAppt(User $doctor, CarbonImmutable $start, array $overrides = []): Appointment
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

it('scopes the dashboard to the acting doctor only', function () {
    $doctor = User::factory()->doctor()->create();
    $other = User::factory()->doctor()->create();

    // Acting doctor: one appointment today (already patient-confirmed, so it is
    // not a pending confirmation) + one upcoming unconfirmed. Pinning the today
    // appointment's confirmation_status keeps pending_confirmations deterministic
    // regardless of the wall-clock time the suite runs (a 12:00 slot is still in
    // the future on a morning run, which would otherwise count it as pending).
    $today = dashboardAppt($doctor, now()->startOfDay()->setTime(12, 0), [
        'confirmation_status' => 'confirmed_by_patient',
    ]);
    dashboardAppt($doctor, now()->addDays(2)->setTime(9, 0), [
        'confirmation_status' => 'pending',
    ]);

    // Another doctor's appointment today must not leak in.
    dashboardAppt($other, now()->startOfDay()->setTime(12, 0));

    $this->actingAs($doctor)
        ->get(route('doctor.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/doctor/dashboard')
            ->where('kpis.today_count', 1)
            ->where('kpis.pending_confirmations', 1)
            ->has('today_schedule', 1)
            ->where('today_schedule.0.id', $today->id)
            ->has('pending_confirmations_list', 1)
        );
});

it('excludes confirmed appointments from pending confirmations', function () {
    $doctor = User::factory()->doctor()->create();

    dashboardAppt($doctor, now()->addDays(1)->setTime(9, 0), [
        'confirmation_status' => 'confirmed_by_patient',
    ]);
    dashboardAppt($doctor, now()->addDays(2)->setTime(9, 0), [
        'confirmation_status' => 'confirmed_by_call',
    ]);

    $this->actingAs($doctor)
        ->get(route('doctor.dashboard'))
        ->assertInertia(fn ($page) => $page->where('kpis.pending_confirmations', 0));
});

it('is forbidden for a secretary', function () {
    $secretary = User::factory()->secretary()->create();
    $this->actingAs($secretary)->get(route('doctor.dashboard'))->assertForbidden();
});

it('is forbidden for a super admin', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $this->actingAs($superAdmin)->get(route('doctor.dashboard'))->assertForbidden();
});
