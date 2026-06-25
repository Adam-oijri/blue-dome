<?php

namespace App\Http\Controllers;

use App\Http\Requests\MedicalRecord\StoreMedicalRecordRequest;
use App\Http\Requests\MedicalRecord\UpdateMedicalRecordRequest;
use App\Models\FieldChange;
use App\Models\MedicalRecord;
use App\Models\Patient;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MedicalRecordController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', MedicalRecord::class);

        $query = MedicalRecord::query()
            ->select(['id', 'clinic_id', 'patient_id', 'record_date', 'record_type', 'title', 'is_signed', 'is_confidential', 'recorded_by'])
            ->with([
                'patient:id,first_name,last_name,patient_code',
                'author:id,first_name,last_name',
            ])
            ->latest('record_date');

        if ($request->user()->role !== 'super_admin') {
            $query->where('clinic_id', $request->user()->clinic_id);
        }

        if ($patientId = $request->string('patient_id')->trim()->toString()) {
            $query->where('patient_id', $patientId);
        }

        if ($type = $request->string('record_type')->trim()->toString()) {
            $query->where('record_type', $type);
        }

        return Inertia::render('medical-records/index', [
            'records' => $query->paginate(25)->withQueryString(),
            'patients' => Patient::query()
                ->where('clinic_id', $request->user()->clinic_id)
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'patient_code']),
            'filters' => [
                'patient_id' => $patientId ?: null,
                'record_type' => $type ?: null,
            ],
        ]);
    }

    public function store(StoreMedicalRecordRequest $request): RedirectResponse
    {
        MedicalRecord::create($request->validated() + [
            'clinic_id' => $request->user()->clinic_id,
        ]);

        return back()
            ->with('toast', ['type' => 'success', 'message' => __('medical_records.created')]);
    }

    public function show(string $locale, MedicalRecord $medicalRecord): Response
    {
        unset($locale);
        $this->authorize('view', $medicalRecord);

        $medicalRecord->load([
            'patient:id,first_name,last_name,patient_code,date_of_birth',
            'author:id,first_name,last_name',
            'signer:id,first_name,last_name',
            'appointment:id,scheduled_start,status',
            'clinic:id,name',
        ]);

        return Inertia::render('medical-records/show', [
            'record' => $medicalRecord,
            'clinical' => [
                'content' => $medicalRecord->content,
                'subjective' => $medicalRecord->subjective,
                'objective' => $medicalRecord->objective,
                'assessment' => $medicalRecord->assessment,
                'plan' => $medicalRecord->plan,
            ],
            'provenance' => Inertia::defer(
                fn () => FieldChange::recentForEntity('MedicalRecord', $medicalRecord->id, 100)
                    ->with([
                        'changedByUser:id,first_name,last_name',
                        'changedByClinic:id,name',
                    ])
                    ->get()
            ),
        ]);
    }

    /**
     * Render the consultation record (SOAP) as a printable / PDF document.
     * Doctor-only; the encrypted clinical fields decrypt on attribute access
     * and are passed explicitly into the view (never via a JSON prop).
     */
    public function pdf(string $locale, MedicalRecord $medicalRecord): \Illuminate\Http\Response
    {
        unset($locale);
        $this->authorize('view', $medicalRecord);

        $medicalRecord->load([
            // Full clinic relation so the letterhead has address/phone/email.
            'clinic',
            'patient:id,first_name,last_name,patient_code,date_of_birth',
            'author:id,first_name,last_name',
            'signer:id,first_name,last_name',
            'appointment:id,scheduled_start,status',
        ]);

        return Pdf::loadView('pdf.medical-record', [
            'record' => $medicalRecord,
            'clinical' => [
                'content' => $medicalRecord->content,
                'subjective' => $medicalRecord->subjective,
                'objective' => $medicalRecord->objective,
                'assessment' => $medicalRecord->assessment,
                'plan' => $medicalRecord->plan,
            ],
            'clinic' => $medicalRecord->clinic,
            'generatedAt' => now()->toDayDateTimeString(),
        ])->download('consultation-'.$medicalRecord->id.'.pdf');
    }

    public function update(UpdateMedicalRecordRequest $request, string $locale, MedicalRecord $medicalRecord): RedirectResponse
    {
        unset($locale);
        $medicalRecord->update($request->validated());

        return redirect()
            ->route('medical-records.show', $medicalRecord)
            ->with('toast', ['type' => 'success', 'message' => __('medical_records.updated')]);
    }

    public function sign(Request $request, string $locale, MedicalRecord $medicalRecord): RedirectResponse
    {
        unset($locale);
        $this->authorize('sign', $medicalRecord);

        $medicalRecord->update(['is_signed' => true]);

        return redirect()
            ->route('medical-records.show', $medicalRecord)
            ->with('toast', ['type' => 'success', 'message' => __('medical_records.signed')]);
    }
}
