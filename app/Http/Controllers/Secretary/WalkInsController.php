<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary walk-in queue — clinic-scoped, same-day bookings made today.
 *
 * There is no dedicated walk-in flag in the schema, so a walk-in is derived:
 * an appointment whose day is today AND whose row was created today (booked on
 * arrival rather than in advance), still in an active state. Sorted by start
 * time, with the live wait (now − scheduled start) computed per row.
 */
class WalkInsController extends Controller
{
    /**
     * Active statuses that keep a same-day booking in the walk-in queue.
     *
     * @var list<string>
     */
    private const ACTIVE_STATUSES = ['scheduled', 'confirmed', 'arrived', 'in_progress'];

    public function index(Request $request): Response
    {
        $clinicId = $request->user()->clinic_id;
        $today = CarbonImmutable::today();
        $now = CarbonImmutable::now();

        // A walk-in is a same-day booking: today's appointment that was also
        // created today. Compare against explicit app-timezone day boundaries
        // rather than DATE(created_at) (a raw cast that depends on the DB
        // session timezone) so the match is timezone-proof.
        $appointments = Appointment::query()
            ->where('clinic_id', $clinicId)
            ->whereDate('appointment_day', $today)
            ->whereBetween('created_at', [$today->startOfDay(), $today->endOfDay()])
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->with([
                'patient:id,first_name,last_name,gender',
                'doctor:id,first_name,last_name',
            ])
            ->orderBy('scheduled_start')
            ->get();

        $walkIns = $appointments->map(function (Appointment $appointment) use ($now): array {
            $waitMinutes = $appointment->scheduled_start
                ? max(0, (int) $appointment->scheduled_start->diffInMinutes($now, false))
                : 0;

            return [
                'id' => $appointment->id,
                'patient' => $appointment->patient ? [
                    'first_name' => $appointment->patient->first_name,
                    'last_name' => $appointment->patient->last_name,
                    'gender' => $appointment->patient->gender,
                ] : null,
                'doctor' => $appointment->doctor ? [
                    'first_name' => $appointment->doctor->first_name,
                    'last_name' => $appointment->doctor->last_name,
                ] : null,
                'scheduled_start' => $appointment->scheduled_start?->toIso8601String(),
                'status' => $appointment->status,
                'priority' => $appointment->priority,
                'reason' => $appointment->reason ?: $appointment->chief_complaint ?: null,
                'wait_minutes' => $waitMinutes,
            ];
        });

        return Inertia::render('panels/secretary/walk-ins', [
            'walk_ins' => $walkIns,
            'kpis' => [
                'waiting' => $appointments->count(),
                'avg_wait' => $appointments->isNotEmpty()
                    ? (int) round($walkIns->avg('wait_minutes'))
                    : 0,
            ],
        ]);
    }
}
