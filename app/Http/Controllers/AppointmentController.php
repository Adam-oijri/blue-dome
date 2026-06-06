<?php

namespace App\Http\Controllers;

use App\Events\AppointmentConfirmed;
use App\Http\Requests\Appointment\CancelAppointmentRequest;
use App\Http\Requests\Appointment\RecordFollowUpCallRequest;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\FieldChange;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Appointment::class);

        $query = Appointment::query()
            ->select([
                'id', 'clinic_id', 'patient_id', 'doctor_id', 'appointment_number',
                'scheduled_start', 'scheduled_end', 'appointment_day', 'status',
                'type', 'priority', 'confirmation_status', 'needs_follow_up_call',
                'follow_up_call_status',
            ])
            ->with([
                'patient:id,clinic_id,first_name,last_name,phone',
                'doctor:id,clinic_id,first_name,last_name',
            ])
            ->latest('scheduled_start');

        // Phase 8 (global-patient-access): the prior defense-in-depth filter
        // by actor->clinic_id is intentionally removed. Callers can scope by
        // `?origin_clinic=<uuid>` to retain the per-clinic view.
        if ($originClinic = $request->string('origin_clinic')->trim()->toString()) {
            $query->where('clinic_id', $originClinic);
        }

        if ($day = $request->date('day')) {
            $query->where('appointment_day', $day->toDateString());
        }

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        return Inertia::render('appointments/index', [
            'appointments' => $query->paginate(25)->withQueryString(),
            'filters' => [
                'day' => $request->input('day'),
                'status' => $status ?: null,
                'origin_clinic' => $originClinic ?: null,
            ],
        ]);
    }

    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        Appointment::create($request->validated() + [
            'clinic_id' => $request->user()->clinic_id,
        ]);

        return back()
            ->with('toast', ['type' => 'success', 'message' => __('appointments.scheduled')]);
    }

    /**
     * JSON options for the inline "create appointment" Sheet. Returns the
     * actor's clinic patients for the patient dropdown (the doctor is the
     * authenticated user, so no doctor list is needed).
     */
    public function formOptions(Request $request): JsonResponse
    {
        $this->authorize('create', Appointment::class);

        return response()->json([
            'patients' => Patient::query()
                ->where('clinic_id', $request->user()->clinic_id)
                ->whereNull('deleted_at')
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'last_name', 'phone']),
        ]);
    }

    public function show(string $locale, Appointment $appointment): Response
    {
        unset($locale);
        $this->authorize('view', $appointment);

        $appointment->load([
            'patient:id,clinic_id,first_name,last_name,phone,phone_e164,date_of_birth',
            'doctor:id,clinic_id,first_name,last_name',
            'secretary:id,first_name,last_name',
            'clinic:id,name',
        ]);

        return Inertia::render('appointments/show', [
            'appointment' => $appointment,
            'provenance' => Inertia::defer(
                fn () => FieldChange::recentForEntity('Appointment', $appointment->id, 100)
                    ->with([
                        'changedByUser:id,first_name,last_name',
                        'changedByClinic:id,name',
                    ])
                    ->get()
            ),
        ]);
    }

    public function update(UpdateAppointmentRequest $request, string $locale, Appointment $appointment): RedirectResponse
    {
        unset($locale);
        $appointment->update($request->validated());

        return redirect()
            ->route('appointments.show', $appointment)
            ->with('toast', ['type' => 'success', 'message' => __('appointments.updated')]);
    }

    public function destroy(string $locale, Appointment $appointment): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $appointment);

        $appointment->delete();

        return redirect()
            ->route('appointments.index')
            ->with('toast', ['type' => 'success', 'message' => __('appointments.deleted')]);
    }

    public function cancel(CancelAppointmentRequest $request, string $locale, Appointment $appointment): RedirectResponse
    {
        unset($locale);
        $appointment->forceFill([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => $request->user()->id,
            'cancelled_reason' => $request->string('cancelled_reason')->toString(),
        ])->save();

        return redirect()
            ->route('appointments.show', $appointment)
            ->with('toast', ['type' => 'success', 'message' => __('appointments.cancelled')]);
    }

    /**
     * Public token-confirm endpoint. No auth — patients only ever interact
     * via this URL. The token is 64 random chars (unguessable) and expires
     * 48h after appointment creation.
     *
     * Always returns the same Inertia page; the `success` prop tells the
     * truth (true = confirmed now or already confirmed; false = bad token).
     * Status 410 on rejection so the assertion is unambiguous.
     */
    public function confirm(string $token)
    {
        $appointment = Appointment::query()
            ->where('confirmation_token', $token)
            ->with('patient:id,first_name')
            ->first();

        if ($appointment === null || ! $appointment->isConfirmationTokenValid($token)) {
            return Inertia::render('appointments/confirmation-result', [
                'success' => false,
                'reason' => 'invalid_or_expired',
            ])->toResponse(request())->setStatusCode(410);
        }

        // Re-clicking an already-confirmed link is idempotent.
        if ($appointment->confirmation_status !== 'confirmed_by_patient') {
            $appointment->forceFill([
                'status' => 'confirmed',
                'confirmation_status' => 'confirmed_by_patient',
                'confirmation_at' => now(),
                'confirmation_method' => 'whatsapp',
            ])->save();

            AppointmentConfirmed::dispatch($appointment, 'whatsapp');
        }

        return Inertia::render('appointments/confirmation-result', [
            'success' => true,
            'scheduled_start' => $appointment->scheduled_start?->toIso8601String(),
            'patient_first_name' => $appointment->patient?->first_name,
        ]);
    }

    public function recordFollowUp(RecordFollowUpCallRequest $request, string $locale, Appointment $appointment): RedirectResponse
    {
        unset($locale);
        $appointment->forceFill([
            'follow_up_call_status' => $request->input('follow_up_call_status'),
            'follow_up_call_notes' => $request->input('follow_up_call_notes'),
            'follow_up_call_by' => $request->user()->id,
            'follow_up_call_at' => now(),
            'follow_up_call_attempts' => $appointment->follow_up_call_attempts + 1,
            'last_follow_up_attempt_at' => now(),
        ])->save();

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('appointments.follow_up_recorded'),
        ]);
    }
}
