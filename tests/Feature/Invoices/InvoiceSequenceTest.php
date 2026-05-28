<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;

it('allocates invoice_number per clinic with INV- prefix and per-clinic series', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();

    $patientA = Patient::factory()->create(['clinic_id' => $clinicA->id]);
    $patientB = Patient::factory()->create(['clinic_id' => $clinicB->id]);

    $first = Invoice::create([
        'clinic_id' => $clinicA->id,
        'patient_id' => $patientA->id,
        'currency' => 'MAD',
        'subtotal' => 100,
    ]);
    $second = Invoice::create([
        'clinic_id' => $clinicA->id,
        'patient_id' => $patientA->id,
        'currency' => 'MAD',
        'subtotal' => 100,
    ]);
    $clinicBFirst = Invoice::create([
        'clinic_id' => $clinicB->id,
        'patient_id' => $patientB->id,
        'currency' => 'MAD',
        'subtotal' => 100,
    ]);

    expect($first->invoice_number)->toMatch('/^INV-\d{6}$/')
        ->and($second->invoice_number)->toMatch('/^INV-\d{6}$/')
        ->and($first->invoice_number)->not->toBe($second->invoice_number)
        ->and(intval(substr($second->invoice_number, 4)))
        ->toBe(intval(substr($first->invoice_number, 4)) + 1)
        ->and($clinicBFirst->invoice_number)->toMatch('/^INV-\d{6}$/');
});
