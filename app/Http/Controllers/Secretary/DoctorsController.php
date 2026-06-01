<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary doctors roster — clinic-scoped list of the clinic's doctors with
 * each doctor's specialty, today's and this week's appointment load, current
 * availability state and a 7-day load sparkline. Read-only overview.
 *
 * Per-doctor metrics are computed from two grouped aggregate queries (daily
 * counts + in-consultation set) rather than per-doctor queries, so cost stays
 * constant regardless of how many doctors the clinic has.
 */
class DoctorsController extends Controller
{
    /**
     * Appointment statuses that should not count toward a doctor's load.
     *
     * @var list<string>
     */
    private const EXCLUDED_STATUSES = ['cancelled', 'no_show'];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $clinicId = $user->clinic_id;
        $today = CarbonImmutable::today();
        $now = CarbonImmutable::now();

        $weekStart = $today->startOfWeek();
        $weekEnd = $today->endOfWeek();
        $loadStart = $today->subDays(6);

        $doctors = User::query()
            ->where('users.role', 'doctor')
            ->where('users.clinic_id', $clinicId)
            ->leftJoin('doctor_profiles', 'doctor_profiles.user_id', '=', 'users.id')
            ->select([
                'users.id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'users.is_active',
                'users.primary_branch_id',
                'doctor_profiles.specialty as specialty',
                'doctor_profiles.consultation_fee as consultation_fee',
            ])
            ->orderBy('users.first_name')
            ->get();

        $doctorIds = $doctors->pluck('id')->all();

        // One query: per-doctor, per-day counts spanning both the load
        // sparkline window (last 7 days) and the current calendar week.
        $windowStart = $loadStart->lessThan($weekStart) ? $loadStart : $weekStart;
        $windowEnd = $weekEnd->greaterThan($today) ? $weekEnd : $today;

        // ->toBase() returns plain stdClass rows with exactly the selected
        // columns; hydrating an Eloquent model from a GROUP BY aggregate drops
        // the non-key raw columns (doctor_id / appointment_day) and would leave
        // the keys null.
        $dailyCounts = [];
        if ($doctorIds !== []) {
            Appointment::query()
                ->where('clinic_id', $clinicId)
                ->whereIn('doctor_id', $doctorIds)
                ->whereNotIn('status', self::EXCLUDED_STATUSES)
                ->whereBetween('appointment_day', [$windowStart->toDateString(), $windowEnd->toDateString()])
                ->selectRaw('doctor_id, appointment_day, COUNT(*) AS total')
                ->groupBy('doctor_id', 'appointment_day')
                ->toBase()
                ->get()
                ->each(function ($row) use (&$dailyCounts): void {
                    $day = CarbonImmutable::parse($row->appointment_day)->toDateString();
                    $dailyCounts[$row->doctor_id][$day] = (int) $row->total;
                });
        }

        // One query: doctors currently in consultation right now.
        $inConsult = [];
        if ($doctorIds !== []) {
            $inConsult = Appointment::query()
                ->where('clinic_id', $clinicId)
                ->whereIn('doctor_id', $doctorIds)
                ->where('status', 'in_progress')
                ->where('scheduled_start', '<=', $now)
                ->where('scheduled_end', '>=', $now)
                ->distinct()
                ->pluck('doctor_id')
                ->all();
        }
        $inConsult = array_flip($inConsult);

        $todayKey = $today->toDateString();

        $rows = $doctors->map(function (User $doctor) use ($dailyCounts, $inConsult, $todayKey, $weekStart, $weekEnd, $loadStart, $today): array {
            $days = $dailyCounts[$doctor->id] ?? [];

            $weekCount = 0;
            for ($day = $weekStart; $day->lessThanOrEqualTo($weekEnd); $day = $day->addDay()) {
                $weekCount += $days[$day->toDateString()] ?? 0;
            }

            $weekLoad = [];
            for ($day = $loadStart; $day->lessThanOrEqualTo($today); $day = $day->addDay()) {
                $weekLoad[] = $days[$day->toDateString()] ?? 0;
            }

            return [
                'id' => $doctor->id,
                'first_name' => $doctor->first_name,
                'last_name' => $doctor->last_name,
                'email' => $doctor->email,
                'is_active' => $doctor->is_active,
                'specialty' => $doctor->specialty,
                'today_count' => $days[$todayKey] ?? 0,
                'week_count' => $weekCount,
                'state' => isset($inConsult[$doctor->id])
                    ? 'in_consult'
                    : ((bool) $doctor->is_active ? 'available' : 'off'),
                'week_load' => $weekLoad,
            ];
        })->all();

        return Inertia::render('panels/secretary/doctors', [
            'doctors' => $rows,
            'clinic_name' => $user->clinic?->name,
        ]);
    }
}
