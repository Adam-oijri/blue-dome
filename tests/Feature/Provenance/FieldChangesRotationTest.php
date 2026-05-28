<?php

use App\Models\Clinic;
use App\Models\FieldChange;
use App\Models\Patient;
use App\Models\User;

it('drops field_changes rows older than the retention floor', function () {
    $clinic = Clinic::factory()->create();
    $user = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);

    // Old row — past the 7-year floor.
    $old = FieldChange::factory()->create([
        'entity_type' => 'Patient',
        'entity_id' => $patient->id,
        'field_name' => 'phone',
        'changed_by_user_id' => $user->id,
        'changed_by_clinic_id' => $clinic->id,
        'origin_clinic_id' => $clinic->id,
        'changed_at' => now()->subYears(8),
    ]);

    // Recent row — should survive.
    $recent = FieldChange::factory()->create([
        'entity_type' => 'Patient',
        'entity_id' => $patient->id,
        'field_name' => 'first_name',
        'changed_by_user_id' => $user->id,
        'changed_by_clinic_id' => $clinic->id,
        'origin_clinic_id' => $clinic->id,
        'changed_at' => now()->subYears(1),
    ]);

    $this->artisan('app:rotate-field-changes')->assertSuccessful();

    expect(FieldChange::find($old->id))->toBeNull();
    expect(FieldChange::find($recent->id))->not->toBeNull();
});

it('respects --dry-run', function () {
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);
    $user = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);

    $old = FieldChange::factory()->create([
        'entity_type' => 'Patient',
        'entity_id' => $patient->id,
        'changed_by_user_id' => $user->id,
        'changed_by_clinic_id' => $clinic->id,
        'origin_clinic_id' => $clinic->id,
        'changed_at' => now()->subYears(10),
    ]);

    $this->artisan('app:rotate-field-changes', ['--dry-run' => true])->assertSuccessful();

    expect(FieldChange::find($old->id))->not->toBeNull();
});
