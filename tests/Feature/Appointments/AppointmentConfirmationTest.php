<?php

use App\Contracts\WhatsAppGateway;
use App\Events\AppointmentConfirmed;
use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->patient = Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'phone_e164' => '+212600000123',
    ]);
});

it('runs the end-to-end confirmation flow: store → NullGateway write → message_log row → hit token URL → status updated', function () {
    $actor = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $start = now()->addDays(2)->setTime(10, 0);
    $end = (clone $start)->addMinutes(30);

    $this->actingAs($actor)
        ->post(route('appointments.store'), [
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctor->id,
            'scheduled_start' => $start->toDateTimeString(),
            'scheduled_end' => $end->toDateTimeString(),
            'type' => 'consultation',
        ])
        ->assertSessionHasNoErrors();

    $appointment = Appointment::query()->where('patient_id', $this->patient->id)->firstOrFail();

    expect($appointment->confirmation_token)->not->toBeNull();
    expect($appointment->confirmation_token_expires->isFuture())->toBeTrue();

    // SendAppointmentConfirmationListener fires synchronously after commit
    // because the test queue is `sync`. The NullWhatsAppGateway writes a
    // row to the partitioned `message_log` table.
    $logged = DB::table('message_log')
        ->where('reference_type', Appointment::class)
        ->where('reference_id', $appointment->id)
        ->first();

    expect($logged)->not->toBeNull()
        ->and($logged->message_type)->toBe('whatsapp')
        ->and($logged->recipient_contact)->toBe('+212600000123');

    expect($appointment->fresh()->confirmation_status)->toBe('reminder_sent');

    Event::fake([AppointmentConfirmed::class]);

    // Patient clicks the link from WhatsApp. No auth required.
    $this->get(route('appointments.confirm', ['token' => $appointment->confirmation_token]))
        ->assertSuccessful();

    expect($appointment->fresh()->status)->toBe('confirmed');
    expect($appointment->fresh()->confirmation_status)->toBe('confirmed_by_patient');
    expect($appointment->fresh()->confirmation_at)->not->toBeNull();

    Event::assertDispatched(AppointmentConfirmed::class);
});

it('rejects an expired token with 410', function () {
    $appointment = Appointment::factory()->expiredToken()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->get(route('appointments.confirm', ['token' => $appointment->confirmation_token]))
        ->assertStatus(410);

    expect($appointment->fresh()->confirmation_status)->not->toBe('confirmed_by_patient');
});

it('rejects an unknown token with 410', function () {
    $this->get(route('appointments.confirm', ['token' => str_repeat('a', 64)]))
        ->assertStatus(410);
});

it('is idempotent on a second click — keeps the original confirmation timestamp', function () {
    $appointment = Appointment::factory()->pendingConfirmation()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->get(route('appointments.confirm', ['token' => $appointment->confirmation_token]))
        ->assertSuccessful();

    $firstConfirmedAt = $appointment->fresh()->confirmation_at;
    expect($firstConfirmedAt)->not->toBeNull();

    // Second click — same response, same timestamp.
    $this->get(route('appointments.confirm', ['token' => $appointment->confirmation_token]))
        ->assertSuccessful();

    expect($appointment->fresh()->confirmation_at->equalTo($firstConfirmedAt))->toBeTrue();
});

it('skips the WhatsApp send when the patient has no phone', function () {
    $phonelessPatient = Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'phone_e164' => null,
        'phone' => null,
    ]);

    $gateway = $this->mock(WhatsAppGateway::class);
    $gateway->shouldNotReceive('sendAppointmentConfirmation');
    $gateway->shouldReceive('sendPasswordReset')->zeroOrMoreTimes();

    $actor = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $start = now()->addDays(2)->setTime(10, 0);

    $this->actingAs($actor)
        ->post(route('appointments.store'), [
            'patient_id' => $phonelessPatient->id,
            'doctor_id' => $this->doctor->id,
            'scheduled_start' => $start->toDateTimeString(),
            'scheduled_end' => $start->copy()->addMinutes(30)->toDateTimeString(),
        ])
        ->assertSessionHasNoErrors();
});
