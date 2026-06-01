<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Patient;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary branches overview — clinic-scoped list of the clinic's branches
 * with per-branch staff, patient and today's-appointment counts plus
 * clinic-wide totals for the header.
 *
 * Per-branch counts come from three grouped aggregate queries (one per source
 * table) instead of four queries per branch, so cost is constant in branch
 * count.
 */
class BranchesController extends Controller
{
    private const INACTIVE_STATUSES = ['cancelled', 'no_show'];

    public function index(Request $request): Response
    {
        $clinicId = $request->user()->clinic_id;
        $today = CarbonImmutable::today();

        $branches = Branch::query()
            ->where('clinic_id', $clinicId)
            ->orderByDesc('is_main')
            ->orderBy('branch_name')
            ->get(['id', 'branch_name', 'branch_code', 'is_main', 'phone', 'address', 'city', 'working_hours', 'is_active']);

        // One query each: staff/doctor headcounts, patient counts, today's
        // appointment counts — all grouped by branch and clinic-scoped.
        $staff = User::query()
            ->where('clinic_id', $clinicId)
            ->whereNotNull('primary_branch_id')
            ->selectRaw("primary_branch_id, COUNT(*) AS total, COUNT(*) FILTER (WHERE role = 'doctor') AS doctors")
            ->groupBy('primary_branch_id')
            ->get()
            ->keyBy('primary_branch_id');

        $patientCounts = Patient::query()
            ->where('clinic_id', $clinicId)
            ->whereNotNull('branch_id')
            ->selectRaw('branch_id, COUNT(*) AS total')
            ->groupBy('branch_id')
            ->pluck('total', 'branch_id');

        $appointmentCounts = Appointment::query()
            ->where('clinic_id', $clinicId)
            ->whereDate('appointment_day', $today)
            ->whereNotIn('status', self::INACTIVE_STATUSES)
            ->whereNotNull('branch_id')
            ->selectRaw('branch_id, COUNT(*) AS total')
            ->groupBy('branch_id')
            ->pluck('total', 'branch_id');

        $rows = $branches->map(fn (Branch $branch): array => [
            'id' => $branch->id,
            'branch_name' => $branch->branch_name,
            'branch_code' => $branch->branch_code,
            'is_main' => $branch->is_main,
            'phone' => $branch->phone,
            'address' => $branch->address,
            'city' => $branch->city,
            'working_hours' => $branch->working_hours ?? [],
            'is_active' => $branch->is_active,
            'doctors' => (int) ($staff[$branch->id]->doctors ?? 0),
            'staff' => (int) ($staff[$branch->id]->total ?? 0),
            'patients' => (int) ($patientCounts[$branch->id] ?? 0),
            'today_appts' => (int) ($appointmentCounts[$branch->id] ?? 0),
        ])->all();

        $totals = [
            'locations' => count($rows),
            'doctors' => array_sum(array_column($rows, 'doctors')),
            'staff' => array_sum(array_column($rows, 'staff')),
            'today_appts' => array_sum(array_column($rows, 'today_appts')),
        ];

        return Inertia::render('panels/secretary/branches', [
            'branches' => $rows,
            'totals' => $totals,
        ]);
    }
}
