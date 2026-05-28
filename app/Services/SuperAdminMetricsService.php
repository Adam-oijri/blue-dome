<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Models\Clinic;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Aggregates cross-tenant KPIs for the super-admin dashboard.
 *
 * IMPORTANT: every method here assumes the caller's session has
 * `app.is_super_admin = 'true'` set (which the SetTenantContext middleware does
 * automatically for super_admin sessions). Calling these methods from any other
 * context will surface only the caller's clinic's data — silently — because
 * RLS will filter the underlying queries. The service is intentionally
 * registered without an explicit guard so it composes cleanly into the
 * existing super-admin route group; the route guard is the gate.
 */
class SuperAdminMetricsService
{
    /**
     * Total non-deleted clinics on the platform, regardless of subscription
     * state. The denominator for most ratio metrics.
     */
    public function totalClinics(): int
    {
        return Clinic::query()->count();
    }

    /**
     * Clinics still on a paying or trialing plan and not flagged inactive.
     */
    public function activeClinics(): int
    {
        return Clinic::query()
            ->where('is_active', true)
            ->whereIn('subscription_status', ['active', 'trial'])
            ->count();
    }

    /**
     * Recurring revenue summed across the platform, denominated in the
     * `config('billing.currency')` currency. Trial clinics are excluded
     * (they do not bill yet); suspended / cancelled / expired clinics are
     * excluded by their status filter.
     *
     * @return array{currency: string, amount: float, by_plan: array<string, int>}
     */
    public function mrr(): array
    {
        $prices = (array) config('billing.plan_prices', []);

        $byPlan = Clinic::query()
            ->where('subscription_status', 'active')
            ->selectRaw('subscription_plan, COUNT(*) AS clinic_count')
            ->groupBy('subscription_plan')
            ->pluck('clinic_count', 'subscription_plan')
            ->map(fn ($value): int => (int) $value)
            ->all();

        $amount = 0.0;
        foreach ($byPlan as $plan => $count) {
            $amount += ($prices[$plan] ?? 0) * $count;
        }

        return [
            'currency' => (string) config('billing.currency', 'MAD'),
            'amount' => $amount,
            'by_plan' => $byPlan,
        ];
    }

    /**
     * Cross-tenant count of appointments scheduled/confirmed/arrived/in_progress
     * with appointment_day = today (in the database's TIMESTAMPTZ frame).
     */
    public function activeAppointmentsToday(): int
    {
        return Appointment::query()
            ->whereIn('status', ['scheduled', 'confirmed', 'arrived', 'in_progress'])
            ->whereDate('appointment_day', CarbonImmutable::today())
            ->count();
    }

    /**
     * Clinics created in the last N days, newest first.
     *
     * @return array<int, array{id: string, name: string, country: string, created_at: CarbonImmutable, subscription_plan: string}>
     */
    public function recentSignups(int $days = 30): array
    {
        return Clinic::query()
            ->where('created_at', '>=', CarbonImmutable::now()->subDays($days))
            ->orderByDesc('created_at')
            ->limit(20)
            ->get(['id', 'name', 'country', 'created_at', 'subscription_plan'])
            ->toArray();
    }

