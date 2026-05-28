<?php

use App\Models\Clinic;
use App\Models\FieldChange;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinicA = Clinic::factory()->create();
    $this->clinicB = Clinic::factory()->create();
    $this->patientOfA = Patient::factory()->create([
        'clinic_id' => $this->clinicA->id,
        'first_name' => 'Before',
        'phone' => '+212600000111',
    ]);
});

it('writes one field_changes row per changed attribute on update', function () {
    $actorB = User::factory()->secretary()->create(['clinic_id' => $this->clinicB->id]);

    // Wipe rows created by the patient factory's `created` event so the
    // assertion below only sees the update.
    FieldChange::query()->where('entity_id', $this->patientOfA->id)->delete();

    $this->actingAs($actorB)
        ->patch(route('patients.update', $this->patientOfA), [
            'first_name' => 'After',
            'phone' => '+212600000222',
        ])
        ->assertSessionHasNoErrors();

    $rows = FieldChange::query()
        ->where('entity_type', 'Patient')
        ->where('entity_id', $this->patientOfA->id)
        ->orderBy('field_name')
        ->get();

    $byField = $rows->keyBy('field_name');

    expect($byField->has('first_name'))->toBeTrue();
    expect($byField->has('phone'))->toBeTrue();

    expect($byField['first_name']->old_value)->toBe('Before');
    expect($byField['first_name']->new_value)->toBe('After');
    expect($byField['first_name']->changed_by_user_id)->toBe($actorB->id);
    expect($byField['first_name']->changed_by_clinic_id)->toBe($this->clinicB->id);
    expect($byField['first_name']->origin_clinic_id)->toBe($this->clinicA->id);

    expect($byField['phone']->old_value)->toBe('+212600000111');
    expect($byField['phone']->new_value)->toBe('+212600000222');
});

it('writes a create row when a patient is first persisted', function () {
    $actor = User::factory()->secretary()->create(['clinic_id' => $this->clinicA->id]);

    $this->actingAs($actor)->post(route('patients.store'), [
        'first_name' => 'Brand',
        'last_name' => 'New',
        'phone_e164' => '+212600009999',
    ])->assertSessionHasNoErrors();

    $patient = Patient::query()->where('last_name', 'New')->firstOrFail();

    $createRows = FieldChange::query()
        ->where('entity_type', 'Patient')
        ->where('entity_id', $patient->id)
        ->whereNull('old_value')
        ->get();

    expect($createRows->count())->toBeGreaterThan(0);
    expect($createRows->pluck('field_name')->all())->toContain('first_name');
});
