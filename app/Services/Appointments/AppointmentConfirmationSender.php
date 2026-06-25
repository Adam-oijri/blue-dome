<?php

namespace App\Services\Appointments;

use App\Contracts\WhatsAppGateway;
use App\Models\Appointment;
use Illuminate\Support\Str;

/**
 * Single entry point for sending (or re-sending) the WhatsApp appointment
 * confirmation to a patient, shared by every trigger: the create-time auto
 * send + the 24h reminder sweep (method `auto`) and the secretary's manual
 * "send confirmation" button (method `manual`). Centralising it keeps token
 * regeneration, the gateway call and the status/method stamp consistent.
 */
class AppointmentConfirmationSender
{
    public function __construct(private readonly WhatsAppGateway $gateway) {}

    /**
     * Returns false when the patient has no reachable phone number (nothing is
     * sent and the status is left untouched).
     *
     * @param  'auto'|'manual'  $method
     */
    public function send(Appointment $appointment, string $method): bool
    {
        $patient = $appointment->patient ?? $appointment->patient()->first();

        if ($patient === null) {
            return false;
        }

        if (($patient->phone_e164 ?? $patient->phone) === null) {
            return false;
        }

        // The confirmation token lives 48h; a reminder fired days after booking
        // (or a manual re-send) needs a fresh one so the patient's link still
        // resolves.
        if ($appointment->confirmation_token === null
            || $appointment->confirmation_token_expires === null
            || $appointment->confirmation_token_expires->isPast()) {
            $appointment->forceFill([
                'confirmation_token' => Str::random(64),
                'confirmation_token_expires' => now()->addHours(48),
            ])->save();
        }

        $url = url(route('appointments.confirm', ['token' => $appointment->confirmation_token], false));

        $this->gateway->sendAppointmentConfirmation($patient, $appointment, $url);

        // Never downgrade an appointment the patient (or a phone call) already
        // confirmed — only advance a still-open one to "reminder sent" and
        // record whether this send was automatic or a manual front-desk action.
        if (! in_array($appointment->confirmation_status, ['confirmed_by_patient', 'confirmed_by_call'], true)) {
            $appointment->forceFill([
                'confirmation_status' => 'reminder_sent',
                'confirmation_method' => $method,
            ])->save();
        }

        return true;
    }
}
