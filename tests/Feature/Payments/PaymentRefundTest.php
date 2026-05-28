<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $this->invoice = Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'subtotal' => 500,
        'tax_percentage' => 0,
    ]);
});

it('refunds a payment, sets status=refunded, and trigger zeroes paid_amount', function () {
    $admin = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $payment = Payment::factory()->create([
        'invoice_id' => $this->invoice->id,
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'amount' => 500,
        'payment_method' => 'cash',
        'payment_status' => 'completed',
    ]);

    // Trigger fires on INSERT → paid_amount becomes 500
    expect((float) $this->invoice->fresh()->paid_amount)->toEqual(500.0);

    $this->actingAs($admin)
        ->post(route('payments.refund', $payment))
        ->assertSessionHasNoErrors();

    // Trigger fires on UPDATE (status → refunded), filter excludes it → paid_amount becomes 0
    expect($payment->fresh()->payment_status)->toBe('refunded')
        ->and((float) $this->invoice->fresh()->paid_amount)->toEqual(0.0)
        ->and($this->invoice->fresh()->status)->toBe('pending');
});

it('only the secretary can refund a payment', function (string $role, bool $allowed) {
    $payment = Payment::factory()->create([
        'invoice_id' => $this->invoice->id,
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'amount' => 200,
        'payment_method' => 'cash',
        'payment_status' => 'completed',
    ]);

    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->post(route('payments.refund', $payment));

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        expect($payment->fresh()->payment_status)->toBe('refunded');
    } else {
        $response->assertForbidden();
        expect($payment->fresh()->payment_status)->toBe('completed');
    }
})->with([
    ['super_admin', false],
    ['doctor', false],
    ['secretary', true],
]);
