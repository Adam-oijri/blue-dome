<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Http\Requests\SuperAdmin\Patient\StorePatientRequest;
use App\Models\Clinic;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Clinic-scoped patient management for the super-admin panel. The {clinic}
 * route binding is the target clinic for every write.
 */
class PatientController extends Controller
{
    public function index(Request $request, string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('viewAny', Patient::class);

        $query = Patient::query()
            ->where('clinic_id', $clinic->id)
            ->select(['id', 'clinic_id', 'patient_code', 'first_name', 'last_name', 'phone', 'date_of_birth', 'gender', 'is_active', 'registration_date'])
            ->latest('registration_date');

        if ($search = $request->string('q')->trim()->toString()) {
            $query->whereRaw('(first_name || \' \' || last_name) ILIKE ?', ['%'.$search.'%']);
        }

        return Inertia::render('panels/super-admin/clinics/patients/index', [
            'clinic' => $clinic->only(['id', 'name']),
            'patients' => $query->paginate(25)->withQueryString(),
            'filters' => ['q' => $search ?: null],
        ]);
    }

    public function create(string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('create', Patient::class);

        return Inertia::render('panels/super-admin/clinics/patients/edit', [
            'clinic' => $clinic->only(['id', 'name']),
            'patient' => null,
        ]);
    }

    public function store(StorePatientRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);

        Patient::create($request->validated() + ['clinic_id' => $clinic->id]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('patients.created')]);

        return to_route('super-admin.clinics.patients.index', ['clinic' => $clinic->id]);
    }

    public function edit(string $locale, Clinic $clinic, Patient $patient): Response
    {
        unset($locale);
        abort_unless($patient->clinic_id === $clinic->id, 404);
        $this->authorize('update', $patient);

        return Inertia::render('panels/super-admin/clinics/patients/edit', [
            'clinic' => $clinic->only(['id', 'name']),
            'patient' => $patient->only([
                'id', 'first_name', 'last_name', 'patient_code', 'date_of_birth', 'gender',
                'phone', 'phone_e164', 'email', 'national_id', 'blood_type', 'address',
                'city', 'notes', 'is_active',
            ]),
        ]);
    }

    public function update(UpdatePatientRequest $request, string $locale, Clinic $clinic, Patient $patient): RedirectResponse
    {
        unset($locale);
        abort_unless($patient->clinic_id === $clinic->id, 404);

        $patient->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('patients.updated')]);

        return to_route('super-admin.clinics.patients.index', ['clinic' => $clinic->id]);
    }

    public function destroy(string $locale, Clinic $clinic, Patient $patient): RedirectResponse
    {
        unset($locale);
        abort_unless($patient->clinic_id === $clinic->id, 404);
        $this->authorize('delete', $patient);

        $patient->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('patients.deleted')]);

        return back();
    }
}
