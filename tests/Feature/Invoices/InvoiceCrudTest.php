<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('lets the right roles list invoices', function (string $role) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    Invoice::factory()->create(['clinic_id' => $this->clinic->id, 'patient_id' => $this->patient->id]);

    $this->actingAs($actor)
        ->get(route('invoices.index'))
        ->assertSuccessful();
})->with(['super_admin', 'secretary']);

it('blocks doctors from listing invoices', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($doctor)
        ->get(route('invoices.index'))
        ->assertForbidden();
});

it('lets the secretary create invoices, blocks others', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->post(route('invoices.store'), [
        'patient_id' => $this->patient->id,
        'currency' => 'MAD',
        'items' => [[
            'item_type' => 'consultation',
            'description' => 'General consultation',
            'quantity' => 1,
            'unit_price' => 250,
        ]],
    ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect(Invoice::query()->where('patient_id', $this->patient->id)->exists())->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', false],
    ['doctor', false],
    ['secretary', true],
]);

it('lets a clinic invoice a patient registered at another clinic (Phase 8 global access)', function () {
    $admin = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $other = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $other->id]);

    $this->actingAs($admin)->post(route('invoices.store'), [
        'patient_id' => $otherPatient->id,
        'items' => [[
            'item_type' => 'consultation',
            'description' => 'X',
            'quantity' => 1,
            'unit_price' => 100,
        ]],
    ])->assertSessionHasNoErrors();

    $invoice = Invoice::query()
        ->where('patient_id', $otherPatient->id)
        ->first();

    expect($invoice)->not->toBeNull();
    // The invoice's clinic_id is the issuer's clinic; the patient stays
    // owned by the other clinic. Billing remains clinic-isolated — clinic
    // B sees only invoices it issued, even for clinic A patients.
    expect($invoice->clinic_id)->toBe($this->clinic->id);
});
