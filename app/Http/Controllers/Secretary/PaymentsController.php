<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary payments ledger — clinic-scoped recent payments with collection
 * KPIs (today / week / month / average) and a 30-day payment-method
 * breakdown. Read-only list; recording happens through the invoice flow.
 */
class PaymentsController extends Controller
{
    private const COLLECTED = ['completed'];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $clinicId = $user->clinic_id;
        $today = CarbonImmutable::today();

        $collected = fn () => Payment::query()
            ->where('clinic_id', $clinicId)
            ->whereIn('payment_status', self::COLLECTED);

        $sumSince = fn (CarbonImmutable $from): float => (float) $collected()
            ->where('payment_date', '>=', $from->toDateString())
            ->sum('amount');

        $monthStart = $today->startOfMonth();
        $monthSum = $sumSince($monthStart);
        $monthCount = $collected()->where('payment_date', '>=', $monthStart->toDateString())->count();

        $breakdown = $collected()
            ->where('payment_date', '>=', $today->subDays(30)->toDateString())
            ->select('payment_method', DB::raw('SUM(amount) AS amount'), DB::raw('COUNT(*) AS count'))
            ->groupBy('payment_method')
            ->orderByDesc('amount')
            ->get()
            ->map(fn ($row): array => [
                'method' => $row->payment_method,
                'amount' => (float) $row->amount,
                'count' => (int) $row->count,
            ])
            ->all();

        return Inertia::render('panels/secretary/payments', [
            'payments' => Payment::query()
                ->where('clinic_id', $clinicId)
                ->with(['patient:id,first_name,last_name', 'invoice:id,invoice_number'])
                ->orderByDesc('payment_date')
                ->orderByDesc('created_at')
                ->paginate(25)
                ->withQueryString(),
            'kpis' => [
                'today' => $sumSince($today),
                'week' => $sumSince($today->startOfWeek()),
                'month' => $monthSum,
                'avg' => $monthCount > 0 ? round($monthSum / $monthCount, 2) : 0.0,
                'currency' => $user->clinic->currency ?? 'MAD',
            ],
            'method_breakdown' => $breakdown,
        ]);
    }
}
