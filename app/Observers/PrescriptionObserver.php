<?php

namespace App\Observers;

use App\Models\Prescription;
use App\Services\SequenceService;
use Illuminate\Support\Facades\Auth;

class PrescriptionObserver
{
    public function __construct(private readonly SequenceService $sequences) {}

    public function creating(Prescription $prescription): void
    {
        if (empty($prescription->prescription_number) && ! empty($prescription->clinic_id)) {
            $prescription->prescription_number = $this->sequences->next(
                $prescription->clinic_id,
                'prescription_number',
            );
        }

        if (empty($prescription->doctor_id) && Auth::check()) {
            $prescription->doctor_id = Auth::id();
        }
    }
}
