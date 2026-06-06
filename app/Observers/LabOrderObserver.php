<?php

namespace App\Observers;

use App\Models\LabOrder;
use App\Models\User;
use App\Services\Notifications\NotificationService;
use App\Services\SequenceService;
use Illuminate\Support\Facades\Auth;

class LabOrderObserver
{
    public function __construct(
        private readonly SequenceService $sequences,
        private readonly NotificationService $notifications,
    ) {}

    public function creating(LabOrder $labOrder): void
    {
        if (empty($labOrder->lab_order_number) && ! empty($labOrder->clinic_id)) {
            $labOrder->lab_order_number = $this->sequences->next(
                $labOrder->clinic_id,
                'lab_order_number',
            );
        }

        if (empty($labOrder->doctor_id) && Auth::check()) {
            $labOrder->doctor_id = Auth::id();
        }
    }

    /**
     * Alert the ordering doctor when results land (status → completed).
     */
    public function updated(LabOrder $labOrder): void
    {
        if (! $labOrder->wasChanged('status') || $labOrder->status !== 'completed') {
            return;
        }

        if (empty($labOrder->doctor_id)) {
            return;
        }

        $doctor = User::find($labOrder->doctor_id);

        if ($doctor === null) {
            return;
        }

        $labOrder->loadMissing('patient:id,first_name,last_name');
        $patient = $labOrder->patient;
        $name = $patient
            ? (trim($patient->first_name.' '.$patient->last_name) ?: '—')
            : '—';

        $this->notifications->send(
            recipients: [$doctor],
            type: 'lab_result_ready',
            params: ['patient' => $name],
            actionUrl: route('lab-orders.show', ['lab_order' => $labOrder->id]),
            referenceType: 'LabOrder',
            referenceId: $labOrder->id,
        );
    }
}
