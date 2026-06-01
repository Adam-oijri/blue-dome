<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary appointments list — clinic-scoped appointments for a selectable
 * range (today / tomorrow / this week) with patient and doctor relations, plus
 * today's confirmation/cancellation KPIs. Read-only schedule overview.
 */
class AppointmentsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $clinicId = $user->clinic_id;

        $range = $request->string('range', 'today')->toString();

        if (! in_array($range, ['today', 'tomorrow', 'week'], true)) {
            $range = 'today';
        }

        $appointments = Appointment::query()
            ->where('clinic_id', $clinicId)
            ->tap(fn (Builder $query) => $this->applyRange($query, $range))
            ->with([
                'patient:id,first_name,last_name,gender,blood_type,chronic_diseases',
                'doctor:id,first_name,last_name',
            ])
            ->orderBy('scheduled_start')
            ->get([
                'id',
                'patient_id',
                'doctor_id',
                'scheduled_start',
                'scheduled_end',
                'status',
                'type',
                'duration_minutes',
            ]);

        $today = now()->toDateString();

        $kpis = [
            'today_count' => Appointment::query()
                ->where('clinic_id', $clinicId)
                ->whereDate('appointment_day', $today)
                ->count(),
            'pending' => Appointment::query()
                ->where('clinic_id', $clinicId)
                ->whereNotIn('confirmation_status', ['confirmed_by_patient', 'confirmed_by_call'])
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->where('scheduled_start', '>=', now())
                ->count(),
            'confirmed' => Appointment::query()
                ->where('clinic_id', $clinicId)
                ->whereDate('appointment_day', $today)
                ->where(function (Builder $query): void {
                    $query->where('status', 'confirmed')
                        ->orWhereIn('confirmation_status', ['confirmed_by_patient', 'confirmed_by_call']);
                })
                ->count(),
            'cancelled' => Appointment::query()
                ->where('clinic_id', $clinicId)
                ->whereDate('appointment_day', $today)
                ->where('status', 'cancelled')
                ->count(),
        ];

        return Inertia::render('panels/secretary/appointments', [
            'appointments' => $appointments,
            'kpis' => $kpis,
            'filters' => ['range' => $range],
        ]);
    }

    /**
     * Constrain the query to the requested date range on the appointment day.
     */
    private function applyRange(Builder $query, string $range): void
    {
        match ($range) {
            'tomorrow' => $query->whereDate('appointment_day', now()->addDay()->toDateString()),
            'week' => $query->whereBetween('appointment_day', [
                now()->startOfWeek()->toDateString(),
                now()->endOfWeek()->toDateString(),
            ]),
            default => $query->whereDate('appointment_day', now()->toDateString()),
        };
    }
}
