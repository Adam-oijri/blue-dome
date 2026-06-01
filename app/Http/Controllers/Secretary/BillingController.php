<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary billing — clinic-scoped invoice list with collection KPIs and a
 * receivables aging breakdown. Read-only; invoice creation and payment
 * recording happen through dedicated flows.
 */
class BillingController extends Controller
{
    private const STATUS_FILTERS = ['pending', 'overdue', 'paid', 'partially_paid'];

    private const OPEN_STATUSES = ['pending', 'partially_paid', 'overdue'];

    /**
     * Statuses that are NOT collectible receivables: unissued drafts and
     * settled/void invoices. Excluded from overdue / aging / outstanding so
     * those three figures reconcile.
     *
     * @var list<string>
     */
    private const NON_RECEIVABLE_STATUSES = ['draft', 'paid', 'cancelled', 'refunded'];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $clinicId = $user->clinic_id;
        $today = CarbonImmutable::today();

        $status = $request->query('status', 'all');

        if (! in_array($status, self::STATUS_FILTERS, true)) {
            $status = 'all';
        }

        $invoices = Invoice::query()
            ->where('clinic_id', $clinicId)
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->with('patient:id,first_name,last_name,gender,insurance_company')
            ->orderByDesc('invoice_date')
            ->paginate(25, [
                'id',
                'invoice_number',
                'patient_id',
                'invoice_date',
                'due_date',
                'total',
                'paid_amount',
                'balance_due',
                'status',
                'currency',
            ])
            ->withQueryString();

        return Inertia::render('panels/secretary/billing', [
            'invoices' => $invoices,
            'kpis' => $this->kpis($clinicId, $today),
            'aging' => $this->aging($clinicId, $today),
            'patients' => Patient::query()
                ->where('clinic_id', $clinicId)
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'last_name']),
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    /**
     * @return array{open: int, overdue: int, collected: float, outstanding: float}
     */
    private function kpis(string $clinicId, CarbonImmutable $today): array
    {
        $open = Invoice::query()
            ->where('clinic_id', $clinicId)
            ->whereIn('status', self::OPEN_STATUSES)
            ->count();

        // Overdue == issued, still-owing, past due-date. Defined identically to
        // the past-due aging buckets (non-terminal status, balance_due > 0,
        // due_date in the past) so the KPI reconciles with the aging panel and
        // never counts unissued drafts.
        $overdue = Invoice::query()
            ->where('clinic_id', $clinicId)
            ->whereNotIn('status', self::NON_RECEIVABLE_STATUSES)
            ->where('balance_due', '>', 0)
            ->where('due_date', '<', $today->toDateString())
            ->count();

        $collected = (float) Payment::query()
            ->where('clinic_id', $clinicId)
            ->where('payment_status', 'completed')
            ->where('payment_date', '>=', $today->startOfMonth()->toDateString())
            ->sum('amount');

        $outstanding = (float) Invoice::query()
            ->where('clinic_id', $clinicId)
            ->whereNotIn('status', self::NON_RECEIVABLE_STATUSES)
            ->sum('balance_due');

        return [
            'open' => $open,
            'overdue' => $overdue,
            'collected' => $collected,
            'outstanding' => $outstanding,
        ];
    }

    /**
     * Receivables aging: outstanding balance bucketed by how long the invoice
     * has been overdue. Bucketed in SQL with FILTER aggregates so a clinic with
     * many open invoices returns a single row instead of hydrating the full set.
     * The `key` is stable for the frontend to translate; `label` is a fallback.
     *
     * @return list<array{key: string, label: string, amount: float}>
     */
    private function aging(string $clinicId, CarbonImmutable $today): array
    {
        $date = $today->toDateString();

        $row = Invoice::query()
            ->where('clinic_id', $clinicId)
            ->whereNotIn('status', self::NON_RECEIVABLE_STATUSES)
            ->where('balance_due', '>', 0)
            ->selectRaw(
                'COALESCE(SUM(balance_due) FILTER (WHERE due_date IS NULL OR due_date >= ?), 0) AS current,'
                .' COALESCE(SUM(balance_due) FILTER (WHERE due_date < ? AND (?::date - due_date) <= 30), 0) AS d1_30,'
                .' COALESCE(SUM(balance_due) FILTER (WHERE due_date < ? AND (?::date - due_date) BETWEEN 31 AND 60), 0) AS d31_60,'
                .' COALESCE(SUM(balance_due) FILTER (WHERE due_date < ? AND (?::date - due_date) > 60), 0) AS d61_plus',
                [$date, $date, $date, $date, $date, $date, $date],
            )
            ->first();

        return [
            ['key' => 'current', 'label' => 'Current', 'amount' => (float) ($row->current ?? 0)],
            ['key' => '1-30', 'label' => '1-30 days', 'amount' => (float) ($row->d1_30 ?? 0)],
            ['key' => '31-60', 'label' => '31-60 days', 'amount' => (float) ($row->d31_60 ?? 0)],
            ['key' => '61+', 'label' => '61+ days', 'amount' => (float) ($row->d61_plus ?? 0)],
        ];
    }
}
