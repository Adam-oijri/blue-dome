<?php

namespace App\Services\Messaging;

use App\Contracts\WhatsAppGateway;
use App\Models\Appointment;
use App\Models\MessageLog;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * No-op WhatsApp gateway used in Phase 1 + 3, in tests, and as the fallback
 * when no clinic-level integration is configured. Records the intended send
 * in the partitioned `message_log` so the super-admin dashboard (Phase 7)
 * still sees the row — and tests can assert on it.
 */
class NullWhatsAppGateway implements WhatsAppGateway
{
    public function sendPasswordReset(User $user, string $resetUrl): void
    {
        Log::info('whatsapp.password_reset.stub', [
            'user_id' => $user->id,
            'clinic_id' => $user->clinic_id,
            'phone' => $user->phone,
            'url' => $resetUrl,
        ]);
    }

    public function sendAppointmentConfirmation(
        Patient $patient,
        Appointment $appointment,
        string $confirmationUrl,
    ): string {
        $logId = (string) Str::uuid();

        MessageLog::create([
            'id' => $logId,
            'clinic_id' => $appointment->clinic_id,
            'message_type' => 'whatsapp',
            'direction' => 'outbound',
            'recipient_type' => 'patient',
            'recipient_id' => $patient->id,
            'recipient_contact' => $patient->phone_e164 ?? $patient->phone ?? '',
            'recipient_name' => $patient->first_name.' '.$patient->last_name,
            'body' => "Confirmation: {$confirmationUrl}",
            'status' => 'sent',
            'reference_type' => Appointment::class,
            'reference_id' => $appointment->id,
            'template_variables' => [
                'patient_name' => $patient->first_name,
                'appointment_date' => $appointment->scheduled_start?->toIso8601String(),
                'confirmation_url' => $confirmationUrl,
            ],
            'sent_at' => now(),
            'created_at' => now(),
        ]);

        Log::info('whatsapp.appointment_confirmation.stub', [
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'url' => $confirmationUrl,
            'message_log_id' => $logId,
        ]);

        return $logId;
    }
}
