<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('streams an invoice PDF for a secretary', function () {
    $invoice = Invoice::factory()->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($this->secretary)->get(route('invoices.pdf', $invoice));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
    expect(strlen((string) $response->getContent()))->toBeGreaterThan(500);
});

it('allows a same-clinic doctor but forbids a foreign-clinic user (clinic isolation)', function () {
    $invoice = Invoice::factory()->create(['clinic_id' => $this->clinic->id]);

    // A doctor in the invoice's clinic may export it (InvoicePolicy::view is clinic-scoped).
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->actingAs($doctor)->get(route('invoices.pdf', $invoice))->assertOk();

    // A user from another clinic may not.
    $otherClinic = Clinic::factory()->create();
    $foreign = User::factory()->secretary()->create(['clinic_id' => $otherClinic->id]);
    $this->actingAs($foreign)->get(route('invoices.pdf', $invoice))->assertForbidden();
});
