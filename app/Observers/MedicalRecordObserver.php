<?php

namespace App\Observers;

use App\Models\MedicalRecord;
use Illuminate\Support\Facades\Auth;

class MedicalRecordObserver
{
    public function creating(MedicalRecord $record): void
    {
        if (empty($record->recorded_by) && Auth::check()) {
            $record->recorded_by = Auth::id();
        }
    }

    public function saving(MedicalRecord $record): void
    {
        // If the record is being signed for the first time, stamp signer + timestamp.
        if ($record->isDirty('is_signed') && $record->is_signed && empty($record->signed_at)) {
            $record->signed_at = now();
            if (empty($record->signed_by) && Auth::check()) {
                $record->signed_by = Auth::id();
            }
        }
    }
}
