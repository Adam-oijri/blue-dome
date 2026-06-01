<?php

use App\Models\Clinic;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $this->medication = Medication::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('lets all clinic staff list prescriptions', function (string $role) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    Prescription::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
    ]);

    $this->actingAs($actor)
        ->get(route('prescriptions.index'))
        ->assertSuccessful();
})->with(['super_admin', 'doctor', 'secretary']);

it('only lets doctors create prescriptions', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [[
            'medication_id' => $this->medication->id,
            'dosage' => '500mg',
            'frequency_per_day' => 3,
            'duration_days' => 7,
            'route' => 'oral',
        ]],
    ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect(Prescription::query()->where('patient_id', $this->patient->id)->exists())->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', false],
    ['doctor', true],
    ['secretary', false],
]);

it('lets a doctor prescribe for a patient from another clinic (Phase 8 global access)', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $otherClinic = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);

    $this->actingAs($doctor)->post(route('prescriptions.store'), [
        'patient_id' => $otherPatient->id,
        'items' => [[
            'medication_id' => $this->medication->id,
            'dosage' => '500mg',
            'frequency_per_day' => 3,
            'duration_days' => 7,
            'route' => 'oral',
        ]],
    ])->assertSessionHasNoErrors();

    $prescription = Prescription::query()
        ->where('patient_id', $otherPatient->id)
        ->first();

    expect($prescription)->not->toBeNull();
    // The prescription's clinic_id is the prescriber's clinic, not the
    // patient's — origin attribution for the Rx itself, while the patient
    // record's origin clinic stays $otherClinic.
    expect($prescription->clinic_id)->toBe($this->clinic->id);
});

it('creates a catalog medication on the fly from a typed name and links the item to it', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($doctor)->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [[
            'medication_name' => 'Custom compound 5%',
            'dosage' => '10ml',
            'route' => 'topical',
        ]],
    ])->assertSessionHasNoErrors();

    $med = Medication::query()
        ->where('clinic_id', $this->clinic->id)
        ->where('trade_name', 'Custom compound 5%')
        ->first();

    expect($med)->not->toBeNull();
    expect($med->is_active)->toBeTrue();

    $item = Prescription::query()
        ->where('patient_id', $this->patient->id)
        ->firstOrFail()
        ->items()
        ->firstOrFail();

    expect($item->medication_id)->toBe($med->id);
});

it('matches an existing catalog medication case-insensitively instead of duplicating it', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $existing = Medication::factory()->create([
        'clinic_id' => $this->clinic->id,
        'trade_name' => 'Doliprane',
    ]);

    // Typed with different casing — should still match the existing entry.
    $this->actingAs($doctor)->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [['medication_name' => 'DOLIPRANE', 'dosage' => '500mg']],
    ])->assertSessionHasNoErrors();

    expect(
        Medication::query()
            ->where('clinic_id', $this->clinic->id)
            ->whereRaw('lower(trade_name) = ?', ['doliprane'])
            ->count()
    )->toBe(1);

    $item = Prescription::query()
        ->where('patient_id', $this->patient->id)
        ->firstOrFail()
        ->items()
        ->firstOrFail();

    expect($item->medication_id)->toBe($existing->id);
});

it('matches a near-typo to an existing medication via trigram similarity', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $aspirin = Medication::factory()->create([
        'clinic_id' => $this->clinic->id,
        'trade_name' => 'Aspirin',
    ]);

    $this->actingAs($doctor)->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [['medication_name' => 'Asprin', 'dosage' => '100mg']],
    ])->assertSessionHasNoErrors();

    expect(
        Medication::query()->where('clinic_id', $this->clinic->id)->where('trade_name', 'Asprin')->exists()
    )->toBeFalse();

    $item = Prescription::query()
        ->where('patient_id', $this->patient->id)
        ->firstOrFail()
        ->items()
        ->firstOrFail();

    expect($item->medication_id)->toBe($aspirin->id);
});

it('creates a new medication when no existing name is similar enough', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    Medication::factory()->create(['clinic_id' => $this->clinic->id, 'trade_name' => 'Aspirin']);

    $this->actingAs($doctor)->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [['medication_name' => 'Metformin', 'dosage' => '850mg']],
    ])->assertSessionHasNoErrors();

    expect(
        Medication::query()->where('clinic_id', $this->clinic->id)->where('trade_name', 'Metformin')->exists()
    )->toBeTrue();
});

it('surfaces typed medication names as suggestions on the index', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($doctor)->post(route('prescriptions.store'), [
        'patient_id' => $this->patient->id,
        'items' => [['medication_name' => 'Custom compound 5%', 'dosage' => '10ml']],
    ])->assertSessionHasNoErrors();

    $this->actingAs($doctor)
        ->get(route('prescriptions.index'))
        ->assertInertia(fn ($page) => $page
            ->component('prescriptions/index')
            ->where('medicationSuggestions', fn ($suggestions) => collect($suggestions)->contains('Custom compound 5%')
                && collect($suggestions)->contains($this->medication->trade_name)));
});
