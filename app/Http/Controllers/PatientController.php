<?php

namespace App\Http\Controllers;

use App\Http\Requests\Patient\StorePatientRequest;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Models\FieldChange;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Patient::class);

        $query = Patient::query()
            ->select(['id', 'clinic_id', 'patient_code', 'first_name', 'last_name', 'phone', 'phone_e164', 'date_of_birth', 'gender', 'is_active', 'registration_date'])
            ->with([
                'communicationPreferences:patient_id,preferred_channel,language',
                'clinic:id,name',
            ])
            ->latest('registration_date');

        // Phase 8 (global-patient-access): the prior defense-in-depth filter
        // scoping by actor->clinic_id is intentionally removed. RLS on
        // `patients` was disabled by migration
        // `2026_05_22_000010_disable_rls_on_clinical_tables` so every staff
        // role can list patients across the platform; the origin clinic is
        // surfaced via the eager-loaded `clinic` relation. Callers can scope
        // back down by passing `?origin_clinic=<uuid>`.
        if ($originClinic = $request->string('origin_clinic')->trim()->toString()) {
            $query->where('clinic_id', $originClinic);
        }

        if ($search = $request->string('q')->trim()->toString()) {
            $query->whereRaw('(first_name || \' \' || last_name) ILIKE ?', ['%'.$search.'%']);
        }

        return Inertia::render('patients/index', [
            'patients' => $query->paginate(25)->withQueryString(),
            'filters' => [
                'q' => $search ?: null,
                'origin_clinic' => $originClinic ?: null,
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Patient::class);

        return Inertia::render('patients/create');
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $patient = Patient::create($request->validated() + [
            'clinic_id' => $request->user()->clinic_id,
        ]);

        return redirect()
            ->route('patients.show', $patient)
            ->with('toast', ['type' => 'success', 'message' => __('patients.created')]);
    }

    public function show(string $locale, Patient $patient): Response
    {
        unset($locale);
        $this->authorize('view', $patient);

        $patient->load([
            'communicationPreferences',
            'branch:id,branch_name',
            'createdBy:id,first_name,last_name',
            'clinic:id,name',
        ]);

        return Inertia::render('patients/show', [
            'patient' => $patient,
            'national_id' => $patient->national_id,
            'insurance_number' => $patient->insurance_number,
            'vital_signs' => Inertia::defer(
                fn () => $patient->vitalSigns()
                    ->latest('recorded_at')
                    ->limit(10)
                    ->get(['id', 'recorded_at', 'temperature_c', 'blood_pressure_sys', 'blood_pressure_dia', 'heart_rate', 'oxygen_saturation', 'weight_kg', 'height_cm', 'bmi', 'pain_score'])
            ),
            'provenance' => Inertia::defer(
                fn () => FieldChange::recentForEntity('Patient', $patient->id, 100)
                    ->with([
                        'changedByUser:id,first_name,last_name',
                        'changedByClinic:id,name',
                    ])
                    ->get()
            ),
        ]);
    }

    public function edit(string $locale, Patient $patient): Response
    {
        unset($locale);
        $this->authorize('update', $patient);

        $patient->load('communicationPreferences');

        return Inertia::render('patients/edit', [
            'patient' => $patient,
            'national_id' => $patient->national_id,
            'insurance_number' => $patient->insurance_number,
        ]);
    }

    public function update(UpdatePatientRequest $request, string $locale, Patient $patient): RedirectResponse
    {
        unset($locale);
        $patient->update($request->validated());

        return redirect()
            ->route('patients.show', $patient)
            ->with('toast', ['type' => 'success', 'message' => __('patients.updated')]);
    }

    public function destroy(string $locale, Patient $patient): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $patient);

        $patient->delete();

        return redirect()
            ->route('patients.index')
            ->with('toast', ['type' => 'success', 'message' => __('patients.deleted')]);
    }
}
