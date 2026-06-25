<?php

use App\Models\Clinic;
use App\Models\LabOrder;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('streams an analyses PDF for a doctor', function () {
    $labOrder = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
    ]);
    $labOrder->items()->create([
        'test_name' => 'Hemoglobin',
        'result' => '13.5',
        'unit' => 'g/dL',
        'normal_range' => '12-16',
        'result_status' => 'normal',
    ]);

    $response = $this->actingAs($this->doctor)->get(route('lab-orders.pdf', $labOrder));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
    expect(strlen((string) $response->getContent()))->toBeGreaterThan(500);
});

it('forbids a secretary from exporting an analyses PDF (doctor-only clinical record)', function () {
    $labOrder = LabOrder::factory()->create(['clinic_id' => $this->clinic->id]);
    $secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($secretary)->get(route('lab-orders.pdf', $labOrder))->assertForbidden();
});
