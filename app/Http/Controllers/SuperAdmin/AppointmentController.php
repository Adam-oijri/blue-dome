<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Concerns\ExportsCsv;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Clinic;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AppointmentController extends Controller
{
    use ExportsCsv;

    public function index(Request $request): Response
    {
        $appointments = $this->filteredQuery($request)
            ->orderByDesc('appointment_day')
            ->orderByDesc('scheduled_start')
            ->paginate(25)
            ->withQueryString();

        $clinicId = $request->string('clinic_id')->toString();
        $from = $request->date('from');
        $to = $request->date('to');

        // KPIs scoped to the current filter for context
        $kpiBase = Appointment::query();
        if ($clinicId !== '') {
            $kpiBase->where('clinic_id', $clinicId);
        }
        if ($from !== null) {
            $kpiBase->whereDate('appointment_day', '>=', $from);
        }
        if ($to !== null) {
            $kpiBase->whereDate('appointment_day', '<=', $to);
        }

        return Inertia::render('panels/super-admin/appointments', [
            'appointments' => $appointments,
            'clinics' => Clinic::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->all(),
            'filters' => [
                'status' => $request->string('status')->toString(),
                'clinic_id' => $clinicId,
                'from' => $from?->toDateString(),
                'to' => $to?->toDateString(),
            ],
            'kpis' => [
                'total' => (clone $kpiBase)->count(),
                'completed' => (clone $kpiBase)->where('status', 'completed')->count(),
                'cancelled' => (clone $kpiBase)->where('status', 'cancelled')->count(),
                'no_show' => (clone $kpiBase)->where('status', 'no_show')->count(),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->streamCsv(
            $this->filteredQuery($request)->orderByDesc('appointment_day')->orderByDesc('scheduled_start'),
            'appointments-'.now()->format('Y-m-d').'.csv',
            ['Day', 'Start', 'Status', 'Type', 'Clinic', 'Patient', 'Doctor'],
            fn (Appointment $a) => [
                $a->appointment_day,
                $a->scheduled_start,
                $a->status,
                $a->type,
                $a->clinic?->name ?? '',
                trim(($a->patient?->first_name ?? '').' '.($a->patient?->last_name ?? '')),
                trim(($a->doctor?->first_name ?? '').' '.($a->doctor?->last_name ?? '')),
            ],
        );
    }

    protected function filteredQuery(Request $request): Builder
    {
        $status = $request->string('status')->toString();
        $clinicId = $request->string('clinic_id')->toString();
        $from = $request->date('from');
        $to = $request->date('to');

        $query = Appointment::query()->with([
            'clinic:id,name',
            'patient:id,first_name,last_name',
            'doctor:id,first_name,last_name',
        ]);

        if ($status !== '' && in_array($status, [
            'scheduled', 'confirmed', 'arrived', 'in_progress',
            'completed', 'cancelled', 'no_show', 'rescheduled',
        ], true)) {
            $query->where('status', $status);
        }

        if ($clinicId !== '') {
            $query->where('clinic_id', $clinicId);
        }

        if ($from !== null) {
            $query->whereDate('appointment_day', '>=', $from);
        }

        if ($to !== null) {
            $query->whereDate('appointment_day', '<=', $to);
        }

        return $query;
    }
}
