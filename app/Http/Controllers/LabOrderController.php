<?php

namespace App\Http\Controllers;

use App\Http\Requests\LabOrder\RecordResultsRequest;
use App\Http\Requests\LabOrder\StoreLabOrderRequest;
use App\Http\Requests\LabOrder\UpdateLabOrderRequest;
use App\Models\ExternalLab;
use App\Models\FieldChange;
use App\Models\LabOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LabOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', LabOrder::class);

        $query = LabOrder::query()
            ->select(['id', 'clinic_id', 'lab_order_number', 'patient_id', 'doctor_id', 'order_date', 'status', 'urgency'])
            ->with([
                'patient:id,first_name,last_name,patient_code',
                'doctor:id,first_name,last_name',
            ])
            ->latest('order_date');

        if ($request->user()->role !== 'super_admin') {
            $query->where('clinic_id', $request->user()->clinic_id);
        }

        if ($patientId = $request->string('patient_id')->trim()->toString()) {
            $query->where('patient_id', $patientId);
        }

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        return Inertia::render('lab-orders/index', [
            'lab_orders' => $query->paginate(25)->withQueryString(),
            'filters' => [
                'patient_id' => $patientId ?: null,
                'status' => $status ?: null,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', LabOrder::class);

        return Inertia::render('lab-orders/create', [
            'external_labs' => ExternalLab::query()
                ->where('clinic_id', $request->user()->clinic_id)
                ->where('is_active', true)
                ->get(['id', 'lab_name']),
        ]);
    }

    public function store(StoreLabOrderRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $items = $validated['items'];
        unset($validated['items']);

        $labOrder = DB::transaction(function () use ($request, $validated, $items): LabOrder {
            $labOrder = LabOrder::create($validated + [
                'clinic_id' => $request->user()->clinic_id,
                'doctor_id' => $request->user()->id,
            ]);

            foreach ($items as $item) {
                $labOrder->items()->create($item);
            }

            return $labOrder;
        });

        return redirect()
            ->route('lab-orders.show', $labOrder)
            ->with('toast', ['type' => 'success', 'message' => __('lab_orders.created')]);
    }

    public function show(string $locale, LabOrder $labOrder): Response
    {
        unset($locale);
        $this->authorize('view', $labOrder);

        $labOrder->load([
            'patient:id,first_name,last_name,patient_code,date_of_birth',
            'doctor:id,first_name,last_name',
            'externalLab:id,lab_name,phone,email',
            'items',
            'reviewedBy:id,first_name,last_name',
            'clinic:id,name',
        ]);

        return Inertia::render('lab-orders/show', [
            'lab_order' => $labOrder,
            'provenance' => Inertia::defer(
                fn () => FieldChange::recentForEntity('LabOrder', $labOrder->id, 100)
                    ->with([
                        'changedByUser:id,first_name,last_name',
                        'changedByClinic:id,name',
                    ])
                    ->get()
            ),
        ]);
    }

    public function edit(string $locale, LabOrder $labOrder): Response
    {
        unset($locale);
        $this->authorize('update', $labOrder);

        $labOrder->load(['items', 'externalLab:id,lab_name']);

        return Inertia::render('lab-orders/edit', [
            'lab_order' => $labOrder,
        ]);
    }

    public function update(UpdateLabOrderRequest $request, string $locale, LabOrder $labOrder): RedirectResponse
    {
        unset($locale);
        $labOrder->update($request->validated());

        return redirect()
            ->route('lab-orders.show', $labOrder)
            ->with('toast', ['type' => 'success', 'message' => __('lab_orders.updated')]);
    }

    public function destroy(string $locale, LabOrder $labOrder): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $labOrder);

        $labOrder->delete();

        return redirect()
            ->route('lab-orders.index')
            ->with('toast', ['type' => 'success', 'message' => __('lab_orders.deleted')]);
    }

    public function recordResults(RecordResultsRequest $request, string $locale, LabOrder $labOrder): RedirectResponse
    {
        unset($locale);
        $items = $request->validated()['items'];

        DB::transaction(function () use ($labOrder, $items, $request): void {
            foreach ($items as $item) {
                $id = $item['id'];
                unset($item['id']);

                $labOrder->items()
                    ->whereKey($id)
                    ->update($item + ['reviewed_by' => $request->user()->id]);
            }

            $hasAllResults = $labOrder->items()
                ->whereNull('result')
                ->doesntExist();

            $labOrder->forceFill([
                'status' => $hasAllResults ? 'completed' : 'partially_completed',
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'completed_at' => $hasAllResults ? now() : null,
            ])->save();
        });

        return redirect()
            ->route('lab-orders.show', $labOrder)
            ->with('toast', ['type' => 'success', 'message' => __('lab_orders.results_recorded')]);
    }
}
