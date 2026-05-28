<?php

namespace App\Http\Controllers;

use App\Http\Requests\Prescription\StorePrescriptionRequest;
use App\Http\Requests\Prescription\UpdatePrescriptionRequest;
use App\Models\FieldChange;
use App\Models\Prescription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Prescription::class);

        $query = Prescription::query()
            ->select(['id', 'clinic_id', 'prescription_number', 'patient_id', 'doctor_id', 'prescription_date', 'expiry_date', 'status'])
            ->with([
                'patient:id,first_name,last_name,patient_code',
                'doctor:id,first_name,last_name',
            ])
            ->latest('prescription_date');

        if ($request->user()->role !== 'super_admin') {
            $query->where('clinic_id', $request->user()->clinic_id);
        }

        if ($patientId = $request->string('patient_id')->trim()->toString()) {
            $query->where('patient_id', $patientId);
        }

        return Inertia::render('prescriptions/index', [
            'prescriptions' => $query->paginate(25)->withQueryString(),
            'filters' => ['patient_id' => $patientId ?: null],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Prescription::class);

        return Inertia::render('prescriptions/create');
    }

    public function store(StorePrescriptionRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $items = $validated['items'];
        unset($validated['items']);

        $prescription = DB::transaction(function () use ($request, $validated, $items): Prescription {
            $prescription = Prescription::create($validated + [
                'clinic_id' => $request->user()->clinic_id,
                'doctor_id' => $request->user()->id,
            ]);

            foreach ($items as $item) {
                $prescription->items()->create($item);
            }

            return $prescription;
        });

        return redirect()
            ->route('prescriptions.show', $prescription)
            ->with('toast', ['type' => 'success', 'message' => __('prescriptions.created')]);
    }

    public function show(string $locale, Prescription $prescription): Response
    {
        unset($locale);
        $this->authorize('view', $prescription);

        $prescription->load([
            'patient:id,first_name,last_name,patient_code,date_of_birth,phone_e164',
            'doctor:id,first_name,last_name',
            'appointment:id,scheduled_start,status',
            'items.medication:id,trade_name,generic_name,strength,form',
            'clinic:id,name',
        ]);

        return Inertia::render('prescriptions/show', [
            'prescription' => $prescription,
            'provenance' => Inertia::defer(
                fn () => FieldChange::recentForEntity('Prescription', $prescription->id, 100)
                    ->with([
                        'changedByUser:id,first_name,last_name',
                        'changedByClinic:id,name',
                    ])
                    ->get()
            ),
        ]);
    }

    public function edit(string $locale, Prescription $prescription): Response
    {
        unset($locale);
        $this->authorize('update', $prescription);

        $prescription->load(['items.medication:id,trade_name,strength,form']);

        return Inertia::render('prescriptions/edit', [
            'prescription' => $prescription,
        ]);
    }

    public function update(UpdatePrescriptionRequest $request, string $locale, Prescription $prescription): RedirectResponse
    {
        unset($locale);
        $prescription->update($request->validated());

        return redirect()
            ->route('prescriptions.show', $prescription)
            ->with('toast', ['type' => 'success', 'message' => __('prescriptions.updated')]);
    }

    public function destroy(string $locale, Prescription $prescription): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $prescription);

        $prescription->delete();

        return redirect()
            ->route('prescriptions.index')
            ->with('toast', ['type' => 'success', 'message' => __('prescriptions.deleted')]);
    }
}
