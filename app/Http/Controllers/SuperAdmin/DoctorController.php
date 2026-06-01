<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Concerns\ExportsCsv;
use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\DoctorProfile;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DoctorController extends Controller
{
    use ExportsCsv;

    public function index(Request $request): Response
    {
        $doctors = $this->filteredQuery($request)
            ->orderByDesc('completed_count')
            ->paginate(25)
            ->withQueryString();

        $since = CarbonImmutable::now()->subDays(30);

        $totalDoctors = User::query()->where('role', 'doctor')->count();
        $activeDoctors = User::query()->where('role', 'doctor')->where('is_active', true)->count();
        $totalCompleted = (int) DB::table('appointments')
            ->whereNull('deleted_at')
            ->where('status', 'completed')
            ->where('created_at', '>=', $since)
            ->whereNotNull('doctor_id')
            ->count();
        $avgFee = (float) DoctorProfile::query()->avg('consultation_fee');

        $specialties = DoctorProfile::query()
            ->whereNotNull('specialty')
            ->orderBy('specialty')
            ->distinct()
            ->pluck('specialty')
            ->all();

        return Inertia::render('panels/super-admin/doctors', [
            'doctors' => $doctors,
            'clinics' => Clinic::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->all(),
            'specialties' => $specialties,
            'filters' => [
                'clinic_id' => $request->string('clinic_id')->toString(),
                'specialty' => $request->string('specialty')->toString(),
                'search' => $request->string('search')->toString(),
            ],
            'kpis' => [
                'total' => $totalDoctors,
                'active' => $activeDoctors,
                'completed_30d' => $totalCompleted,
                'avg_fee' => $avgFee,
                'currency' => (string) config('billing.currency', 'MAD'),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->streamCsv(
            $this->filteredQuery($request)->orderBy('users.id'),
            'doctors-'.now()->format('Y-m-d').'.csv',
            ['Name', 'Email', 'Specialty', 'Clinic', 'Completed (30d)', 'Scheduled (30d)', 'Consultation fee', 'Active'],
            fn (User $d) => [
                trim(($d->first_name ?? '').' '.($d->last_name ?? '')),
                $d->email,
                $d->specialty ?? '',
                $d->clinic?->name ?? '',
                $d->completed_count,
                $d->scheduled_count,
                $d->consultation_fee ?? '',
                $d->is_active ? 'yes' : 'no',
            ],
        );
    }

    protected function filteredQuery(Request $request): Builder
    {
        $clinicId = $request->string('clinic_id')->toString();
        $specialty = $request->string('specialty')->toString();
        $search = $request->string('search')->toString();

        $since = CarbonImmutable::now()->subDays(30);

        $query = User::query()
            ->where('role', 'doctor')
            ->with('clinic:id,name')
            ->leftJoin('doctor_profiles', 'doctor_profiles.user_id', '=', 'users.id')
            ->select([
                'users.id',
                'users.clinic_id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'users.is_active',
                'users.last_login_at',
                'users.created_at',
                'doctor_profiles.specialty as specialty',
                'doctor_profiles.consultation_fee as consultation_fee',
            ])
            ->selectSub(
                fn ($q) => $q
                    ->from('appointments')
                    ->whereColumn('appointments.doctor_id', 'users.id')
                    ->whereNull('appointments.deleted_at')
                    ->where('appointments.status', 'completed')
                    ->where('appointments.created_at', '>=', $since)
                    ->selectRaw('COUNT(*)'),
                'completed_count'
            )
            ->selectSub(
                fn ($q) => $q
                    ->from('appointments')
                    ->whereColumn('appointments.doctor_id', 'users.id')
                    ->whereNull('appointments.deleted_at')
                    ->where('appointments.created_at', '>=', $since)
                    ->selectRaw('COUNT(*)'),
                'scheduled_count'
            );

        if ($clinicId !== '') {
            $query->where('users.clinic_id', $clinicId);
        }

        if ($specialty !== '') {
            $query->where('doctor_profiles.specialty', $specialty);
        }

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like): void {
                $q->where('users.first_name', 'ilike', $like)
                    ->orWhere('users.last_name', 'ilike', $like)
                    ->orWhere('users.email', 'ilike', $like);
            });
        }

        return $query;
    }
}
