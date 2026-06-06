<?php

namespace App\Listeners;

use App\Events\AppointmentConfirmed;
use App\Models\User;
use App\Services\Notifications\NotificationService;
use Illuminate\Support\Facades\DB;

/**
 * Alerts the doctor when a patient confirms their appointment. This fires from
 * the public, token-based confirmation flow (a guest request with no tenant
 * GUC), so the recipient lookup + insert are scoped to the appointment's
 * clinic transaction-locally to satisfy RLS. See
 * [[project_rls_provisioning_elevation]]. No deep-link (guest URL building is
 * avoided); the doctor opens it from their calendar.
 */
class NotifyAppointmentConfirmed
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(AppointmentConfirmed $event): void
    {
        $appointment = $event->appointment;

        if (empty($appointment->doctor_id)) {
            return;
        }

        DB::transaction(function () use ($appointment): void {
            DB::statement('SELECT set_config(?, ?, true)', [
                'app.current_clinic_id',
                (string) $appointment->clinic_id,
            ]);

            $doctor = User::find($appointment->doctor_id);

            if ($doctor === null) {
                return;
            }

            $appointment->loadMissing('patient:id,first_name,last_name');
            $patient = $appointment->patient;
            $name = $patient
                ? (trim($patient->first_name.' '.$patient->last_name) ?: '—')
                : '—';

            $this->notifications->send(
                recipients: [$doctor],
                type: 'appointment_confirmed',
                params: ['patient' => $name],
                referenceType: 'Appointment',
                referenceId: $appointment->id,
            );
        });
    }
}
