<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Services\SuperAdminMetricsService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function __construct(private readonly SuperAdminMetricsService $metrics) {}

    public function index(): Response
    {
        $today = CarbonImmutable::today();
        $since = CarbonImmutable::now()->subDays(30);
        $currency = (string) config('billing.currency', 'MAD');

        $overdueByClinic = DB::table('invoices')
            ->join('clinics', 'clinics.id', '=', 'invoices.clinic_id')
            ->whereNull('invoices.deleted_at')
            ->whereIn('invoices.status', ['pending', 'partially_paid', 'overdue'])
            ->whereDate('invoices.due_date', '<', $today)
            ->selectRaw('
                invoices.clinic_id,
                clinics.name AS clinic_name,
                COUNT(*) AS overdue_count,
                COALESCE(SUM(invoices.total - invoices.paid_amount), 0) AS overdue_amount
            ')
            ->groupBy('invoices.clinic_id', 'clinics.name')
            ->orderByDesc('overdue_amount')
            ->limit(10)
            ->get()
            ->map(fn ($row): array => [
                'clinic_id' => $row->clinic_id,
                'clinic_name' => $row->clinic_name,
                'overdue_count' => (int) $row->overdue_count,
                'overdue_amount' => (float) $row->overdue_amount,
            ])
            ->all();

        $overdueTotal = array_sum(array_column($overdueByClinic, 'overdue_amount'));

        $paymentMethods = DB::table('payments')
            ->whereNull('deleted_at')
            ->where('created_at', '>=', $since)
            ->selectRaw('payment_method, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount')
            ->groupBy('payment_method')
            ->orderByDesc('amount')
            ->get()
            ->map(fn ($row): array => [
                'method' => (string) $row->payment_method,
                'count' => (int) $row->count,
                'amount' => (float) $row->amount,
            ])
            ->all();

        return Inertia::render('panels/super-admin/finance', [
            'mrr' => $this->metrics->mrr(),
            'monthly_revenue' => $this->metrics->monthlyRevenue(),
            'top_clinics' => $this->metrics->topClinicsByRevenue(10),
            'total_revenue' => $this->metrics->totalRevenue(),
            'active_subscriptions' => $this->metrics->activeClinics(),
            'overdue_by_clinic' => $overdueByClinic,
            'overdue_total' => $overdueTotal,
            'payment_methods' => $paymentMethods,
            'currency' => $currency,
        ]);
    }
}
