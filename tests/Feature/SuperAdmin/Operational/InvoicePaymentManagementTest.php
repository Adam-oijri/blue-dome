<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('lets a super-admin create an invoice on the route clinic', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.invoices.store', $this->clinic), [
            'patient_id' => $this->patient->id,
            'currency' => 'MAD',
            'items' => [[
                'item_type' => 'consultation',
                'description' => 'General consultation',
                'quantity' => 1,
                'unit_price' => 250,
            ]],
        ])
        ->assertSessionHasNoErrors();

    $invoice = Invoice::query()->where('patient_id', $this->patient->id)->first();

    expect($invoice)->not->toBeNull()
        ->and($invoice->clinic_id)->toBe($this->clinic->id)
        ->and($invoice->clinic_id)->not->toBe($this->superAdmin->clinic_id)
        ->and($invoice->items()->count())->toBe(1)
        ->and((float) $invoice->subtotal)->toEqual(250.0);
});

it('lets a super-admin record a cash payment and refund it', function () {
    $invoice = Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'subtotal' => 500,
        'tax_percentage' => 0,
    ]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.payments.store', $this->clinic), [
            'invoice_id' => $invoice->id,
            'amount' => 500,
            'payment_method' => 'cash',
        ])
        ->assertSessionHasNoErrors();

    $payment = Payment::query()->where('invoice_id', $invoice->id)->first();
    expect($payment)->not->toBeNull()
        ->and($payment->clinic_id)->toBe($this->clinic->id);
    expect((float) $invoice->fresh()->paid_amount)->toEqual(500.0)
        ->and($invoice->fresh()->status)->toBe('paid');

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.payments.refund', ['clinic' => $this->clinic->id, 'payment' => $payment->id]))
        ->assertSessionHasNoErrors();

    expect($payment->fresh()->payment_status)->toBe('refunded')
        ->and((float) $invoice->fresh()->paid_amount)->toEqual(0.0);
});

it('rejects paying an invoice that belongs to a different clinic', function () {
    $other = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $other->id]);
    $otherInvoice = Invoice::factory()->create(['clinic_id' => $other->id, 'patient_id' => $otherPatient->id, 'subtotal' => 100, 'tax_percentage' => 0]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.payments.store', $this->clinic), [
            'invoice_id' => $otherInvoice->id,
            'amount' => 100,
            'payment_method' => 'cash',
        ])
        ->assertSessionHasErrors('invoice_id');
});

it('forbids doctor and secretary from clinic-scoped invoice/payment routes', function (string $role) {
    $actor = User::factory()->{$role}()->create();

    $this->actingAs($actor)
        ->get(route('super-admin.clinics.invoices.index', $this->clinic))
        ->assertForbidden();
    $this->actingAs($actor)
        ->post(route('super-admin.clinics.invoices.store', $this->clinic), [
            'patient_id' => $this->patient->id,
            'items' => [['item_type' => 'consultation', 'description' => 'x', 'quantity' => 1, 'unit_price' => 10]],
        ])
        ->assertForbidden();
})->with(['doctor', 'secretary']);
