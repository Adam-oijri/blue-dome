<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Services\Notifications\NotificationFeedService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The doctor's own dashboard: today's schedule, KPIs, pending confirmations,
 * and recent patients — all scoped to `appointments.doctor_id = $user->id`
 * (a doctor owns their appointments regardless of clinic; clinical RLS is
 * disabled per Phase 8).
 */
class DashboardController extends Controller
{
    private const CONFIRMED = ['confirmed_by_patient', 'confirmed_by_call'];

    public function index(Request $request, NotificationFeedService $feed): Response
    {
        $user = $request->user();
        $today = CarbonImmutable::today();
        $weekEnd = $today->endOfWeek();

        $base = fn () => Appointment::query()->where('doctor_id', $user->id);

        $kpis = [
            'today_count' => $base()->whereDate('appointment_day', $today)->count(),
            'pending_confirmations' => $base()
                ->where('scheduled_start', '>=', now())
                ->whereNotIn('confirmation_status', self::CONFIRMED)
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->count(),
            'completed_today' => $base()->whereDate('appointment_day', $today)->where('status', 'completed')->count(),
            'week_upcoming' => $base()
                ->whereBetween('scheduled_start', [now(), $weekEnd->endOfDay()])
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->count(),
        ];

        return Inertia::render('panels/doctor/dashboard', [
            'kpis' => $kpis,
            'recent_notifications' => $feed->recent($user, 6),
            'today_schedule' => $base()
                ->whereDate('appointment_day', $today)
                ->with('patient:id,first_name,last_name,phone')
                ->orderBy('scheduled_start')
                ->get(['id', 'patient_id', 'scheduled_start', 'scheduled_end', 'status', 'type']),
            'pending_confirmations_list' => $base()
                ->where('scheduled_start', '>=', now())
                ->whereNotIn('confirmation_status', self::CONFIRMED)
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->with('patient:id,first_name,last_name')
                ->orderBy('scheduled_start')
                ->limit(5)
                ->get(['id', 'patient_id', 'scheduled_start']),
            'recent_patients' => $this->recentPatients($user->id),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentPatients(string $doctorId): array
    {
        $rows = Appointment::query()
            ->where('doctor_id', $doctorId)
            ->where('scheduled_start', '<=', now())
            ->whereNotIn('status', ['cancelled'])
            ->selectRaw('patient_id, MAX(scheduled_start) AS last_visit')
            ->groupBy('patient_id')
            ->orderByDesc('last_visit')
            ->limit(6)
            ->get();

        if ($rows->isEmpty()) {
            return [];
        }

        $patients = Patient::query()
            ->whereIn('id', $rows->pluck('patient_id'))
            ->get(['id', 'first_name', 'last_name', 'phone', 'gender', 'blood_type'])
            ->keyBy('id');

        return $rows->map(fn ($row): array => [
            'id' => $row->patient_id,
            'first_name' => $patients[$row->patient_id]?->first_name,
            'last_name' => $patients[$row->patient_id]?->last_name,
            'phone' => $patients[$row->patient_id]?->phone,
            'gender' => $patients[$row->patient_id]?->gender,
            'blood_type' => $patients[$row->patient_id]?->blood_type,
            'last_visit' => $row->last_visit,
        ])->all();
    }
}
