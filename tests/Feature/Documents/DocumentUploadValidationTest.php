<?php

use App\Models\Clinic;
use App\Models\Document;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

function uploadFile($test, UploadedFile $file)
{
    return $test->actingAs($test->secretary)->post(route('documents.store'), [
        'file' => $file,
        'document_name' => 'Audit upload',
        'document_type' => 'lab_result',
        'entity_type' => 'Patient',
        'entity_id' => $test->patient->id,
    ]);
}

it('accepts a PDF upload', function () {
    uploadFile($this, UploadedFile::fake()->create('report.pdf', 120, 'application/pdf'))
        ->assertSessionHasNoErrors();
});

it('accepts a PNG image upload', function () {
    uploadFile($this, UploadedFile::fake()->image('scan.png'))
        ->assertSessionHasNoErrors();
});

it('rejects a disallowed file type', function () {
    uploadFile($this, UploadedFile::fake()->create('note.txt', 5, 'text/plain'))
        ->assertSessionHasErrors('file');
});

it('serves a stored document inline for preview', function () {
    uploadFile($this, UploadedFile::fake()->create('preview.pdf', 30, 'application/pdf'))
        ->assertSessionHasNoErrors();

    $document = Document::query()->where('clinic_id', $this->clinic->id)->latest('id')->firstOrFail();

    $response = $this->actingAs($this->secretary)->get(route('documents.preview', $document));

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('inline');
});
