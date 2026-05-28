<?php

use App\Models\Clinic;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('only lets doctors create medical records', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->post(route('medical-records.store'), [
        'patient_id' => $this->patient->id,
        'record_type' => 'progress',
        'title' => 'Visit note',
        'assessment' => 'Patient stable.',
        'plan' => 'Continue current treatment.',
    ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect(MedicalRecord::query()->where('patient_id', $this->patient->id)->exists())->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', false],
    ['doctor', true],
    ['secretary', false],
]);

it('lets only the author update within the 24h window, denies after', function () {
    $author = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $stranger = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $record = MedicalRecord::factory()->soap()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'recorded_by' => $author->id,
    ]);

    // Stranger doctor cannot edit even within the window.
    $this->actingAs($stranger)
        ->patch(route('medical-records.update', $record), ['title' => 'Hijack'])
        ->assertForbidden();

    // Author within window can edit.
    $this->actingAs($author)
        ->patch(route('medical-records.update', $record), ['title' => 'Author edit'])
        ->assertRedirect();

    expect($record->fresh()->title)->toBe('Author edit');

    // After window: backdate created_at past 24h.
    $record->forceFill(['created_at' => now()->subHours(25)])->save();

    $this->actingAs($author)
        ->patch(route('medical-records.update', $record), ['title' => 'Too late'])
        ->assertForbidden();
});

it('signs a record and stamps signed_by / signed_at', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $record = MedicalRecord::factory()->soap()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'recorded_by' => $doctor->id,
    ]);

    $this->actingAs($doctor)
        ->post(route('medical-records.sign', $record))
        ->assertRedirect();

    $fresh = $record->fresh();
    expect($fresh->is_signed)->toBeTrue()
        ->and($fresh->signed_by)->toBe($doctor->id)
        ->and($fresh->signed_at)->not->toBeNull();
});
