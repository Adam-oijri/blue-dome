<?php

namespace App\Http\Controllers;

use App\Http\Requests\Prescription\StorePrescriptionRequest;
use App\Http\Requests\Prescription\UpdatePrescriptionRequest;
use App\Models\FieldChange;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    /**
     * Minimum pg_trgm similarity for a typed medication name to be treated as a
     * typo of an existing catalog entry rather than a new medication. Kept
     * conservative — a wrong fuzzy match would link the wrong drug.
     */
    private const MEDICATION_SIMILARITY_THRESHOLD = 0.4;

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

        $clinicId = $request->user()->clinic_id;

        // Autocomplete pool for the free-text medication field: the clinic's
        // catalog plus every medication name previously typed on a prescription.
        $medicationSuggestions = Medication::query()
            ->where('clinic_id', $clinicId)
            ->where('is_active', true)
            ->pluck('trade_name')
            ->merge(
                PrescriptionItem::query()
                    ->whereNotNull('medication_name')
                    ->whereHas('prescription', fn ($q) => $q->where('clinic_id', $clinicId))
                    ->distinct()
                    ->pluck('medication_name')
            )
            ->filter()
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('prescriptions/index', [
            'prescriptions' => $query->paginate(25)->withQueryString(),
            'filters' => ['patient_id' => $patientId ?: null],
            'patients' => Patient::query()
                ->where('clinic_id', $clinicId)
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'patient_code']),
            'medicationSuggestions' => $medicationSuggestions,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Prescription::class);

        return Inertia::render('prescriptions/create', [
            'patients' => Patient::query()
                ->where('clinic_id', $request->user()->clinic_id)
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'patient_code']),
            'medications' => Medication::query()
                ->where('clinic_id', $request->user()->clinic_id)
                ->where('is_active', true)
                ->orderBy('trade_name')
                ->get(['id', 'trade_name', 'generic_name', 'strength', 'form']),
        ]);
    }

    public function store(StorePrescriptionRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $items = $validated['items'];
        unset($validated['items']);
        $clinicId = $request->user()->clinic_id;

        DB::transaction(function () use ($request, $validated, $items, $clinicId): void {
            // Resolve each item to a catalog medication, creating it on the fly
            // when the doctor typed a new free-text name.
            $items = array_map(function (array $item) use ($clinicId): array {
                $item['medication_id'] = $this->resolveMedicationId($item, $clinicId);
                unset($item['medication_name']);

                return $item;
            }, $items);

            $this->assertNoMajorInteraction($items);

            $prescription = Prescription::create($validated + [
                'clinic_id' => $clinicId,
                'doctor_id' => $request->user()->id,
            ]);

            foreach ($items as $item) {
                $prescription->items()->create($item);
            }
        });

        return back()
            ->with('toast', ['type' => 'success', 'message' => __('prescriptions.created')]);
    }

    /**
     * Resolve a prescription item to a catalog medication id, creating the
     * medication in the clinic's formulary on the fly when the doctor typed a
     * new free-text name (matched case-sensitively by trade name).
     *
     * @param  array<string, mixed>  $item
     */
    private function resolveMedicationId(array $item, string $clinicId): string
    {
        if (! empty($item['medication_id'])) {
            return $item['medication_id'];
        }

        $name = trim((string) ($item['medication_name'] ?? ''));

        $exact = Medication::query()
            ->where('clinic_id', $clinicId)
            ->whereRaw('lower(trade_name) = lower(?)', [$name])
            ->orderBy('created_at')
            ->first();

        if ($exact !== null) {
            return $exact->id;
        }

        // No exact match — fall back to the closest trigram match above the
        // threshold so common typos resolve to the existing catalog entry
        // (pg_trgm index on `medications.trade_name`).
        $similar = Medication::query()
            ->where('clinic_id', $clinicId)
            ->whereRaw('similarity(lower(trade_name), lower(?)) >= ?', [$name, self::MEDICATION_SIMILARITY_THRESHOLD])
            ->orderByRaw('similarity(lower(trade_name), lower(?)) DESC', [$name])
            ->first();

        if ($similar !== null) {
            return $similar->id;
        }

        return Medication::create([
            'clinic_id' => $clinicId,
            'trade_name' => $name,
            'is_active' => true,
            'requires_prescription' => true,
        ])->id;
    }

    /**
     * Block the prescription when two of its medications have a known
     * major/moderate interaction. Runs after free-text names are resolved to
     * catalog ids, so typed-in medications are covered too.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    private function assertNoMajorInteraction(array $items): void
    {
        $medicationIds = array_values(array_unique(array_filter(
            array_map(static fn ($item) => $item['medication_id'] ?? null, $items)
        )));

        if (count($medicationIds) < 2) {
            return;
        }

        $placeholders = implode(',', array_fill(0, count($medicationIds), '?::uuid'));

        $interaction = DB::selectOne(
            "SELECT severity FROM drug_interactions
             WHERE medication_id_1 IN ($placeholders)
               AND medication_id_2 IN ($placeholders)
               AND severity IN ('major', 'moderate')
             ORDER BY CASE severity WHEN 'major' THEN 1 WHEN 'moderate' THEN 2 END
             LIMIT 1",
            array_merge($medicationIds, $medicationIds)
        );

        if ($interaction !== null) {
            throw ValidationException::withMessages([
                'items' => __('prescriptions.drug_interaction_'.$interaction->severity),
            ]);
        }
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
