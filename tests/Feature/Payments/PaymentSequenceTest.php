<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;

it('allocates payment_number per clinic with PAY- prefix and no duplicates under serial inserts', function () {
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $invoice = Invoice::factory()->create([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
        'subtotal' => 10000,
        'tax_percentage' => 0,
    ]);

    $numbers = [];
    for ($i = 0; $i < 20; $i++) {
        $payment = Payment::create([
            'clinic_id' => $clinic->id,
            'invoice_id' => $invoice->id,
            'patient_id' => $patient->id,
            'amount' => 100,
            'currency' => 'MAD',
            'payment_method' => 'cash',
            'payment_status' => 'completed',
        ]);
        $numbers[] = $payment->payment_number;
    }

    expect($numbers)->toHaveCount(20)
        ->and(count(array_unique($numbers)))->toBe(20)
        ->and($numbers[0])->toMatch('/^PAY-\d{6}$/');
});
