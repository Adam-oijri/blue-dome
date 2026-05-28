<?php

namespace App\Models;

use Database\Factories\PatientCommunicationPreferenceFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientCommunicationPreference extends Model
{
    /** @use HasFactory<PatientCommunicationPreferenceFactory> */
    use HasFactory, HasUuids;

    protected $table = 'patient_communication_preferences';

    protected $fillable = [
        'patient_id',
        'clinic_id',
        'reminder_enabled',
        'reminder_before_hours',
        'preferred_channel',
        'whatsapp_enabled',
        'email_enabled',
        'sms_enabled',
        'phone_call_enabled',
        'receive_invoice',
        'receive_prescription',
        'receive_lab_results',
        'receive_appointment_reminder',
        'consent_marketing',
        'consent_marketing_at',
        'consent_data_processing',
        'consent_data_processing_at',
        'language',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reminder_enabled' => 'boolean',
            'whatsapp_enabled' => 'boolean',
            'email_enabled' => 'boolean',
            'sms_enabled' => 'boolean',
            'phone_call_enabled' => 'boolean',
            'receive_invoice' => 'boolean',
            'receive_prescription' => 'boolean',
            'receive_lab_results' => 'boolean',
            'receive_appointment_reminder' => 'boolean',
            'consent_marketing' => 'boolean',
            'consent_data_processing' => 'boolean',
            'consent_marketing_at' => 'datetime',
            'consent_data_processing_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
