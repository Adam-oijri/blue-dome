<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Services\Appointments\AppointmentConfirmationSender;

/**
 * Inherits TenantAwareJob so queue workers restore the Postgres GUCs the
 * SetTenantContext middleware would normally set. The job only needs the
 * appointment id + clinic context; everything else is resolved fresh.
 *
 * Used for the automatic sends — the create-time confirmation and the 24h
 * reminder sweep. The secretary's manual send runs synchronously through the
 * same AppointmentConfirmationSender.
 */
class SendAppointmentConfirmationWhatsApp extends TenantAwareJob
{
    /**
     * @param  'auto'|'manual'  $method  how this send was triggered.
     */
    public function __construct(
        string $clinicId,
        public readonly string $appointmentId,
        ?string $userId = null,
        public readonly string $method = 'auto',
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
            ->find($this->appointmentId);

        if ($appointment === null) {
            return;
        }

        app(AppointmentConfirmationSender::class)->send($appointment, $this->method);
    }
}
