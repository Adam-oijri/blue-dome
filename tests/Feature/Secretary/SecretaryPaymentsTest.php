<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('renders the secretary payments page with data, kpis and breakdown', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $invoice = Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
    ]);
    Payment::factory()->count(2)->create([
        'clinic_id' => $this->clinic->id,
        'invoice_id' => $invoice->id,
        'patient_id' => $patient->id,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.payments'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/payments')
            ->has('payments.data', 2)
            ->has('kpis')
            ->has('method_breakdown')
        );
});

it('scopes payments to the secretary clinic', function () {
    $otherClinic = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);
    $otherInvoice = Invoice::factory()->create([
        'clinic_id' => $otherClinic->id,
        'patient_id' => $otherPatient->id,
    ]);
    Payment::factory()->create([
        'clinic_id' => $otherClinic->id,
        'invoice_id' => $otherInvoice->id,
        'patient_id' => $otherPatient->id,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.payments'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('payments.data', 0));
});
