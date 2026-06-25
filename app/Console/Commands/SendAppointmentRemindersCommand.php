<?php

namespace App\Console\Commands;

use App\Jobs\SendAppointmentConfirmationWhatsApp;
use App\Models\Appointment;
use Illuminate\Console\Command;

/**
 * Queues the automatic WhatsApp reminder for every live appointment starting
 * within the next 24 hours that the patient hasn't confirmed yet. Runs hourly
 * (bootstrap/app.php); `reminder_24h_sent_at` makes it idempotent so an
 * appointment is reminded at most once. Appointments span every clinic — RLS
 * is disabled on the table — and the dispatched job restores per-clinic tenant
 * context when it runs.
 */
class SendAppointmentRemindersCommand extends Command
{
    protected $signature = 'app:send-appointment-reminders';

    protected $description = 'Queue WhatsApp reminders for appointments starting within the next 24 hours.';

    public function handle(): int
    {
        $now = now();

        $due = Appointment::query()
            ->whereNull('reminder_24h_sent_at')
            ->whereNull('deleted_at')
            ->whereNotIn('status', ['cancelled', 'no_show', 'completed'])
            ->whereNotIn('confirmation_status', ['confirmed_by_patient', 'confirmed_by_call', 'declined'])
            ->whereBetween('scheduled_start', [$now, $now->copy()->addDay()])
            ->orderBy('scheduled_start')
            ->get(['id', 'clinic_id']);

        foreach ($due as $appointment) {
            // Stamp before dispatching so the next hourly run (or an overlapping
            // one) never double-queues the same reminder.
            $appointment->forceFill(['reminder_24h_sent_at' => now()])->save();

            SendAppointmentConfirmationWhatsApp::dispatch(
                $appointment->clinic_id,
                $appointment->id,
                null,
                'auto',
            );
        }

        $this->info("Queued {$due->count()} appointment reminder(s).");

        return self::SUCCESS;
    }
}
