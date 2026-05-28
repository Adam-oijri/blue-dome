<?php

use App\Models\Patient;
use Illuminate\Support\Facades\DB;

/**
 * IMPLEMENTATION_GUIDE.md §security rules requires `national_id` and
 * `insurance_number` to be encrypted at rest. The widen migration changed
 * both columns to TEXT so the base64 ciphertext fits. This test proves the
 * round-trip: Eloquent writes the plaintext, the raw column holds ciphertext,
 * Eloquent decrypts back to plaintext on read.
 */
it('writes national_id as ciphertext and reads back plaintext', function () {
    $patient = Patient::factory()->withNationalId()->create([
        'national_id' => 'CIN-XX123456',
    ]);

    $raw = DB::selectOne('SELECT national_id FROM patients WHERE id = ?', [$patient->id]);

    expect($raw->national_id)
        ->not->toBeNull()
        ->and($raw->national_id)
        ->not->toBe('CIN-XX123456')
        ->and(strlen($raw->national_id))
        ->toBeGreaterThan(100);

    expect(Patient::find($patient->id)->national_id)->toBe('CIN-XX123456');
});

it('writes insurance_number as ciphertext and reads back plaintext', function () {
    $patient = Patient::factory()->withInsurance()->create([
        'insurance_number' => 'INS-99887766',
    ]);

    $raw = DB::selectOne('SELECT insurance_number FROM patients WHERE id = ?', [$patient->id]);

    expect($raw->insurance_number)
        ->not->toBeNull()
        ->and($raw->insurance_number)
        ->not->toBe('INS-99887766');

    expect(Patient::find($patient->id)->insurance_number)->toBe('INS-99887766');
});

it('hides national_id and insurance_number from the default JSON shape', function () {
    $patient = Patient::factory()->withNationalId()->withInsurance()->create();

    $array = $patient->toArray();

    expect($array)
        ->not->toHaveKey('national_id')
        ->and($array)
        ->not->toHaveKey('insurance_number');
});
