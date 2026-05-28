<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Services\SuperAdminMetricsService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Cross-tenant KPI dashboard for the platform owner. Route group
 * `role:super_admin` is the gate — controllers here intentionally do not
 * re-check the role to keep them composable with future maintenance routes.
 */
class DashboardController extends Controller
{
    private const PERIODS = ['today', 'week', 'month', 'quarter', 'ytd'];

    public function __construct(private readonly SuperAdminMetricsService $metrics) {}

    public function index(Request $request): Response
    {
        $period = in_array($request->query('period'), self::PERIODS, true)
            ? (string) $request->query('period')
            : 'month';

        $days = $this->daysForPeriod($period);

        return Inertia::render('panels/super-admin/dashboard', [
            'period' => $period,
            'metrics' => [
                'total_clinics' => $this->metrics->totalClinics(),
                'active_clinics' => $this->metrics->activeClinics(),
                'mrr' => $this->metrics->mrr(),
                'active_appointments_today' => $this->metrics->activeAppointmentsToday(),
                'recent_signups' => $this->metrics->recentSignups(),
                'total_revenue' => $this->metrics->totalRevenue($days),
                'total_appointments' => $this->metrics->totalAppointments($days),
                'total_patients' => $this->metrics->totalPatients(),
                'doctor_utilization' => $this->metrics->doctorUtilizationToday(),
                'whatsapp_delivery_rate' => $this->metrics->whatsappDeliveryRate(),
            ],
            'appointment_counts_by_clinic' => Inertia::defer(
                fn () => $this->metrics->appointmentCountByClinic()
            ),
            'monthly_revenue' => Inertia::defer(
                fn () => $this->metrics->monthlyRevenue()
            ),
            'top_doctors' => Inertia::defer(
                fn () => $this->metrics->topDoctors()
            ),
            'top_clinics' => Inertia::defer(
                fn () => $this->metrics->topClinicsByRevenue()
            ),
            'operations_today' => Inertia::defer(
                fn () => $this->metrics->operationsTodayByClinic()
            ),
            'alerts' => Inertia::defer(
                fn () => $this->metrics->alerts()
            ),
            'recent_activity' => Inertia::defer(
                fn () => $this->metrics->recentActivity()
            ),
        ]);
    }

    /**
     * Map a dashboard period selector value to a trailing day window for the
     * time-scoped KPIs (revenue, appointments).
     */
    private function daysForPeriod(string $period): int
    {
        return match ($period) {
            'today' => 1,
            'week' => 7,
            'quarter' => 90,
            'ytd' => max(1, (int) CarbonImmutable::now()->startOfYear()->diffInDays(CarbonImmutable::now())),
            default => 30,
        };
    }
}
