<?php

namespace App\Listeners;

use App\Events\AppointmentCreated;
use App\Jobs\SendAppointmentConfirmationWhatsApp;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;

/**
 * Dispatches the send-confirmation job after the AppointmentCreated event
 * fires. `ShouldQueueAfterCommit` guarantees the dispatched job's worker
 * sees the committed appointment row when it runs (matters when the
 * controller is wrapped in a DB::transaction).
 */
class SendAppointmentConfirmationListener implements ShouldQueueAfterCommit
{
    public function handle(AppointmentCreated $event): void
    {
        SendAppointmentConfirmationWhatsApp::dispatch(
            $event->appointment->clinic_id,
            $event->appointment->id,
        );
    }
}
