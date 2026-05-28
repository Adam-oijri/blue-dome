<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\StoreVitalSignsRequest;
use App\Models\Patient;
use App\Models\VitalSigns;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VitalSignsController extends Controller
{
    public function index(string $locale, Patient $patient): Response
    {
        unset($locale);
        $this->authorize('view', $patient);

        return Inertia::render('patients/vital-signs', [
            'patient' => $patient->only(['id', 'first_name', 'last_name', 'patient_code']),
            'vital_signs' => $patient->vitalSigns()
                ->latest('recorded_at')
                ->paginate(25),
        ]);
    }

    public function store(StoreVitalSignsRequest $request, string $locale, Patient $patient): RedirectResponse
    {
        unset($locale);
        VitalSigns::create([
            ...$request->validated(),
            'clinic_id' => $patient->clinic_id,
            'patient_id' => $patient->id,
            'recorded_by' => $request->user()->id,
            'recorded_at' => $request->input('recorded_at', now()),
        ]);

        return redirect()
            ->route('patients.show', $patient)
            ->with('toast', ['type' => 'success', 'message' => __('patients.vitals_recorded')]);
    }
}
