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
});

it('uploads a document, stores it under the clinic prefix, and persists metadata', function () {
    $admin = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($admin)->post(route('documents.store'), [
        'file' => UploadedFile::fake()->create('consent.pdf', 50, 'application/pdf'),
        'document_name' => 'Patient consent',
        'document_type' => 'consent_form',
        'entity_type' => 'Patient',
        'entity_id' => $this->patient->id,
    ])->assertSessionHasNoErrors();

    $document = Document::query()->latest('id')->first();

    expect($document)->not->toBeNull()
        ->and($document->clinic_id)->toBe($this->clinic->id)
        ->and($document->file_path)->toStartWith("clinics/{$this->clinic->id}/")
        ->and($document->mime_type)->toBe('application/pdf')
        ->and($document->uploaded_by)->toBe($admin->id);

    Storage::disk('local')->assertExists($document->file_path);
});

it('blocks cross-clinic document download', function () {
    $clinicA = $this->clinic;
    $clinicB = Clinic::factory()->create();

    $adminA = User::factory()->secretary()->create(['clinic_id' => $clinicA->id]);
    $adminB = User::factory()->secretary()->create(['clinic_id' => $clinicB->id]);

    $this->actingAs($adminA)->post(route('documents.store'), [
        'file' => UploadedFile::fake()->create('secret.pdf', 10, 'application/pdf'),
        'document_name' => 'Clinic A only',
        'document_type' => 'patient_record',
        'entity_type' => 'Patient',
        'entity_id' => $this->patient->id,
    ])->assertSessionHasNoErrors();

    $document = Document::query()->where('clinic_id', $clinicA->id)->first();

    $this->actingAs($adminB)
        ->get(route('documents.download', $document))
        ->assertForbidden();
});

it('blocks doctors from deleting documents (secretary only)', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    $document = Document::factory()->create([
        'clinic_id' => $this->clinic->id,
        'entity_id' => $this->patient->id,
    ]);

    $response = $this->actingAs($actor)->delete(route('documents.destroy', $document));

    if ($allowed) {
        $response->assertRedirect();
        expect($document->fresh()->trashed())->toBeTrue();
    } else {
        $response->assertForbidden();
        expect($document->fresh()->trashed())->toBeFalse();
    }
})->with([
    ['super_admin', false],
    ['doctor', false],
    ['secretary', true],
]);
