<?php

namespace App\Contracts;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;

/**
 * Channel-agnostic WhatsApp dispatcher. Phase 1 bound the Null implementation
 * for password resets; Phase 3 extended it with appointment confirmations.
 * Phase 9 swaps the Null impl for a real Meta Graph API client that consumes
 * the clinic's `whatsapp_integration` row.
 *
 * All methods are side-effecty: they hit the network (or log in Null mode)
 * AND write to the partitioned `message_log` table so the delivery dashboard
 * has a record.
 */
interface WhatsAppGateway
{
    /**
     * Send a password-reset deep link to the user's E.164 phone.
     */
    public function sendPasswordReset(User $user, string $resetUrl): void;

    /**
     * Send the appointment-confirmation template message containing the
     * patient-facing confirmation URL. Returns the message_log row id so the
     * caller can correlate the appointment with the wamid status callback.
     */
    public function sendAppointmentConfirmation(
        Patient $patient,
        Appointment $appointment,
        string $confirmationUrl,
    ): string;
}
