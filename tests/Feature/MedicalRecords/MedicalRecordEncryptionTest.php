<?php

use App\Models\Clinic;
use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;

/**
 * Phase 4 maps the IG §security rules "encrypt medical_records.diagnosis +
 * notes" requirement onto the SOAP TEXT fields, since neither `diagnosis`
 * nor `notes` exist as columns. This test verifies ciphertext-at-rest for
 * each SOAP field and Eloquent decrypt-on-read round-trip.
 */
it('writes SOAP fields as ciphertext and reads them back as plaintext', function () {
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);

    $plaintext = [
        'subjective' => 'Patient reports persistent headache for 3 days.',
        'objective' => 'BP 130/85, HR 78, T 37.1°C, alert and oriented x3.',
        'assessment' => 'Probable tension-type headache, no red flags.',
        'plan' => 'Paracetamol 500mg q6h prn; reassess in one week if no improvement.',
        'content' => 'Full free-text narrative summary of the consultation.',
    ];

    $record = MedicalRecord::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
        ...$plaintext,
    ]);

    $raw = DB::selectOne(
        'SELECT subjective, objective, assessment, plan, content FROM medical_records WHERE id = ?',
        [$record->id]
    );

    foreach ($plaintext as $column => $value) {
        expect($raw->{$column})
            ->not->toBeNull("Raw $column should be stored")
            ->and($raw->{$column})
            ->not->toBe($value, "Raw $column should NOT equal plaintext")
            ->and(strlen($raw->{$column}))
            ->toBeGreaterThan(strlen($value), "Raw $column ciphertext should be longer than plaintext");
    }

    $fresh = MedicalRecord::find($record->id);
    foreach ($plaintext as $column => $value) {
        expect($fresh->{$column})->toBe($value, "Eloquent should decrypt $column back to plaintext");
    }
});

it('hides SOAP fields from default JSON serialisation', function () {
    $record = MedicalRecord::factory()->soap()->create();

    $array = $record->toArray();

    foreach (['content', 'subjective', 'objective', 'assessment', 'plan'] as $column) {
        expect($array)->not->toHaveKey($column);
    }
});
