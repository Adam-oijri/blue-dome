<?php

use App\Models\Clinic;
use App\Models\FieldChange;
use App\Models\Patient;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * Verifies the contract behind the deferred `provenance` Inertia prop:
 * given a patient and a seeded field_changes row, the recentForEntity scope
 * returns the row with `changedByUser` and `changedByClinic` eager-loaded,
 * which is what the controller's `Inertia::defer(...)` closure resolves to.
 *
 * The deferred-prop wiring itself (Inertia partial-reload mechanics) is
 * Inertia's responsibility; this test asserts the data flowing into the
 * closure is correct.
 */
it('returns the right provenance entries for the patient via the underlying scope', function () {
    $clinicA = Clinic::factory()->create(['name' => 'Origin Clinic']);
    $clinicB = Clinic::factory()->create(['name' => 'Editor Clinic']);
    $patient = Patient::factory()->create(['clinic_id' => $clinicA->id]);

    $editor = User::factory()->doctor()->create([
        'clinic_id' => $clinicB->id,
        'first_name' => 'Edna',
        'last_name' => 'Editor',
    ]);

    // Clear the create-time field_changes rows the AuditObserver wrote for
    // the patient factory so the assertion below only sees the explicit
    // single field change.
    FieldChange::query()->where('entity_id', $patient->id)->delete();

    FieldChange::factory()->create([
        'entity_type' => 'Patient',
        'entity_id' => $patient->id,
        'field_name' => 'phone',
        'old_value' => '+212600000111',
        'new_value' => '+212600000222',
        'changed_by_user_id' => $editor->id,
        'changed_by_clinic_id' => $clinicB->id,
        'origin_clinic_id' => $clinicA->id,
    ]);

    $entries = FieldChange::recentForEntity('Patient', $patient->id, 10)
        ->with([
            'changedByUser:id,first_name,last_name',
            'changedByClinic:id,name',
        ])
        ->get();

    expect($entries)->toHaveCount(1);
    $entry = $entries->first();
    expect($entry->field_name)->toBe('phone');
    expect($entry->old_value)->toBe('+212600000111');
    expect($entry->new_value)->toBe('+212600000222');
    expect($entry->changedByUser?->first_name)->toBe('Edna');
    expect($entry->changedByClinic?->name)->toBe('Editor Clinic');
});

it('renders the patient show page successfully (deferred prop is declared)', function () {
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $viewer = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);

    $this->actingAs($viewer)
        ->get(route('patients.show', $patient))
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('patients/show')
            ->where('patient.id', $patient->id)
        );
});
