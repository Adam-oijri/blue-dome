<?php

use App\Models\Clinic;
use App\Models\Document;
use App\Models\DocumentFolder;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('documents index renders real documents + upload selectors', function () {
    Document::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->doctor)
        ->get(route('documents.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('documents/index')
            ->has('documents.data', 1)
            ->has('patients')
            ->has('folders')
        );
});

it('uploads a document attached to a patient and stores the file', function () {
    Storage::fake('local');

    $this->actingAs($this->doctor)
        ->post(route('documents.store'), [
            'file' => UploadedFile::fake()->create('report.pdf', 120, 'application/pdf'),
            'document_name' => 'Lab report',
            'document_type' => 'lab_result',
            'entity_type' => 'Patient',
            'entity_id' => $this->patient->id,
        ])
        ->assertSessionHasNoErrors();

    $doc = Document::query()
        ->where('clinic_id', $this->clinic->id)
        ->where('document_name', 'Lab report')
        ->first();

    expect($doc)->not->toBeNull();
    Storage::disk('local')->assertExists($doc->file_path);
});

it('document-folders index lists folders', function () {
    DocumentFolder::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->doctor)
        ->get(route('document-folders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('document-folders/index')
            ->has('folders.data', 1)
        );
});
