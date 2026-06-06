<?php

use App\Models\Clinic;
use App\Models\Medication;
use App\Models\Prescription;
use App\Models\User;

/**
 * Closes the interactive-flow coverage gaps the page audit flagged: the
 * medication and prescription update/delete actions behind the edit screens.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

// --- Medications (secretary manages, doctor is read-only) -------------------

it('lets the secretary update a medication', function () {
    $med = Medication::factory()->create(['clinic_id' => $this->clinic->id, 'trade_name' => 'Old']);

    $this->actingAs($this->secretary)
        ->patch(route('medications.update', $med), ['trade_name' => 'Renamed'])
        ->assertSessionHasNoErrors();

    expect($med->fresh()->trade_name)->toBe('Renamed');
});

it('lets the secretary soft-delete a medication', function () {
    $med = Medication::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)
        ->delete(route('medications.destroy', $med))
        ->assertSessionHasNoErrors();

    $this->assertSoftDeleted('medications', ['id' => $med->id]);
});

it('blocks a doctor from updating a medication', function () {
    $med = Medication::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->doctor)
        ->patch(route('medications.update', $med), ['trade_name' => 'X'])
        ->assertForbidden();
});

// --- Prescriptions (only the prescribing doctor manages) --------------------

it('lets the prescribing doctor update a prescription', function () {
    $rx = Prescription::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
        'status' => 'draft',
    ]);

    $this->actingAs($this->doctor)
        ->patch(route('prescriptions.update', $rx), ['status' => 'completed'])
        ->assertSessionHasNoErrors();

    expect($rx->fresh()->status)->toBe('completed');
});

it('lets the prescribing doctor delete a prescription', function () {
    $rx = Prescription::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
    ]);

    $this->actingAs($this->doctor)
        ->delete(route('prescriptions.destroy', $rx))
        ->assertSessionHasNoErrors();

    $this->assertSoftDeleted('prescriptions', ['id' => $rx->id]);
});

it('blocks a non-author doctor from updating a prescription', function () {
    $otherDoctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $rx = Prescription::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $otherDoctor->id,
    ]);

    $this->actingAs($this->doctor)
        ->patch(route('prescriptions.update', $rx), ['status' => 'completed'])
        ->assertForbidden();
});
