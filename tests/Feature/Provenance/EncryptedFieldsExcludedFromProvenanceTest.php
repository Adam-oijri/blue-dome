<?php

use App\Models\Clinic;
use App\Models\FieldChange;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\User;

/**
 * The AuditObserver's existing `$hidden` sanitization is the only thing
 * keeping encrypted clinical text out of activity_log. Phase 8 extends the
 * observer to write per-field rows in field_changes — this test guarantees
 * the same sanitization applies there, so the audit table can't become a
 * plaintext leak surface.
 */
it('does not write field_changes rows for encrypted MedicalRecord SOAP fields', function () {
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);

    $record = MedicalRecord::factory()->soap()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
        'recorded_by' => $doctor->id,
        'assessment' => 'Initial assessment text',
        'plan' => 'Initial plan text',
    ]);

    // Reset so the assertion only checks rows from the upcoming update.
    FieldChange::query()->where('entity_id', $record->id)->delete();

    $this->actingAs($doctor)
        ->patch(route('medical-records.update', $record), [
            'title' => 'Visible title update',
            'assessment' => 'New (encrypted) assessment',
            'plan' => 'New (encrypted) plan',
        ])
        ->assertSessionHasNoErrors();

    $fieldsRecorded = FieldChange::query()
        ->where('entity_type', 'MedicalRecord')
        ->where('entity_id', $record->id)
        ->pluck('field_name')
        ->all();

    expect($fieldsRecorded)->toContain('title');
    expect($fieldsRecorded)->not->toContain('assessment');
    expect($fieldsRecorded)->not->toContain('plan');
    expect($fieldsRecorded)->not->toContain('content');
    expect($fieldsRecorded)->not->toContain('subjective');
    expect($fieldsRecorded)->not->toContain('objective');
});
