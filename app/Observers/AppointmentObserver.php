<?php

namespace App\Observers;

use App\Events\AppointmentCreated;
use App\Models\Appointment;
use App\Services\SequenceService;
use Illuminate\Support\Str;

/**
 * On creating: allocate appointment_number from the per-clinic sequence,
 * stamp appointment_day from scheduled_start (clinic timezone — Phase 9
 * may refine), generate a 64-char confirmation_token + 48h expiry so the
 * URL embedded in the WhatsApp template is ready by the time the send job
 * runs. On created: dispatch AppointmentCreated so the queued listener can
 * fire the WhatsApp confirmation.
 */
class AppointmentObserver
{
    public function __construct(private readonly SequenceService $sequences) {}

    public function creating(Appointment $appointment): void
    {
        if (empty($appointment->appointment_number) && ! empty($appointment->clinic_id)) {
            $appointment->appointment_number = $this->sequences->next(
                $appointment->clinic_id,
                'appointment_number',
            );
        }

        if (empty($appointment->confirmation_token)) {
            $appointment->confirmation_token = Str::random(64);
            $appointment->confirmation_token_expires = now()->addHours(48);
        }

        if (empty($appointment->appointment_day) && $appointment->scheduled_start !== null) {
            $appointment->appointment_day = $appointment->scheduled_start->toDateString();
        }
    }

    public function created(Appointment $appointment): void
    {
        AppointmentCreated::dispatch($appointment);
    }
}
