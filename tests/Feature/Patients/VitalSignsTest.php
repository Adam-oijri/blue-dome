<?php

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use App\Models\VitalSigns;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('lets doctor and secretary record vital signs', function (string $role) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)
        ->post(route('patients.vital-signs.store', $this->patient), [
            'temperature_c' => 36.8,
            'blood_pressure_sys' => 118,
            'blood_pressure_dia' => 76,
            'heart_rate' => 72,
            'weight_kg' => 70,
            'height_cm' => 175,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    expect($this->patient->vitalSigns()->count())->toBe(1);
})->with(['doctor', 'secretary']);

it('blocks super_admin from recording vital signs', function () {
    $actor = User::factory()->superAdmin()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($actor)
        ->post(route('patients.vital-signs.store', $this->patient), [
            'temperature_c' => 36.5,
        ])
        ->assertForbidden();
});

it('lets a doctor record vitals for a patient in another clinic (Phase 8 global access)', function () {
    $otherClinic = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);

    $actor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($actor)
        ->post(route('patients.vital-signs.store', $otherPatient->id), [
            'temperature_c' => 36.5,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($otherPatient->vitalSigns()->count())->toBe(1);
});

it('computes the bmi GENERATED column on insert', function () {
    $actor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($actor)
        ->post(route('patients.vital-signs.store', $this->patient), [
            'weight_kg' => 70,
            'height_cm' => 175,
        ])
        ->assertSessionHasNoErrors();

    $bmi = (float) DB::table('vital_signs')
        ->where('patient_id', $this->patient->id)
        ->value('bmi');

    expect($bmi)->toEqualWithDelta(22.86, 0.01);
});

it('returns latest-first list on the vital-signs index', function () {
    $actor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    VitalSigns::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'recorded_at' => now()->subDays(2),
        'heart_rate' => 60,
    ]);
    VitalSigns::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'recorded_at' => now()->subDay(),
        'heart_rate' => 70,
    ]);
    VitalSigns::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'recorded_at' => now(),
        'heart_rate' => 80,
    ]);

    $this->actingAs($actor)
        ->get(route('patients.vital-signs.index', $this->patient))
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('patients/vital-signs')
            ->has('vital_signs.data', 3)
            ->where('vital_signs.data.0.heart_rate', 80)
            ->where('vital_signs.data.1.heart_rate', 70)
            ->where('vital_signs.data.2.heart_rate', 60)
        );
});

it('rejects out-of-range vitals with 422', function () {
    $actor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($actor)
        ->post(route('patients.vital-signs.store', $this->patient), [
            'temperature_c' => 99,
            'heart_rate' => 9999,
        ])
        ->assertSessionHasErrors(['temperature_c', 'heart_rate']);
});
