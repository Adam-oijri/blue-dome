<?php

use App\Jobs\SendAppointmentConfirmationWhatsApp;
use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\MessageLog;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->patient = Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'phone_e164' => '+212600000999',
    ]);
});

/** A pending appointment with the create-time auto-send suppressed. */
function pendingAppointment(array $overrides = []): Appointment
{
    return Appointment::factory()->create([
        'clinic_id' => test()->clinic->id,
        'patient_id' => test()->patient->id,
        'doctor_id' => test()->doctor->id,
        'confirmation_status' => 'pending',
        'confirmation_method' => null,
        ...$overrides,
    ]);
}

// --- Manual send (secretary "Send confirmation" button) ---------------------

it('lets the secretary manually send a confirmation and tags it manual', function () {
    Queue::fake(); // suppress the create-time auto send so we start from pending
    $appt = pendingAppointment();

    $this->actingAs($this->secretary)
        ->post(route('secretary.appointments.send-confirmation', ['appointment' => $appt]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $appt->refresh();
    expect($appt->confirmation_status)->toBe('reminder_sent');
    expect($appt->confirmation_method)->toBe('manual');
    expect($appt->confirmation_token)->not->toBeNull();

    expect(MessageLog::query()
        ->where('reference_id', $appt->id)
        ->where('message_type', 'whatsapp')
        ->exists())->toBeTrue();
});

it('does not change status or send when the patient has no phone', function () {
    Queue::fake();
    $phoneless = Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'phone' => null,
        'phone_e164' => null,
    ]);
    $appt = pendingAppointment(['patient_id' => $phoneless->id]);

    $this->actingAs($this->secretary)
        ->post(route('secretary.appointments.send-confirmation', ['appointment' => $appt]))
        ->assertRedirect();

    expect($appt->fresh()->confirmation_status)->toBe('pending');
    expect(MessageLog::query()->where('reference_id', $appt->id)->exists())->toBeFalse();
});

it('keeps a patient-confirmed appointment confirmed on a manual re-send', function () {
    Queue::fake();
    $appt = pendingAppointment([
        'status' => 'confirmed',
        'confirmation_status' => 'confirmed_by_patient',
        'confirmation_at' => now(),
        'confirmation_method' => 'whatsapp',
    ]);

    $this->actingAs($this->secretary)
        ->post(route('secretary.appointments.send-confirmation', ['appointment' => $appt]))
        ->assertRedirect();

    // The send still goes out, but the confirmed state is never downgraded.
    expect($appt->fresh()->confirmation_status)->toBe('confirmed_by_patient');
});

it('blocks doctors from the secretary manual-send route', function () {
    Queue::fake();
    $appt = pendingAppointment();

    $this->actingAs($this->doctor)
        ->post(route('secretary.appointments.send-confirmation', ['appointment' => $appt]))
        ->assertForbidden();
});

it('blocks a secretary from another clinic', function () {
    Queue::fake();
    $appt = pendingAppointment();
    $otherSecretary = User::factory()->secretary()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);

    $this->actingAs($otherSecretary)
        ->post(route('secretary.appointments.send-confirmation', ['appointment' => $appt]))
        ->assertForbidden();
});

// --- Automatic 24h reminder sweep ------------------------------------------

it('queues an auto reminder for an appointment due within 24h and stamps it', function () {
    Queue::fake();
    $appt = pendingAppointment([
        'scheduled_start' => now()->addHours(10),
        'scheduled_end' => now()->addHours(10)->addMinutes(30),
    ]);

    $this->artisan('app:send-appointment-reminders')->assertSuccessful();

    expect($appt->fresh()->reminder_24h_sent_at)->not->toBeNull();
    Queue::assertPushed(
        SendAppointmentConfirmationWhatsApp::class,
        fn ($job) => $job->appointmentId === $appt->id && $job->method === 'auto',
    );
});

it('is idempotent — never re-queues a reminder it already sent', function () {
    Queue::fake();
    pendingAppointment([
        'scheduled_start' => now()->addHours(10),
        'scheduled_end' => now()->addHours(10)->addMinutes(30),
    ]);

    $this->artisan('app:send-appointment-reminders');
    $this->artisan('app:send-appointment-reminders');

    Queue::assertPushed(SendAppointmentConfirmationWhatsApp::class, 1);
});

it('skips confirmed, cancelled and far-future appointments', function () {
    Queue::fake();

    $due = pendingAppointment([
        'scheduled_start' => now()->addHours(10),
        'scheduled_end' => now()->addHours(10)->addMinutes(30),
    ]);
    $confirmed = pendingAppointment([
        'scheduled_start' => now()->addHours(11),
        'scheduled_end' => now()->addHours(11)->addMinutes(30),
        'status' => 'confirmed',
        'confirmation_status' => 'confirmed_by_patient',
    ]);
    $cancelled = pendingAppointment([
        'scheduled_start' => now()->addHours(12),
        'scheduled_end' => now()->addHours(12)->addMinutes(30),
        'status' => 'cancelled',
    ]);
    $far = pendingAppointment([
        'scheduled_start' => now()->addDays(3),
        'scheduled_end' => now()->addDays(3)->addMinutes(30),
    ]);

    $this->artisan('app:send-appointment-reminders');

    Queue::assertPushed(SendAppointmentConfirmationWhatsApp::class, 1);
    Queue::assertPushed(
        SendAppointmentConfirmationWhatsApp::class,
        fn ($job) => $job->appointmentId === $due->id,
    );
    expect($confirmed->fresh()->reminder_24h_sent_at)->toBeNull();
    expect($cancelled->fresh()->reminder_24h_sent_at)->toBeNull();
    expect($far->fresh()->reminder_24h_sent_at)->toBeNull();
});

it('tags the create-time automatic send as auto', function () {
    // Real (sync) queue: the create-time listener fires the send job inline.
    $start = now()->addDays(2)->setTime(9, 0);

    $this->actingAs($this->secretary)->post(route('appointments.store'), [
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
        'scheduled_start' => $start->toDateTimeString(),
        'scheduled_end' => $start->copy()->addMinutes(30)->toDateTimeString(),
        'type' => 'consultation',
    ])->assertSessionHasNoErrors();

    $appt = Appointment::query()->where('patient_id', $this->patient->id)->firstOrFail();

    expect($appt->confirmation_status)->toBe('reminder_sent');
    expect($appt->confirmation_method)->toBe('auto');
});
