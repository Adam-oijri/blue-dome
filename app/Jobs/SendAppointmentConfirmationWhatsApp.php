<?php

namespace App\Jobs;

use App\Contracts\WhatsAppGateway;
use App\Models\Appointment;

/**
 * Inherits TenantAwareJob so queue workers restore the Postgres GUCs the
 * SetTenantContext middleware would normally set. The job only needs the
 * appointment id + clinic context; everything else is resolved fresh.
 */
class SendAppointmentConfirmationWhatsApp extends TenantAwareJob
{
    public function __construct(
        string $clinicId,
        public readonly string $appointmentId,
        ?string $userId = null,
    ) {
        parent::__construct($clinicId, $userId);

        $this->onQueue('whatsapp');
    }

    public int $tries = 3;

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [60, 300, 1800];
    }

    protected function handleWithTenantContext(): void
    {
        $appointment = Appointment::query()
            ->with('patient')
            ->findOrFail($this->appointmentId);

        $patient = $appointment->patient;

        if ($patient === null) {
            return;
        }

        // Only send when we actually have a phone to reach the patient on.
        if (($patient->phone_e164 ?? $patient->phone) === null) {
            return;
        }

        if ($appointment->confirmation_token === null) {
            return;
        }

        $url = url(route('appointments.confirm', ['token' => $appointment->confirmation_token], false));

        app(WhatsAppGateway::class)->sendAppointmentConfirmation($patient, $appointment, $url);

        $appointment->forceFill(['confirmation_status' => 'reminder_sent'])->save();
    }
}
