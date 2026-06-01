<?php

use App\Models\Clinic;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\User;

/**
 * Regression guard for the pre-deployment audit: the lab-orders, invoices, and
 * expenses index pages used to render hardcoded mock arrays and ignore their
 * controller props. These assert each page now exposes the real server data
 * (and the new aggregate props) so a mock relapse fails the suite.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('lab-orders index exposes real orders, KPIs and critical results', function () {
    $order = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
        'status' => 'in_progress',
    ]);
    $order->items()->create([
        'test_name' => 'Troponin I',
        'result' => '0.42',
        'unit' => 'ng/mL',
        'result_status' => 'critical',
        'is_critical' => true,
        'is_abnormal' => true,
    ]);

    $this->actingAs($this->doctor)
        ->get(route('lab-orders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('lab-orders/index')
            ->has('lab_orders.data', 1)
            ->where('lab_orders.data.0.id', $order->id)
            ->where('kpis.in_progress', 1)
            ->where('kpis.critical', 1)
            ->has('critical_results', 1)
            ->where('critical_results.0.test_name', 'Troponin I')
        );
});

it('invoices index exposes real invoices and money KPIs', function () {
    $invoice = Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('invoices.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('invoices/index')
            ->has('invoices.data', 1)
            ->where('invoices.data.0.id', $invoice->id)
            ->has('kpis.outstanding')
            ->has('kpis.invoiced_mtd')
            ->has('kpis.collected_mtd')
            ->has('kpis.overdue')
        );
});

it('invoices show renders the real invoice detail with items and payments', function () {
    $invoice = Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('invoices.show', $invoice))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('invoices/show')
            ->where('invoice.id', $invoice->id)
            ->has('invoice.items')
            ->has('invoice.payments')
        );
});

it('medications index exposes the real formulary', function () {
    $med = Medication::factory()->create([
        'clinic_id' => $this->clinic->id,
        'trade_name' => 'Doliprane',
    ]);

    $this->actingAs($this->doctor)
        ->get(route('medications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('medications/index')
            ->has('medications.data', 1)
            ->where('medications.data.0.id', $med->id)
            ->where('medications.data.0.trade_name', 'Doliprane')
        );
});

it('expenses index exposes real expenses', function () {
    $expense = Expense::factory()->create([
        'clinic_id' => $this->clinic->id,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('expenses.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('expenses/index')
            ->has('expenses.data', 1)
            ->where('expenses.data.0.id', $expense->id)
        );
});
