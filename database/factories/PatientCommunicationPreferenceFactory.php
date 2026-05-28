<?php

namespace Database\Factories;

use App\Models\PatientCommunicationPreference;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * NOTE: a row is created automatically by the Postgres trigger
 * `trg_patients_default_prefs` and again (idempotently) by
 * `PatientObserver::created`. In tests, prefer updating the existing prefs
 * via `$patient->communicationPreferences->update([...])` rather than
 * calling `PatientCommunicationPreference::factory()->create()` directly,
 * which would collide with the patient_id UNIQUE constraint.
 *
 * @extends Factory<PatientCommunicationPreference>
 */
class PatientCommunicationPreferenceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reminder_enabled' => true,
            'reminder_before_hours' => 24,
            'preferred_channel' => 'whatsapp',
            'whatsapp_enabled' => true,
            'email_enabled' => true,
            'sms_enabled' => false,
            'phone_call_enabled' => true,
            'receive_invoice' => true,
            'receive_prescription' => true,
            'receive_lab_results' => true,
            'receive_appointment_reminder' => true,
            'consent_marketing' => false,
            'consent_data_processing' => true,
            'consent_data_processing_at' => now(),
            'language' => 'fr',
        ];
    }
}
