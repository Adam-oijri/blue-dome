<?php

namespace App\Observers;

use App\Models\Patient;
use App\Services\SequenceService;
use Illuminate\Support\Facades\Auth;

/**
 * Two hooks:
 *
 * 1. `creating()` — if the caller didn't supply a patient_code, allocate one
 *    from the per-clinic sequence via `fn_next_seq`. Also auto-stamps
 *    created_by from the authenticated actor when not explicitly set.
 *
 * 2. `created()` — the Postgres trigger `trg_patients_default_prefs` already
 *    inserts a `patient_communication_preferences` row. The `firstOrCreate`
 *    here is idempotent and exists so future Phase 3+ event listeners
 *    (welcome WhatsApp, intake email, etc.) have a Laravel-side hook
 *    parallel to the database trigger.
 */
class PatientObserver
{
    public function __construct(private readonly SequenceService $sequences) {}

    public function creating(Patient $patient): void
    {
        if (empty($patient->patient_code) && ! empty($patient->clinic_id)) {
            $patient->patient_code = $this->sequences->next($patient->clinic_id, 'patient_code');
        }

        if (empty($patient->created_by) && Auth::check()) {
            $patient->created_by = Auth::id();
        }
    }

    public function created(Patient $patient): void
    {
        $patient->communicationPreferences()->firstOrCreate(
            ['patient_id' => $patient->id],
            ['clinic_id' => $patient->clinic_id]
        );
    }
}
