<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary patient directory — clinic-scoped roster with search, a chronic
 * filter, headline KPIs and per-patient last/next appointment lookups.
 */
class PatientsController extends Controller
{
    /** Appointments in these states don't count toward last-visit / next-appointment. */
    private const EXCLUDED_STATUSES = ['cancelled', 'no_show'];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $clinicId = $user->clinic_id;
        $now = CarbonImmutable::now();
        $monthStart = $now->startOfMonth();

        $search = trim((string) $request->string('q'));
        $filter = (string) $request->string('filter');

        $lastVisit = Appointment::query()
            ->selectRaw('MAX(scheduled_start)')
            ->whereColumn('patient_id', 'patients.id')
            ->whereColumn('clinic_id', 'patients.clinic_id')
            ->whereNotIn('status', self::EXCLUDED_STATUSES)
            ->where('scheduled_start', '<', $now);

        $nextAppt = Appointment::query()
            ->selectRaw('MIN(scheduled_start)')
            ->whereColumn('patient_id', 'patients.id')
            ->whereColumn('clinic_id', 'patients.clinic_id')
            ->whereNotIn('status', self::EXCLUDED_STATUSES)
            ->where('scheduled_start', '>=', $now);

        $patients = Patient::query()
            ->where('clinic_id', $clinicId)
            ->select([
                'id',
                'patient_code',
                'first_name',
                'last_name',
                'gender',
                'date_of_birth',
                'phone',
                'blood_type',
                'chronic_diseases',
                'insurance_company',
                'registration_date',
                'is_active',
            ])
            ->selectSub($lastVisit, 'last_visit')
            ->selectSub($nextAppt, 'next_appt')
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $sub) use ($search): void {
                    $sub->where('first_name', 'ILIKE', "%{$search}%")
                        ->orWhere('last_name', 'ILIKE', "%{$search}%");
                });
            })
            ->when($filter === 'chronic', function (Builder $query): void {
                $query->whereNotNull('chronic_diseases')
                    ->where('chronic_diseases', '<>', '');
            })
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->paginate(25)
            ->withQueryString();

        $clinicPatients = fn (): Builder => Patient::query()->where('clinic_id', $clinicId);

        return Inertia::render('panels/secretary/patients', [
            'patients' => $patients,
            'kpis' => [
                'total' => $clinicPatients()->count(),
                'chronic' => $clinicPatients()
                    ->whereNotNull('chronic_diseases')
                    ->where('chronic_diseases', '<>', '')
                    ->count(),
                'new_this_month' => $clinicPatients()
                    ->where('registration_date', '>=', $monthStart->toDateString())
                    ->count(),
            ],
            'filters' => [
                'q' => $search !== '' ? $search : null,
                'filter' => $filter !== '' ? $filter : null,
            ],
        ]);
    }
}
