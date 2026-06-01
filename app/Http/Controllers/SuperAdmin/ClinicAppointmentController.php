<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointment\CancelAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentRequest;
use App\Http\Requests\SuperAdmin\Appointment\StoreAppointmentRequest;
use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Clinic-scoped appointment management for the super-admin panel (distinct from
 * the cross-tenant oversight AppointmentController). The {clinic} route binding
 * is the target clinic; the doctor must belong to it.
 */
class ClinicAppointmentController extends Controller
{
    public function index(Request $request, string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('viewAny', Appointment::class);

        $query = Appointment::query()
            ->where('clinic_id', $clinic->id)
            ->select(['id', 'clinic_id', 'patient_id', 'doctor_id', 'appointment_number', 'scheduled_start', 'scheduled_end', 'appointment_day', 'status', 'type'])
            ->with([
                'patient:id,first_name,last_name',
                'doctor:id,first_name,last_name',
            ])
            ->latest('scheduled_start');

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        return Inertia::render('panels/super-admin/clinics/appointments/index', [
            'clinic' => $clinic->only(['id', 'name']),
            'appointments' => $query->paginate(25)->withQueryString(),
            'filters' => ['status' => $status ?: null],
        ]);
    }

    public function create(string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('create', Appointment::class);

        return Inertia::render('panels/super-admin/clinics/appointments/edit', [
            'clinic' => $clinic->only(['id', 'name']),
            'appointment' => null,
            'doctors' => $this->doctors($clinic),
            'patients' => $this->patients($clinic),
        ]);
    }

    public function store(StoreAppointmentRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);

        Appointment::create($request->validated() + ['clinic_id' => $clinic->id]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('appointments.scheduled')]);

        return to_route('super-admin.clinics.appointments.index', ['clinic' => $clinic->id]);
    }

    public function edit(string $locale, Clinic $clinic, Appointment $appointment): Response
    {
        unset($locale);
        abort_unless($appointment->clinic_id === $clinic->id, 404);
        $this->authorize('update', $appointment);

        return Inertia::render('panels/super-admin/clinics/appointments/edit', [
            'clinic' => $clinic->only(['id', 'name']),
            'appointment' => $appointment->only(['id', 'patient_id', 'doctor_id', 'scheduled_start', 'scheduled_end', 'status', 'type', 'priority', 'reason']),
            'doctors' => $this->doctors($clinic),
            'patients' => $this->patients($clinic),
        ]);
    }

    public function update(UpdateAppointmentRequest $request, string $locale, Clinic $clinic, Appointment $appointment): RedirectResponse
    {
        unset($locale);
        abort_unless($appointment->clinic_id === $clinic->id, 404);

        $appointment->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('appointments.updated')]);

        return to_route('super-admin.clinics.appointments.index', ['clinic' => $clinic->id]);
    }

    public function destroy(string $locale, Clinic $clinic, Appointment $appointment): RedirectResponse
    {
        unset($locale);
        abort_unless($appointment->clinic_id === $clinic->id, 404);
        $this->authorize('delete', $appointment);

        $appointment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('appointments.deleted')]);

        return back();
    }

    public function cancel(CancelAppointmentRequest $request, string $locale, Clinic $clinic, Appointment $appointment): RedirectResponse
    {
        unset($locale);
        abort_unless($appointment->clinic_id === $clinic->id, 404);

        $appointment->forceFill([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => $request->user()->id,
            'cancelled_reason' => $request->string('cancelled_reason')->toString(),
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('appointments.cancelled')]);

        return back();
    }

    /**
     * @return Collection<int, User>
     */
    private function doctors(Clinic $clinic)
    {
        return User::query()
            ->where('clinic_id', $clinic->id)
            ->where('role', 'doctor')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);
    }

    /**
     * @return Collection<int, Patient>
     */
    private function patients(Clinic $clinic)
    {
        return Patient::query()
            ->where('clinic_id', $clinic->id)
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'patient_code']);
    }
}
