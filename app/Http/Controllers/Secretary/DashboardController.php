<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\MessageLog;
use App\Models\Payment;
use App\Models\SecretaryChecklistCustomItem;
use App\Models\SecretaryChecklistItem;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary front-desk dashboard — a live, clinic-scoped operational view:
 * today's KPIs, a multi-doctor schedule timeline, the waiting room, and the
 * latest WhatsApp confirmations. Everything is bound to the secretary's own
 * `clinic_id`; the schedule timeline is measured in minutes from 08:00, the
 * same baseline the React grid renders against.
 */
class DashboardController extends Controller
{
    private const CONFIRMED = ['confirmed_by_patient', 'confirmed_by_call'];

    private const INACTIVE = ['cancelled', 'no_show'];

    /**
     * The schedule grid starts at 08:00; block offsets are measured in minutes
     * from this baseline.
     */
    private const DAY_START_HOUR = 8;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $clinicId = $user->clinic_id;
        $today = CarbonImmutable::today();
        $now = CarbonImmutable::now();

        $base = fn () => Appointment::query()->where('clinic_id', $clinicId);

        $kpis = [
            'today' => $base()->whereDate('appointment_day', $today)->count(),
            'pending' => $base()
                ->where('scheduled_start', '>=', $now)
                ->whereNotIn('confirmation_status', self::CONFIRMED)
                ->whereNotIn('status', self::INACTIVE)
                ->count(),
            'walkins' => $base()
                ->whereDate('appointment_day', $today)
                ->where('status', 'arrived')
                ->count(),
            'cash' => (float) Payment::query()
                ->where('clinic_id', $clinicId)
                ->where('payment_status', 'completed')
                ->whereDate('payment_date', $today)
                ->sum('amount'),
            'noshows' => $base()
                ->where('status', 'no_show')
                ->where('scheduled_start', '>=', $now->subDays(7))
                ->count(),
        ];

        return Inertia::render('panels/secretary/dashboard', [
            'kpis' => $kpis,
            'schedule' => $this->schedule($clinicId, $today),
            'waiting_room' => $this->waitingRoom($clinicId, $today, $now),
            'whatsapp' => $this->whatsapp($clinicId),
            'now_minute' => $this->minutesFromDayStart($now),
            'now_label' => $now->format('H:i'),
            'checklist_done' => SecretaryChecklistItem::query()
                ->where('user_id', $user->id)
                ->where('checklist_date', $today->toDateString())
                ->pluck('item_key')
                ->all(),
            'checklist_custom' => SecretaryChecklistCustomItem::query()
                ->where('user_id', $user->id)
                ->orderBy('created_at')
                ->get(['id', 'label'])
                ->all(),
        ]);
    }

    /**
     * Today's appointments grouped per doctor, as timeline blocks measured in
     * minutes from 08:00. Only doctors who actually have appointments today are
     * returned.
     *
     * @return array<int, array<string, mixed>>
     */
    private function schedule(string $clinicId, CarbonImmutable $today): array
    {
        $appointments = Appointment::query()
            ->where('clinic_id', $clinicId)
            ->whereDate('appointment_day', $today)
            ->with([
                'doctor:id,first_name,last_name',
                'patient:id,first_name,last_name',
            ])
            ->orderBy('scheduled_start')
            ->get(['id', 'doctor_id', 'patient_id', 'scheduled_start', 'duration_minutes', 'status']);

        return $appointments
            ->groupBy('doctor_id')
            ->map(function (Collection $group): array {
                $doctor = $group->first()->doctor;

                return [
                    'doctor' => [
                        'id' => $doctor?->id,
                        'first_name' => $doctor?->first_name,
                        'last_name' => $doctor?->last_name,
                    ],
                    'blocks' => $group->map(fn (Appointment $appointment): array => [
                        'start_minute' => $this->minutesFromDayStart(
                            CarbonImmutable::parse($appointment->scheduled_start)
                        ),
                        'duration' => (int) ($appointment->duration_minutes ?? 30),
                        'status' => $this->mapScheduleStatus($appointment->status),
                        'patient_name' => $this->fullName($appointment->patient),
                    ])->values()->all(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Today's checked-in patients (arrived / in consultation), ordered by
     * arrival, with computed wait time and a walk-in flag.
     *
     * @return array<int, array<string, mixed>>
     */
    private function waitingRoom(string $clinicId, CarbonImmutable $today, CarbonImmutable $now): array
    {
        return Appointment::query()
            ->where('clinic_id', $clinicId)
            ->whereDate('appointment_day', $today)
            ->whereIn('status', ['arrived', 'in_progress'])
            ->with([
                'patient:id,first_name,last_name,gender,blood_type,chronic_diseases',
                'doctor:id,first_name,last_name',
            ])
            ->orderBy('scheduled_start')
            ->get(['id', 'patient_id', 'doctor_id', 'scheduled_start', 'status', 'appointment_day', 'created_at'])
            ->map(function (Appointment $appointment) use ($now): array {
                $start = CarbonImmutable::parse($appointment->scheduled_start);
                $patient = $appointment->patient;
                $doctor = $appointment->doctor;

                return [
                    'id' => $appointment->id,
                    'patient' => [
                        'first_name' => $patient?->first_name,
                        'last_name' => $patient?->last_name,
                        'gender' => $patient?->gender,
                        'blood_type' => $patient?->blood_type,
                        'has_chronic' => filled($patient?->chronic_diseases),
                    ],
                    'doctor' => [
                        'first_name' => $doctor?->first_name,
                        'last_name' => $doctor?->last_name,
                    ],
                    'arrived_at' => $appointment->scheduled_start,
                    'wait_minutes' => max(0, (int) $start->diffInMinutes($now, false)),
                    'status' => $appointment->status === 'in_progress' ? 'in_room' : 'arrived',
                    'walkin' => $appointment->created_at !== null
                        && CarbonImmutable::parse($appointment->created_at)->toDateString()
                            === CarbonImmutable::parse($appointment->appointment_day)->toDateString(),
                ];
            })
            ->all();
    }

    /**
     * The latest WhatsApp message-log entries for this clinic.
     *
     * @return array<int, array<string, mixed>>
     */
    private function whatsapp(string $clinicId): array
    {
        return MessageLog::query()
            ->where('clinic_id', $clinicId)
            ->where('message_type', 'whatsapp')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'recipient_name', 'status', 'created_at'])
            ->map(fn (MessageLog $log): array => [
                'id' => $log->id,
                'recipient_name' => $log->recipient_name,
                'status' => $log->status,
                'appt_time' => $log->created_at?->format('H:i'),
            ])
            ->all();
    }

    /**
     * Collapse the appointment status vocabulary into the smaller set the
     * schedule timeline renders: confirmed | pending | in_progress |
     * completed | cancelled.
     */
    private function mapScheduleStatus(string $status): string
    {
        return match ($status) {
            'completed' => 'completed',
            'in_progress' => 'in_progress',
            'cancelled' => 'cancelled',
            'confirmed' => 'confirmed',
            default => 'pending',
        };
    }

    private function minutesFromDayStart(CarbonImmutable $moment): int
    {
        $dayStart = $moment->setTime(self::DAY_START_HOUR, 0, 0);

        // Clamp so an appointment (or "now") before 08:00 pins to the top of
        // the grid instead of rendering at a negative offset (off-screen).
        return max(0, (int) $dayStart->diffInMinutes($moment, false));
    }

    private function fullName(?object $person): string
    {
        if ($person === null) {
            return '—';
        }

        $name = trim(($person->first_name ?? '').' '.($person->last_name ?? ''));

        return $name === '' ? '—' : $name;
    }
}
