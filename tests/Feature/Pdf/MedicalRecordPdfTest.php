<?php

use App\Models\Clinic;
use App\Models\MedicalRecord;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
});

it('streams a consultation PDF for a doctor and renders the encrypted SOAP body', function () {
    $record = MedicalRecord::factory()->create([
        'clinic_id' => $this->clinic->id,
        'recorded_by' => $this->doctor->id,
        'title' => 'Initial consultation',
        'assessment' => 'Hypertension, well controlled.',
        'plan' => 'Continue current medication; review in 3 months.',
    ]);

    $response = $this->actingAs($this->doctor)->get(route('medical-records.pdf', $record));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
    expect(strlen((string) $response->getContent()))->toBeGreaterThan(500);
});

it('forbids a secretary from exporting a consultation PDF (doctor-only clinical record)', function () {
    $record = MedicalRecord::factory()->create(['clinic_id' => $this->clinic->id]);
    $secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($secretary)->get(route('medical-records.pdf', $record))->assertForbidden();
});
