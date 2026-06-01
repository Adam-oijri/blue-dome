<?php

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

/**
 * national_id is stored encrypted (random IV), so the per-clinic uniqueness
 * rule is enforced via the deterministic `national_id_hash` blind index. These
 * assert the rule actually fires — duplicate charts for one person used to be
 * created silently because the ciphertext index/Rule::unique never collided.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('rejects a duplicate national_id within the same clinic', function () {
    Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'national_id' => 'CIN-DUP001',
    ]);

    $this->actingAs($this->secretary)
        ->post(route('patients.store'), [
            'first_name' => 'Test',
            'last_name' => 'Patient',
            'national_id' => 'CIN-DUP001',
        ])
        ->assertSessionHasErrors('national_id');

    expect(Patient::query()->where('clinic_id', $this->clinic->id)->count())->toBe(1);
});

it('allows the same national_id in a different clinic', function () {
    $otherClinic = Clinic::factory()->create();
    Patient::factory()->create([
        'clinic_id' => $otherClinic->id,
        'national_id' => 'CIN-DUP002',
    ]);

    $this->actingAs($this->secretary)
        ->post(route('patients.store'), [
            'first_name' => 'Test',
            'last_name' => 'Patient',
            'national_id' => 'CIN-DUP002',
        ])
        ->assertSessionHasNoErrors();

    expect(
        Patient::query()
            ->where('clinic_id', $this->clinic->id)
            ->where('national_id_hash', Patient::nationalIdHash('CIN-DUP002'))
            ->exists()
    )->toBeTrue();
});

it('lets a patient keep its own national_id on update', function () {
    $patient = Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'national_id' => 'CIN-DUP003',
    ]);

    $this->actingAs($this->secretary)
        ->patch(route('patients.update', $patient), [
            'first_name' => 'Renamed',
            'last_name' => 'Patient',
            'national_id' => 'CIN-DUP003',
        ])
        ->assertSessionHasNoErrors();
});

it('backfills and maintains national_id_hash on write', function () {
    $patient = Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'national_id' => 'CIN-HASH99',
    ]);

    expect($patient->fresh()->national_id_hash)
        ->toBe(Patient::nationalIdHash('CIN-HASH99'));
});
