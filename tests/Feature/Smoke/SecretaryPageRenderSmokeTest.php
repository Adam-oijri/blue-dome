<?php

use App\Models\Clinic;
use App\Models\Expense;
use App\Models\Inventory;
use App\Models\Invoice;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\User;
use App\Models\Vendor;

/**
 * Render smoke for the secretary: the secretary panels plus the shared
 * finance/admin modules (invoices, expenses, vendors, inventory, medications)
 * the secretary is allowed to manage. Returns 200 with the expected component.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('renders parameterless secretary pages', function (string $routeName, string $component) {
    $this->actingAs($this->secretary)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component($component));
})->with([
    // Secretary panels
    ['secretary.dashboard', 'panels/secretary/dashboard'],
    ['secretary.appointments', 'panels/secretary/appointments'],
    ['secretary.patients', 'panels/secretary/patients'],
    ['secretary.walkins', 'panels/secretary/walk-ins'],
    ['secretary.whatsapp', 'panels/secretary/whatsapp'],
    ['secretary.follow-up', 'secretary/follow-up'],
    ['secretary.billing', 'panels/secretary/billing'],
    ['secretary.payments', 'panels/secretary/payments'],
    ['secretary.doctors', 'panels/secretary/doctors'],
    ['secretary.branches', 'panels/secretary/branches'],
    ['secretary.reports', 'panels/secretary/reports'],
    ['secretary.settings', 'panels/secretary/settings'],
    // Shared finance / admin modules
    ['invoices.index', 'invoices/index'],
    ['expenses.index', 'expenses/index'],
    ['vendors.index', 'vendors/index'],
    ['inventory.index', 'inventory/index'],
    ['inventory.alerts', 'inventory/alerts'],
    ['medications.index', 'medications/index'],
]);

it('renders invoice show', function () {
    $invoice = Invoice::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)->get(route('invoices.show', $invoice))
        ->assertOk()->assertInertia(fn ($p) => $p->component('invoices/show'));
});

it('renders expense show', function () {
    $expense = Expense::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)->get(route('expenses.show', $expense))
        ->assertOk()->assertInertia(fn ($p) => $p->component('expenses/show'));
});

it('renders vendor show', function () {
    $vendor = Vendor::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)->get(route('vendors.show', $vendor))
        ->assertOk()->assertInertia(fn ($p) => $p->component('vendors/show'));
});

it('renders inventory show', function () {
    $item = Inventory::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)->get(route('inventory.show', $item))
        ->assertOk()->assertInertia(fn ($p) => $p->component('inventory/show'));
});

it('renders medication show', function () {
    $med = Medication::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)->get(route('medications.show', $med))
        ->assertOk()->assertInertia(fn ($p) => $p->component('medications/show'));
});

it('exposes patient options on the invoice index for the create sheet', function () {
    Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)->get(route('invoices.index'))
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->component('invoices/index')
            ->has('patients', 1)
        );
});
