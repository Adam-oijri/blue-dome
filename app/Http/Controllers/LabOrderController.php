<?php

namespace App\Http\Controllers;

use App\Http\Requests\LabOrder\RecordResultsRequest;
use App\Http\Requests\LabOrder\StoreLabOrderRequest;
use App\Http\Requests\LabOrder\UpdateLabOrderRequest;
use App\Models\Document;
use App\Models\ExternalLab;
use App\Models\FieldChange;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LabOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', LabOrder::class);

        $user = $request->user();
        $isSuperAdmin = $user->role === 'super_admin';

        /** Scope every aggregate to the acting user's clinic (super-admin sees all). */
        $scopeClinic = function ($query) use ($isSuperAdmin, $user) {
            return $isSuperAdmin ? $query : $query->where('clinic_id', $user->clinic_id);
        };

        $query = LabOrder::query()
            ->select(['id', 'clinic_id', 'lab_order_number', 'patient_id', 'doctor_id', 'external_lab_id', 'order_date', 'status', 'urgency'])
            ->withCount([
                'items',
                'items as abnormal_count' => fn ($itemQuery) => $itemQuery->where('is_abnormal', true),
            ])
            ->with([
                'patient:id,first_name,last_name,patient_code',
                'doctor:id,first_name,last_name',
                'externalLab:id,lab_name',
            ])
            ->latest('order_date');

        $scopeClinic($query);

        if ($patientId = $request->string('patient_id')->trim()->toString()) {
            $query->where('patient_id', $patientId);
        }

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        // ->toBase(): a GROUP BY aggregate hydrated as an Eloquent model drops
        // the grouping column, so read plain stdClass rows.
        $statusCounts = $scopeClinic(LabOrder::query())
            ->select('status', DB::raw('COUNT(*) AS total'))
            ->groupBy('status')
            ->toBase()
            ->pluck('total', 'status');

        $criticalResults = LabOrderItem::query()
            ->where('is_critical', true)
            ->whereHas('labOrder', fn ($labOrderQuery) => $scopeClinic($labOrderQuery))
            ->with(['labOrder:id,patient_id', 'labOrder.patient:id,first_name,last_name'])
            ->orderByDesc('result_date')
            ->limit(8)
            ->get(['id', 'lab_order_id', 'test_name', 'result', 'unit', 'normal_range', 'is_critical', 'is_abnormal', 'result_date']);

        return Inertia::render('lab-orders/index', [
            'lab_orders' => $query->paginate(25)->withQueryString(),
            'patients' => Patient::query()
                ->where('clinic_id', $user->clinic_id)
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'patient_code']),
            'kpis' => [
                'pending' => (int) ($statusCounts['pending'] ?? 0),
                'in_progress' => (int) ($statusCounts['in_progress'] ?? 0),
                'completed' => (int) ($statusCounts['completed'] ?? 0),
                'critical' => $criticalResults->count(),
            ],
            'critical_results' => $criticalResults,
            'filters' => [
                'patient_id' => $patientId ?: null,
                'status' => $status ?: null,
            ],
        ]);
    }

    public function store(StoreLabOrderRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $items = $validated['items'];
        unset($validated['items'], $validated['images']);
        $clinicId = $request->user()->clinic_id;
        $userId = $request->user()->id;

        DB::transaction(function () use ($request, $validated, $items, $clinicId, $userId): void {
            $labOrder = LabOrder::create($validated + [
                'clinic_id' => $clinicId,
                'doctor_id' => $userId,
            ]);

            foreach ($items as $item) {
                $labOrder->items()->create($item);
            }

            foreach ($request->file('images', []) as $image) {
                $this->attachImage($image, $labOrder, $clinicId, $userId);
            }
        });

        return back()
            ->with('toast', ['type' => 'success', 'message' => __('lab_orders.created')]);
    }

    /**
     * Attachment documents on a lab order (images + PDFs), for the gallery on
     * the show page and the edit sheet.
     *
     * @return Collection<int, Document>
     */
    private function labOrderImages(LabOrder $labOrder): Collection
    {
        return Document::query()
            ->where('entity_type', 'LabOrder')
            ->where('entity_id', $labOrder->id)
            ->where('clinic_id', $labOrder->clinic_id)
            ->where(function ($query): void {
                $query->where('mime_type', 'like', 'image/%')
                    ->orWhere('mime_type', 'application/pdf');
            })
            ->orderBy('uploaded_at')
            ->get(['id', 'document_name', 'file_name', 'mime_type', 'file_size', 'uploaded_at']);
    }

    /**
     * Store an uploaded lab-order image on the private `local` disk (under a
     * clinic-prefixed path) and record it as a Document attached to the order,
     * reusing the shared documents pipeline (guarded download, policies, RLS).
     */
    private function attachImage(UploadedFile $image, LabOrder $labOrder, string $clinicId, string $userId): void
    {
        $hash = hash_file('sha256', $image->getRealPath());
        $extension = $image->getClientOriginalExtension();
        $path = Storage::disk('local')->putFileAs("clinics/{$clinicId}", $image, $hash.'.'.$extension);

        Document::create([
            'clinic_id' => $clinicId,
            'document_name' => $image->getClientOriginalName(),
            'document_type' => 'lab_result',
            'file_name' => $image->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $image->getSize(),
            'mime_type' => $image->getMimeType(),
            'file_extension' => $extension,
            'file_hash' => $hash,
            'entity_type' => 'LabOrder',
            'entity_id' => $labOrder->id,
            'is_private' => true,
            'uploaded_by' => $userId,
            'uploaded_at' => now(),
        ]);
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
            'images' => $this->labOrderImages($labOrder),
            'external_labs' => ExternalLab::query()
                ->where('clinic_id', $labOrder->clinic_id)
                ->where('is_active', true)
                ->get(['id', 'lab_name']),
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

    public function update(UpdateLabOrderRequest $request, string $locale, LabOrder $labOrder): RedirectResponse
    {
        unset($locale);
        $validated = $request->validated();
        unset($validated['images']);

        DB::transaction(function () use ($request, $validated, $labOrder): void {
            $labOrder->update($validated);

            foreach ($request->file('images', []) as $image) {
                $this->attachImage($image, $labOrder, $labOrder->clinic_id, $request->user()->id);
            }
        });

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
