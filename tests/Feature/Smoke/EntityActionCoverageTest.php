<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\DocumentFolder;
use App\Models\Expense;
use App\Models\Inventory;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\User;
use App\Models\Vendor;

/**
 * Proves the mutating actions the coverage audit flagged as untested actually
 * work end-to-end (update persists / soft-delete) for the policy-allowed role.
 * Almost all were update/destroy on the shared clinic resources.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

// --- Appointments (any clinical role) ---------------------------------------

it('updates and soft-deletes an appointment', function () {
    $appt = Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
        'status' => 'scheduled',
    ]);

    $this->actingAs($this->secretary)
        ->patch(route('appointments.update', $appt), ['status' => 'completed'])
        ->assertSessionHasNoErrors();
    expect($appt->fresh()->status)->toBe('completed');

    $this->actingAs($this->secretary)
        ->delete(route('appointments.destroy', $appt))
        ->assertSessionHasNoErrors();
    $this->assertSoftDeleted($appt);
});

// --- Invoices (secretary / super_admin) -------------------------------------

it('updates and soft-deletes an invoice as secretary, blocks a doctor', function () {
    $invoice = Invoice::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)
        ->patch(route('invoices.update', $invoice), ['notes' => 'Coverage note'])
        ->assertSessionHasNoErrors();
    expect($invoice->fresh()->notes)->toBe('Coverage note');

    $this->actingAs($this->doctor)
        ->delete(route('invoices.destroy', $invoice))
        ->assertForbidden();

    $this->actingAs($this->secretary)
        ->delete(route('invoices.destroy', $invoice))
        ->assertSessionHasNoErrors();
    $this->assertSoftDeleted($invoice);
});

// --- Expenses (secretary) ---------------------------------------------------

it('updates and soft-deletes an expense', function () {
    $expense = Expense::factory()->create([
        'clinic_id' => $this->clinic->id,
        'category' => 'supplies',
    ]);

    $this->actingAs($this->secretary)
        ->patch(route('expenses.update', $expense), ['category' => 'utilities'])
        ->assertSessionHasNoErrors();
    expect($expense->fresh()->category)->toBe('utilities');

    $this->actingAs($this->secretary)
        ->delete(route('expenses.destroy', $expense))
        ->assertSessionHasNoErrors();
    $this->assertSoftDeleted($expense);
});

// --- Vendors (secretary) ----------------------------------------------------

it('updates and soft-deletes a vendor', function () {
    $vendor = Vendor::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)
        ->patch(route('vendors.update', $vendor), ['vendor_name' => 'Renamed Vendor'])
        ->assertSessionHasNoErrors();
    expect($vendor->fresh()->vendor_name)->toBe('Renamed Vendor');

    $this->actingAs($this->secretary)
        ->delete(route('vendors.destroy', $vendor))
        ->assertSessionHasNoErrors();
    $this->assertSoftDeleted($vendor);
});

// --- Inventory (secretary) --------------------------------------------------

it('soft-deletes an inventory item', function () {
    $item = Inventory::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)
        ->delete(route('inventory.destroy', $item))
        ->assertSessionHasNoErrors();
    $this->assertSoftDeleted($item);
});

// --- Lab orders (the ordering doctor) ---------------------------------------

it('lets the ordering doctor soft-delete a lab order', function () {
    $order = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->actingAs($this->doctor)
        ->delete(route('lab-orders.destroy', $order))
        ->assertSessionHasNoErrors();
    $this->assertSoftDeleted($order);
});

// --- Document folders (secretary) -------------------------------------------

it('creates and soft-deletes a non-system document folder', function () {
    $this->actingAs($this->secretary)
        ->post(route('document-folders.store'), ['folder_name' => 'Coverage Folder'])
        ->assertSessionHasNoErrors();

    $folder = DocumentFolder::query()
        ->where('clinic_id', $this->clinic->id)
        ->where('folder_name', 'Coverage Folder')
        ->firstOrFail();

    $this->actingAs($this->secretary)
        ->delete(route('document-folders.destroy', $folder))
        ->assertSessionHasNoErrors();
    $this->assertSoftDeleted($folder);
});