    /**
     * Appointment volume per clinic over the last 7 days, sorted desc. Used by
     * the deferred chart widget on the dashboard.
     *
     * @return array<int, array{clinic_id: string, clinic_name: string, count: int}>
     */
    public function appointmentCountByClinic(): array
    {
        return DB::table('appointments')
            ->join('clinics', 'clinics.id', '=', 'appointments.clinic_id')
            ->whereNull('appointments.deleted_at')
            ->where('appointments.created_at', '>=', CarbonImmutable::now()->subDays(7))
            ->selectRaw('clinics.id AS clinic_id, clinics.name AS clinic_name, COUNT(*) AS count')
            ->groupBy('clinics.id', 'clinics.name')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($row): array => [
                'clinic_id' => $row->clinic_id,
                'clinic_name' => $row->clinic_name,
                'count' => (int) $row->count,
            ])
            ->all();
    }

    /**
     * Sum of payment amounts across all clinics in the last N days.
     *
     * @return array{currency: string, amount: float}
     */
    public function totalRevenue(int $days = 30): array
    {
        $amount = (float) DB::table('payments')
            ->whereNull('deleted_at')
            ->where('created_at', '>=', CarbonImmutable::now()->subDays($days))
            ->sum('amount');

        return [
            'currency' => (string) config('billing.currency', 'MAD'),
            'amount' => $amount,
        ];
    }

    /**
     * Cross-tenant appointments count, any status, last N days.
     */
    public function totalAppointments(int $days = 30): int
    {
        return DB::table('appointments')
            ->whereNull('deleted_at')
            ->where('created_at', '>=', CarbonImmutable::now()->subDays($days))
            ->count();
    }

    /**
     * Total non-deleted patients across the platform.
     */
    public function totalPatients(): int
    {
        return DB::table('patients')
            ->whereNull('deleted_at')
            ->count();
    }

    /**
     * Doctor utilization for today: completed/arrived/in_progress over total
     * scheduled (excluding cancelled). Returns a fraction in [0,1].
     */
    public function doctorUtilizationToday(): float
    {
        $today = CarbonImmutable::today()->toDateString();

        $denominator = (int) DB::table('appointments')
            ->whereNull('deleted_at')
            ->whereDate('appointment_day', $today)
            ->whereNotIn('status', ['cancelled'])
            ->count();

        if ($denominator === 0) {
            return 0.0;
        }

        $numerator = (int) DB::table('appointments')
            ->whereNull('deleted_at')
            ->whereDate('appointment_day', $today)
            ->whereIn('status', ['arrived', 'in_progress', 'completed'])
            ->count();

        return round($numerator / $denominator, 4);
    }

    /**
     * Cross-tenant WhatsApp delivery rate over the last N days:
     * delivered+read messages divided by all messages that left the queue.
     */
    public function whatsappDeliveryRate(int $days = 7): float
    {
        $since = CarbonImmutable::now()->subDays($days);

        $denominator = (int) DB::table('message_log')
            ->where('message_type', 'whatsapp')
            ->where('created_at', '>=', $since)
            ->whereNotIn('status', ['pending', 'queued'])
            ->count();

        if ($denominator === 0) {
            return 0.0;
        }

        $numerator = (int) DB::table('message_log')
            ->where('message_type', 'whatsapp')
            ->where('created_at', '>=', $since)
            ->whereIn('status', ['delivered', 'read'])
            ->count();

        return round($numerator / $denominator, 4);
    }

    /**
     * Cross-tenant monthly revenue from payments over the last N months. Ordered
     * ascending by month. Returns one row per month with zero-fill so the chart
     * renders an even axis.
     *
     * @return array<int, array{month: string, amount: float}>
     */
    public function monthlyRevenue(int $months = 12): array
    {
        $start = CarbonImmutable::now()->startOfMonth()->subMonths($months - 1);

        $rows = DB::table('payments')
            ->whereNull('deleted_at')
            ->where('created_at', '>=', $start)
            ->selectRaw("to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, SUM(amount) AS amount")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $series = [];
        for ($i = 0; $i < $months; $i++) {
            $month = $start->addMonths($i)->format('Y-m');
            $series[] = [
                'month' => $month,
                'amount' => isset($rows[$month]) ? (float) $rows[$month]->amount : 0.0,
            ];
        }

        return $series;
    }

    /**
     * Top doctors across the platform ranked by completed appointments in the
     * last 30 days. Revenue is a proxy = consultation_fee × completed count
     * (real-money revenue lives in invoices/payments and is not always tied to
     * a single doctor).
     *
     * @return array<int, array{id: string, name: string, specialty: string|null, clinic_id: string, clinic_name: string, completed: int, scheduled: int, utilization: float, revenue: float}>
     */
    public function topDoctors(int $limit = 10): array
    {
        $since = CarbonImmutable::now()->subDays(30);

        $rows = DB::table('users')
            ->leftJoin('doctor_profiles', 'doctor_profiles.user_id', '=', 'users.id')
            ->leftJoin('clinics', 'clinics.id', '=', 'users.clinic_id')
            ->leftJoin('appointments', function ($join) use ($since): void {
                $join->on('appointments.doctor_id', '=', 'users.id')
                    ->whereNull('appointments.deleted_at')
                    ->where('appointments.created_at', '>=', $since);
            })
            ->where('users.role', 'doctor')
            ->whereNull('users.deleted_at')
            ->selectRaw("
                users.id,
                users.first_name,
                users.last_name,
                doctor_profiles.specialty,
                COALESCE(doctor_profiles.consultation_fee, 0) AS consultation_fee,
                clinics.id AS clinic_id,
                clinics.name AS clinic_name,
                COUNT(appointments.id) FILTER (WHERE appointments.status = 'completed') AS completed_count,
                COUNT(appointments.id) FILTER (WHERE appointments.status IN ('scheduled', 'confirmed', 'arrived', 'in_progress', 'completed')) AS scheduled_count
            ")
            ->groupBy(
                'users.id',
                'users.first_name',
                'users.last_name',
                'doctor_profiles.specialty',
                'doctor_profiles.consultation_fee',
                'clinics.id',
                'clinics.name',
            )
            ->orderByDesc('completed_count')
            ->limit($limit)
            ->get();

        return $rows->map(function ($row): array {
            $completed = (int) $row->completed_count;
            $scheduled = (int) $row->scheduled_count;
            $fee = (float) $row->consultation_fee;

            return [
                'id' => $row->id,
                'name' => trim(($row->first_name ?? '').' '.($row->last_name ?? '')),
                'specialty' => $row->specialty,
                'clinic_id' => $row->clinic_id,
                'clinic_name' => $row->clinic_name,
                'completed' => $completed,
                'scheduled' => $scheduled,
                'utilization' => $scheduled > 0 ? round($completed / $scheduled, 4) : 0.0,
                'revenue' => $fee * $completed,
            ];
        })->all();
    }

    /**
     * Top clinics by payment revenue over the last 30 days, with denormalized
     * counts so the dashboard can render without N+1 follow-ups.
     *
     * @return array<int, array{id: string, name: string, country: string|null, subscription_plan: string|null, revenue: float, patients_count: int, users_count: int, appointments_count: int}>
     */
    public function topClinicsByRevenue(int $limit = 5): array
    {
        $since = CarbonImmutable::now()->subDays(30);

        $rows = DB::table('clinics')
            ->leftJoin('payments', function ($join) use ($since): void {
                $join->on('payments.clinic_id', '=', 'clinics.id')
                    ->whereNull('payments.deleted_at')
                    ->where('payments.created_at', '>=', $since);
            })
            ->whereNull('clinics.deleted_at')
            ->selectRaw('
                clinics.id,
                clinics.name,
                clinics.country,
                clinics.subscription_plan,
                COALESCE(SUM(payments.amount), 0) AS revenue
            ')
            ->groupBy('clinics.id', 'clinics.name', 'clinics.country', 'clinics.subscription_plan')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get();

        if ($rows->isEmpty()) {
            return [];
        }

        $clinicIds = $rows->pluck('id')->all();

        $patientCounts = DB::table('patients')
            ->whereNull('deleted_at')
            ->whereIn('clinic_id', $clinicIds)
            ->selectRaw('clinic_id, COUNT(*) AS c')
            ->groupBy('clinic_id')
            ->pluck('c', 'clinic_id');

        $userCounts = DB::table('users')
            ->whereNull('deleted_at')
            ->whereIn('clinic_id', $clinicIds)
            ->selectRaw('clinic_id, COUNT(*) AS c')
            ->groupBy('clinic_id')
            ->pluck('c', 'clinic_id');

        $apptCounts = DB::table('appointments')
            ->whereNull('deleted_at')
            ->whereIn('clinic_id', $clinicIds)
            ->where('created_at', '>=', $since)
            ->selectRaw('clinic_id, COUNT(*) AS c')
            ->groupBy('clinic_id')
            ->pluck('c', 'clinic_id');

        return $rows->map(fn ($row): array => [
            'id' => $row->id,
            'name' => $row->name,
            'country' => $row->country,
            'subscription_plan' => $row->subscription_plan,
            'revenue' => (float) $row->revenue,
            'patients_count' => (int) ($patientCounts[$row->id] ?? 0),
            'users_count' => (int) ($userCounts[$row->id] ?? 0),
            'appointments_count' => (int) ($apptCounts[$row->id] ?? 0),
        ])->all();
    }

    /**
     * Today's appointment activity grouped by clinic. Revenue here is the proxy
     * `consultation_fee × completed_count` summed across the clinic's doctors.
     *
     * @return array<int, array{clinic_id: string, clinic_name: string, scheduled: int, arrived: int, completed: int, no_show: int, revenue: float}>
     */
    public function operationsTodayByClinic(): array
    {
        $today = CarbonImmutable::today()->toDateString();

        $rows = DB::table('appointments')
            ->join('clinics', 'clinics.id', '=', 'appointments.clinic_id')
            ->leftJoin('doctor_profiles', 'doctor_profiles.user_id', '=', 'appointments.doctor_id')
            ->whereNull('appointments.deleted_at')
            ->whereDate('appointments.appointment_day', $today)
            ->selectRaw("
                clinics.id AS clinic_id,
                clinics.name AS clinic_name,
                COUNT(*) FILTER (WHERE appointments.status IN ('scheduled', 'confirmed')) AS scheduled,
                COUNT(*) FILTER (WHERE appointments.status = 'arrived') AS arrived,
                COUNT(*) FILTER (WHERE appointments.status = 'completed') AS completed,
                COUNT(*) FILTER (WHERE appointments.status = 'no_show') AS no_show,
                COALESCE(SUM(doctor_profiles.consultation_fee) FILTER (WHERE appointments.status = 'completed'), 0) AS revenue
            ")
            ->groupBy('clinics.id', 'clinics.name')
            ->orderByDesc('scheduled')
            ->limit(10)
            ->get();

        return $rows->map(fn ($row): array => [
            'clinic_id' => $row->clinic_id,
            'clinic_name' => $row->clinic_name,
            'scheduled' => (int) $row->scheduled,
            'arrived' => (int) $row->arrived,
            'completed' => (int) $row->completed,
            'no_show' => (int) $row->no_show,
            'revenue' => (float) $row->revenue,
        ])->all();
    }

    /**
     * Cross-tenant alerts surfaced on the dashboard. Each item carries an
     * `href` the dashboard can use to drill into the offending clinic.
     *
     * @return array<int, array{kind: string, tone: string, title: string, description: string, href: string|null, clinic_id: string|null}>
     */
    public function alerts(): array
    {
        $alerts = [];

        $lowInventory = DB::table('inventory')
            ->join('clinics', 'clinics.id', '=', 'inventory.clinic_id')
            ->whereNull('inventory.deleted_at')
            ->whereColumn('inventory.quantity_in_stock', '<=', 'inventory.min_stock_level')
            ->where('inventory.is_active', true)
            ->orderBy('inventory.quantity_in_stock')
            ->limit(3)
            ->get([
                'inventory.id',
                'inventory.item_name',
                'inventory.quantity_in_stock',
                'inventory.min_stock_level',
                'inventory.clinic_id',
                'clinics.name AS clinic_name',
            ]);

        foreach ($lowInventory as $item) {
            $alerts[] = [
                'kind' => 'low_inventory',
                'tone' => 'danger',
                'title' => "{$item->item_name} — low stock",
                'description' => "{$item->quantity_in_stock} left · {$item->clinic_name} · threshold {$item->min_stock_level}",
                'href' => route('super-admin.clinics.show', [
                    'locale' => app()->getLocale(),
                    'clinic' => $item->clinic_id,
                ]),
                'clinic_id' => $item->clinic_id,
            ];
        }

        $overdue = DB::table('invoices')
            ->join('clinics', 'clinics.id', '=', 'invoices.clinic_id')
            ->whereNull('invoices.deleted_at')
            ->whereIn('invoices.status', ['pending', 'partially_paid', 'overdue'])
            ->whereDate('invoices.due_date', '<', CarbonImmutable::today())
            ->selectRaw('
                invoices.clinic_id,
                clinics.name AS clinic_name,
                COUNT(*) AS overdue_count,
                COALESCE(SUM(invoices.total - invoices.paid_amount), 0) AS overdue_amount
            ')
            ->groupBy('invoices.clinic_id', 'clinics.name')
            ->orderByDesc('overdue_amount')
            ->limit(3)
            ->get();

        $currency = (string) config('billing.currency', 'MAD');
        foreach ($overdue as $row) {
            $alerts[] = [
                'kind' => 'overdue_invoices',
                'tone' => 'warning',
                'title' => "Overdue invoices · {$row->clinic_name}",
                'description' => "{$row->overdue_count} invoices · ".number_format((float) $row->overdue_amount, 0, '.', ',')." {$currency}",
                'href' => route('super-admin.clinics.show', [
                    'locale' => app()->getLocale(),
                    'clinic' => $row->clinic_id,
                ]),
                'clinic_id' => $row->clinic_id,
            ];
        }

        $pendingInvites = DB::table('users')
            ->join('clinics', 'clinics.id', '=', 'users.clinic_id')
            ->whereNull('users.deleted_at')
            ->whereIn('users.role', ['doctor', 'secretary'])
            ->where('users.email_verified', false)
            ->where('users.created_at', '<', CarbonImmutable::now()->subDays(5))
            ->orderByDesc('users.created_at')
            ->limit(3)
            ->get([
                'users.id',
                'users.first_name',
                'users.last_name',
                'users.created_at',
                'users.clinic_id',
                'clinics.name AS clinic_name',
            ]);

        foreach ($pendingInvites as $u) {
            $daysAgo = CarbonImmutable::parse($u->created_at)->diffInDays(CarbonImmutable::now());
            $alerts[] = [
                'kind' => 'pending_invite',
                'tone' => 'info',
                'title' => 'Pending staff invitation',
                'description' => trim(($u->first_name ?? '').' '.($u->last_name ?? ''))." · {$u->clinic_name} · {$daysAgo} days",
                'href' => route('super-admin.clinics.show', [
                    'locale' => app()->getLocale(),
                    'clinic' => $u->clinic_id,
                ]),
                'clinic_id' => $u->clinic_id,
            ];
        }

        return $alerts;
    }

    /**
     * Most recent N activity_log rows with eager-loaded clinic and actor. Used
     * by the dashboard activity feed widget; the full audit view uses
     * `ActivityLogController` directly.
     *
     * @return array<int, array<string, mixed>>
     */
    public function recentActivity(int $limit = 10): array
    {
        return ActivityLog::query()
            ->with([
                'clinic:id,name',
                'user:id,first_name,last_name,role',
            ])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (ActivityLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'description' => $log->description,
                'created_at' => $log->created_at?->toIso8601String(),
                'clinic' => $log->clinic ? [
                    'id' => $log->clinic->id,
                    'name' => $log->clinic->name,
                ] : null,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => trim(($log->user->first_name ?? '').' '.($log->user->last_name ?? '')),
                    'role' => $log->user->role,
                ] : null,
            ])
            ->all();
    }
}
