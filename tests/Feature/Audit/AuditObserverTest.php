<?php

use App\Models\ActivityLog;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->actor = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->actingAs($this->actor);
});

it('logs a create activity when a Patient is created', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $row = ActivityLog::query()
        ->where('entity_type', 'Patient')
        ->where('entity_id', $patient->id)
        ->where('action', 'create')
        ->first();

    expect($row)->not->toBeNull()
        ->and($row->user_id)->toBe($this->actor->id)
        ->and($row->clinic_id)->toBe($this->clinic->id)
        ->and($row->new_values)->toBeArray()
        ->and($row->new_values['first_name'])->toBe($patient->first_name);
});

it('logs an update activity with old + new values when a Patient is updated', function () {
    $patient = Patient::factory()->create([
        'clinic_id' => $this->clinic->id,
        'first_name' => 'Alpha',
    ]);

    ActivityLog::query()->where('entity_id', $patient->id)->delete();

    $patient->update(['first_name' => 'Beta']);

    $row = ActivityLog::query()
        ->where('entity_type', 'Patient')
        ->where('entity_id', $patient->id)
        ->where('action', 'update')
        ->first();

    expect($row)->not->toBeNull()
        ->and($row->old_values)->toHaveKey('first_name')
        ->and($row->old_values['first_name'])->toBe('Alpha')
        ->and($row->new_values['first_name'])->toBe('Beta');
});

it('logs a soft_delete activity when a Patient is soft-deleted', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $patient->delete();

    $row = ActivityLog::query()
        ->where('entity_type', 'Patient')
        ->where('entity_id', $patient->id)
        ->where('action', 'soft_delete')
        ->first();

    expect($row)->not->toBeNull();
});
