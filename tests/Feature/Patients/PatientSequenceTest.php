<?php

use App\Models\Clinic;
use App\Models\Patient;
use App\Observers\ClinicObserver;

/**
 * `fn_next_seq` is the race-safe Postgres function backing per-clinic
 * sequence allocation. PatientObserver::creating calls it for any patient
 * that arrives without an explicit patient_code. The test confirms:
 *   - codes increment monotonically inside a clinic
 *   - each clinic has its own sequence (clinic B's code is NOT a
 *     continuation of clinic A's)
 *   - the ClinicObserver wires the seven sequence rows on Clinic create
 */
it('allocates per-clinic patient codes monotonically', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();

    $a1 = Patient::factory()->create(['clinic_id' => $clinicA->id]);
    $a2 = Patient::factory()->create(['clinic_id' => $clinicA->id]);
    $a3 = Patient::factory()->create(['clinic_id' => $clinicA->id]);
    $b1 = Patient::factory()->create(['clinic_id' => $clinicB->id]);

    expect($a1->patient_code)->toBe('PAT-000001');
    expect($a2->patient_code)->toBe('PAT-000002');
    expect($a3->patient_code)->toBe('PAT-000003');
    expect($b1->patient_code)->toBe('PAT-000001');
});

it('bootstraps the seven sequence rows for a freshly created clinic', function () {
    $clinic = Clinic::factory()->create();

    $rows = DB::table('clinic_sequences')
        ->where('clinic_id', $clinic->id)
        ->orderBy('sequence_name')
        ->get();

    expect($rows)->toHaveCount(7);

    $names = $rows->pluck('sequence_name')->all();
    expect($names)->toEqualCanonicalizing([
        'appointment_number',
        'expense_number',
        'invoice_number',
        'lab_order_number',
        'patient_code',
        'payment_number',
        'prescription_number',
    ]);

    $prefixes = $rows->pluck('prefix', 'sequence_name')->all();
    expect($prefixes['patient_code'])->toBe('PAT-');
    expect($prefixes['invoice_number'])->toBe('INV-');
});

it('does not duplicate sequence rows when ClinicObserver fires twice', function () {
    $clinic = Clinic::factory()->create();

    // Re-fire created event manually to simulate a re-import scenario.
    app(ClinicObserver::class)->created($clinic);

    $count = DB::table('clinic_sequences')->where('clinic_id', $clinic->id)->count();
    expect($count)->toBe(7);
});

it('respects an explicitly supplied patient_code instead of allocating', function () {
    $clinic = Clinic::factory()->create();

    $patient = Patient::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_code' => 'CUSTOM-001',
    ]);

    expect($patient->patient_code)->toBe('CUSTOM-001');
});
