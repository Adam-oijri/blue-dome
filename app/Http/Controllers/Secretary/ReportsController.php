<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Payment;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Secretary reports — clinic-scoped operational insights over a selectable
 * window (7d / 30d / quarter): daily appointment volume, weekly collected
 * revenue, a booked → confirmed → arrived → completed funnel, and per-doctor
 * appointment volume. All queries are scoped to the secretary's clinic.
 */
class ReportsController extends Controller
{
    private const CONFIRMED_STATUSES = ['confirmed', 'arrived', 'in_progress', 'completed'];

    /** Patient/call confirmations live on confirmation_status, not status. */
    private const CONFIRMED_CONFIRMATION = ['confirmed_by_patient', 'confirmed_by_call'];

    private const ARRIVED_STATUSES = ['arrived', 'in_progress', 'completed'];

    /**
     * @var array<string, int>
     */
    private const PERIOD_DAYS = [
        '7d' => 7,
        '30d' => 30,
        'qtr' => 90,
    ];

    public function index(Request $request): Response
    {
        $clinicId = $request->user()->clinic_id;

        $period = $request->string('period')->toString();
        if (! array_key_exists($period, self::PERIOD_DAYS)) {
            $period = '7d';
        }

        $days = self::PERIOD_DAYS[$period];
        $today = CarbonImmutable::today();
        $windowStart = $today->subDays($days - 1);

        return Inertia::render('panels/secretary/reports', [
            'appointments_per_day' => $this->appointmentsPerDay($clinicId, $windowStart, $today),
            'revenue_per_week' => $this->revenuePerWeek($clinicId, $windowStart, $today),
            'funnel' => $this->funnel($clinicId, $windowStart, $today),
            'doctor_volumes' => $this->doctorVolumes($clinicId, $windowStart, $today),
            'filters' => [
                'period' => $period,
            ],
        ]);
    }

    /**
     * Stream the daily appointment volume for the selected window as a CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $clinicId = $request->user()->clinic_id;

        $period = $request->string('period')->toString();
        if (! array_key_exists($period, self::PERIOD_DAYS)) {
            $period = '7d';
        }

        $today = CarbonImmutable::today();
        $windowStart = $today->subDays(self::PERIOD_DAYS[$period] - 1);
        $series = $this->appointmentsPerDay($clinicId, $windowStart, $today);

        return response()->streamDownload(function () use ($series): void {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel reads accents correctly.
            fputcsv($out, ['Date', 'Appointments']);
            foreach ($series as $row) {
                fputcsv($out, [$row['date'], $row['count']]);
            }
            fclose($out);
        }, 'report-'.$period.'-'.$today->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Appointment counts for each day in the window (zero-filled).
     *
     * @return array<int, array{date: string, count: int}>
     */
    private function appointmentsPerDay(string $clinicId, CarbonImmutable $from, CarbonImmutable $to): array
    {
        // ->toBase(): a GROUP BY aggregate hydrated as an Eloquent model drops
        // the real grouping column (appointment_day), so pluck() would key on
        // null. Plain stdClass rows keep every selected column.
        $counts = Appointment::query()
            ->where('clinic_id', $clinicId)
            ->whereBetween('appointment_day', [$from->toDateString(), $to->toDateString()])
            ->select('appointment_day', DB::raw('COUNT(*) AS count'))
            ->groupBy('appointment_day')
            ->toBase()
            ->pluck('count', 'appointment_day');

        $series = [];
        for ($day = $from; $day->lessThanOrEqualTo($to); $day = $day->addDay()) {
            $key = $day->toDateString();
            $series[] = [
                'date' => $key,
                'count' => (int) ($counts[$key] ?? 0),
            ];
        }

        return $series;
    }

    /**
     * Collected revenue grouped by ISO week over the window.
     *
     * @return array<int, array{week_label: string, amount: float}>
     */
    private function revenuePerWeek(string $clinicId, CarbonImmutable $from, CarbonImmutable $to): array
    {
        return Payment::query()
            ->where('clinic_id', $clinicId)
            ->where('payment_status', 'completed')
            ->whereBetween('payment_date', [$from->toDateString(), $to->toDateString()])
            ->select(
                DB::raw("to_char(date_trunc('week', payment_date), 'IYYY-\"W\"IW') AS week_label"),
                DB::raw('date_trunc(\'week\', payment_date) AS week_start'),
                DB::raw('COALESCE(SUM(amount), 0) AS amount'),
            )
            ->groupBy('week_label', 'week_start')
            ->orderBy('week_start')
            ->get()
            ->map(fn ($row): array => [
                'week_label' => (string) $row->week_label,
                'amount' => (float) $row->amount,
            ])
            ->all();
    }

    /**
     * Booked → confirmed → arrived → completed counts over the window.
     *
     * @return array{booked: int, confirmed: int, arrived: int, completed: int}
     */
    private function funnel(string $clinicId, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $base = fn () => Appointment::query()
            ->where('clinic_id', $clinicId)
            ->whereBetween('appointment_day', [$from->toDateString(), $to->toDateString()]);

        return [
            'booked' => $base()->count(),
            'confirmed' => $base()
                ->where(function ($query): void {
                    $query->whereIn('status', self::CONFIRMED_STATUSES)
                        ->orWhereIn('confirmation_status', self::CONFIRMED_CONFIRMATION);
                })
                ->count(),
            'arrived' => $base()->whereIn('status', self::ARRIVED_STATUSES)->count(),
            'completed' => $base()->where('status', 'completed')->count(),
        ];
    }

    /**
     * Appointment volume per doctor over the window (top doctors first).
     *
     * @return array<int, array{doctor_name: string, count: int}>
     */
    private function doctorVolumes(string $clinicId, CarbonImmutable $from, CarbonImmutable $to): array
    {
        return Appointment::query()
            ->where('appointments.clinic_id', $clinicId)
            ->whereBetween('appointments.appointment_day', [$from->toDateString(), $to->toDateString()])
            ->join('users', 'users.id', '=', 'appointments.doctor_id')
            ->select(
                DB::raw("TRIM(CONCAT(users.first_name, ' ', users.last_name)) AS doctor_name"),
                DB::raw('COUNT(*) AS count'),
            )
            ->groupBy('doctor_name')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($row): array => [
                'doctor_name' => (string) $row->doctor_name,
                'count' => (int) $row->count,
            ])
            ->all();
    }
}
