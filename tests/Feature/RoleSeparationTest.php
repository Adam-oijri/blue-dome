<?php

use App\Models\Clinic;
use App\Models\User;

/**
 * Canonical guard for the doctor/secretary boundary. Each role may reach only
 * its own modules; the secretary (clinic manager) owns patients, scheduling,
 * billing and the finance/admin modules, while the clinical record set
 * (medical records, prescriptions, lab orders) is the treating doctor's alone.
 * Enforced by route middleware + policies; the frontend then renders every
 * shared page inside the viewer's own role layout.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('lets the secretary reach its own modules', function (string $routeName) {
    $this->actingAs($this->secretary)->get(route($routeName))->assertSuccessful();
})->with([
    'patients.index',
    'appointments.index',
    'invoices.index',
    'medications.index',
    'inventory.index',
    'expenses.index',
    'vendors.index',
    'documents.index',
]);

it('blocks the secretary from the clinical record modules', function (string $routeName) {
    $this->actingAs($this->secretary)->get(route($routeName))->assertForbidden();
})->with([
    'prescriptions.index',
    'lab-orders.index',
    'medical-records.index',
]);

it('lets the doctor reach the clinical + shared modules', function (string $routeName) {
    $this->actingAs($this->doctor)->get(route($routeName))->assertSuccessful();
})->with([
    'patients.index',
    'appointments.index',
    'documents.index',
    'prescriptions.index',
    'lab-orders.index',
    'medical-records.index',
]);

it('blocks the doctor from the secretary-owned finance modules', function (string $routeName) {
    $this->actingAs($this->doctor)->get(route($routeName))->assertForbidden();
})->with([
    'invoices.index',
    'expenses.index',
    'vendors.index',
]);
