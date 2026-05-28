<?php

namespace App\Observers;

use App\Models\LabOrder;
use App\Services\SequenceService;
use Illuminate\Support\Facades\Auth;

class LabOrderObserver
{
    public function __construct(private readonly SequenceService $sequences) {}

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
}
