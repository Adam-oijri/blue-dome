<?php

namespace App\Listeners;

use App\Events\AppointmentCreated;
use App\Models\Appointment;
use App\Models\User;
use App\Services\Notifications\NotificationService;

/**
 * Alerts the assigned doctor when an appointment is booked for them (e.g. by a
 * secretary). Runs synchronously in the authed booking request, so the insert
 * is in the actor's clinic context. The doctor is not alerted to their own
 * bookings (NotificationService skips the actor).
 */
class NotifyAppointmentCreated
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(AppointmentCreated $event): void
    {
        $appointment = $event->appointment;

        if (empty($appointment->doctor_id)) {
            return;
        }

        $doctor = User::find($appointment->doctor_id);

        if ($doctor === null) {
            return;
        }

        $appointment->loadMissing('patient:id,first_name,last_name');

        $this->notifications->send(
            recipients: [$doctor],
            type: 'appointment_confirmation',
            params: ['patient' => $this->patientName($appointment)],
            actionUrl: route('appointments.show', ['appointment' => $appointment->id]),
            referenceType: 'Appointment',
            referenceId: $appointment->id,
        );
    }

    private function patientName(Appointment $appointment): string
    {
        $patient = $appointment->patient;

        return $patient
            ? (trim($patient->first_name.' '.$patient->last_name) ?: '—')
            : '—';
    }
}
