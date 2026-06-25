<?php

use App\Models\Clinic;
use App\Models\ExternalLab;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('creates an external lab from a typed name and links it to the order', function () {
    $this->actingAs($this->doctor)->post(route('lab-orders.store'), [
        'patient_id' => $this->patient->id,
        'external_lab_name' => 'BioLab Casablanca',
        'items' => [['test_name' => 'NFS']],
    ])->assertSessionHasNoErrors();

    $lab = ExternalLab::query()
        ->where('clinic_id', $this->clinic->id)
        ->where('lab_name', 'BioLab Casablanca')
        ->first();

    expect($lab)->not->toBeNull();
    expect($lab->is_active)->toBeTrue();

    $order = LabOrder::query()->where('patient_id', $this->patient->id)->firstOrFail();
    expect($order->external_lab_id)->toBe($lab->id);
});

it('treats an empty external lab name as internal (no external lab)', function () {
    $this->actingAs($this->doctor)->post(route('lab-orders.store'), [
        'patient_id' => $this->patient->id,
        'external_lab_name' => '',
        'items' => [['test_name' => 'NFS']],
    ])->assertSessionHasNoErrors();

    $order = LabOrder::query()->where('patient_id', $this->patient->id)->firstOrFail();
    expect($order->external_lab_id)->toBeNull();
    expect(ExternalLab::query()->where('clinic_id', $this->clinic->id)->count())->toBe(0);
});

it('reuses an existing external lab case-insensitively instead of duplicating it', function () {
    $existing = ExternalLab::create([
        'clinic_id' => $this->clinic->id,
        'lab_name' => 'BioLab',
        'is_active' => true,
    ]);

    $this->actingAs($this->doctor)->post(route('lab-orders.store'), [
        'patient_id' => $this->patient->id,
        'external_lab_name' => 'biolab',
        'items' => [['test_name' => 'NFS']],
    ])->assertSessionHasNoErrors();

    expect(ExternalLab::query()->where('clinic_id', $this->clinic->id)->count())->toBe(1);

    $order = LabOrder::query()->where('patient_id', $this->patient->id)->firstOrFail();
    expect($order->external_lab_id)->toBe($existing->id);
});

it('switches an order between external and internal on update', function () {
    $order = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $this->doctor->id,
        'external_lab_id' => null,
    ]);

    // Internal -> External (typed name).
    $this->actingAs($this->doctor)->put(route('lab-orders.update', $order), [
        'external_lab_name' => 'External Imaging Center',
    ])->assertSessionHasNoErrors();

    $order->refresh();
    expect($order->external_lab_id)->not->toBeNull();
    expect($order->externalLab->lab_name)->toBe('External Imaging Center');

    // External -> Internal (cleared name).
    $this->actingAs($this->doctor)->put(route('lab-orders.update', $order), [
        'external_lab_name' => '',
    ])->assertSessionHasNoErrors();

    expect($order->fresh()->external_lab_id)->toBeNull();
});
