<?php

namespace App\Http\Controllers;

use App\Http\Requests\Medication\StoreMedicationRequest;
use App\Http\Requests\Medication\UpdateMedicationRequest;
use App\Models\Medication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MedicationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Medication::class);

        $query = Medication::query()
            ->select(['id', 'clinic_id', 'trade_name', 'generic_name', 'form', 'strength', 'manufacturer', 'category', 'is_active', 'requires_prescription'])
            ->orderBy('trade_name');

        if ($request->user()->role !== 'super_admin') {
            $query->where('clinic_id', $request->user()->clinic_id);
        }

        if ($search = $request->string('q')->trim()->toString()) {
            // pg_trgm GIN index on trade_name powers fuzzy ILIKE matches.
            $query->where(function ($q) use ($search) {
                $q->where('trade_name', 'ILIKE', '%'.$search.'%')
                    ->orWhere('generic_name', 'ILIKE', '%'.$search.'%');
            });
        }

        return Inertia::render('medications/index', [
            'medications' => $query->paginate(25)->withQueryString(),
            'filters' => ['q' => $search ?: null],
        ]);
    }

    public function store(StoreMedicationRequest $request): RedirectResponse
    {
        Medication::create($request->validated() + [
            'clinic_id' => $request->user()->clinic_id,
        ]);

        return back()
            ->with('toast', ['type' => 'success', 'message' => __('medications.created')]);
    }

    public function show(string $locale, Medication $medication): Response
    {
        unset($locale);
        $this->authorize('view', $medication);

        return Inertia::render('medications/show', [
            'medication' => $medication,
        ]);
    }

    public function update(UpdateMedicationRequest $request, string $locale, Medication $medication): RedirectResponse
    {
        unset($locale);
        $medication->update($request->validated());

        // back() keeps the inline edit Sheet on the formulary index (the
        // standalone show page is a legacy unlinked fallback).
        return back()
            ->with('toast', ['type' => 'success', 'message' => __('medications.updated')]);
    }

    public function destroy(string $locale, Medication $medication): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $medication);

        $medication->delete();

        return redirect()
            ->route('medications.index')
            ->with('toast', ['type' => 'success', 'message' => __('medications.deleted')]);
    }
}
