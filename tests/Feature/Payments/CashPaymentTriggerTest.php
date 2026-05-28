<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;

/**
 * The Postgres trigger fn_sync_invoice_paid_amount() recalculates
 * invoices.paid_amount on every INSERT/UPDATE/DELETE of a completed,
 * non-soft-deleted payment row. The controller then flips invoices.status
 * to paid / partially_paid based on the new totals.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $this->admin = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('marks invoice partially_paid when cash payment is less than total', function () {
    $invoice = Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'subtotal' => 1000,
        'tax_percentage' => 0,
    ]);

    $this->actingAs($this->admin)->post(route('payments.store'), [
        'invoice_id' => $invoice->id,
        'amount' => 400,
        'payment_method' => 'cash',
    ])->assertSessionHasNoErrors();

    $fresh = $invoice->fresh();
    expect((float) $fresh->paid_amount)->toEqual(400.0)
        ->and($fresh->status)->toBe('partially_paid')
        ->and((float) $fresh->balance_due)->toEqual(600.0);
});

it('marks invoice paid when cash payments equal total via trigger', function () {
    $invoice = Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'subtotal' => 500,
        'tax_percentage' => 0,
    ]);

    $this->actingAs($this->admin)->post(route('payments.store'), [
        'invoice_id' => $invoice->id,
        'amount' => 500,
        'payment_method' => 'cash',
    ])->assertSessionHasNoErrors();

    $fresh = $invoice->fresh();
    expect((float) $fresh->paid_amount)->toEqual(500.0)
        ->and($fresh->status)->toBe('paid')
        ->and((float) $fresh->balance_due)->toEqual(0.0);
});

it('blocks doctors from recording payments', function () {
    $invoice = Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
    ]);
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($doctor)->post(route('payments.store'), [
        'invoice_id' => $invoice->id,
        'amount' => 100,
        'payment_method' => 'cash',
    ])->assertForbidden();
});

it('lets secretary record a bank_wire payment', function () {
    $invoice = Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'subtotal' => 800,
        'tax_percentage' => 0,
    ]);
    $secretary = User::factory()->state(['role' => 'secretary'])->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($secretary)->post(route('payments.store'), [
        'invoice_id' => $invoice->id,
        'amount' => 800,
        'payment_method' => 'bank_wire',
        'reference_number' => 'TRF-123456',
        'bank_name' => 'Attijariwafa Bank',
    ])->assertSessionHasNoErrors();

    expect((float) $invoice->fresh()->paid_amount)->toEqual(800.0)
        ->and($invoice->fresh()->payments()->first()->payment_method)->toBe('bank_wire')
        ->and($invoice->fresh()->payments()->first()->reference_number)->toBe('TRF-123456');
});
