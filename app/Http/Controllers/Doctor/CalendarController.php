<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The doctor's weekly calendar. `?date=` anchors the displayed week (defaults
 * to the current week). Scoped to the doctor's own appointments.
 */
class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $anchor = CarbonImmutable::parse($request->date('date') ?? CarbonImmutable::today());
        $weekStart = $anchor->startOfWeek();
        $weekEnd = $anchor->endOfWeek();

        $appointments = Appointment::query()
            ->where('doctor_id', $user->id)
            ->whereBetween('scheduled_start', [$weekStart->startOfDay(), $weekEnd->endOfDay()])
            ->whereNotIn('status', ['cancelled'])
            ->with('patient:id,first_name,last_name')
            ->orderBy('scheduled_start')
            ->get(['id', 'patient_id', 'scheduled_start', 'scheduled_end', 'status', 'type']);

        return Inertia::render('panels/doctor/calendar', [
            'appointments' => $appointments,
            'week' => [
                'start' => $weekStart->toDateString(),
                'end' => $weekEnd->toDateString(),
                'days' => collect(range(0, 6))->map(fn ($i) => $weekStart->addDays($i)->toDateString())->all(),
            ],
            'prev_week' => $weekStart->subWeek()->toDateString(),
            'next_week' => $weekStart->addWeek()->toDateString(),
            'today' => CarbonImmutable::today()->toDateString(),
        ]);
    }
}
