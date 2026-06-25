<?php

use App\Models\Clinic;
use App\Models\Document;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
});

it('lets doctors and super admins list lab orders', function (string $role) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
    ]);

    $this->actingAs($actor)
        ->get(route('lab-orders.index'))
        ->assertSuccessful();
})->with(['super_admin', 'doctor']);

it('blocks the secretary from lab orders (clinical separation)', function () {
    $secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $order = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
    ]);

    $this->actingAs($secretary)->get(route('lab-orders.index'))->assertForbidden();
    $this->actingAs($secretary)->get(route('lab-orders.show', $order))->assertForbidden();
});

it('only lets doctors create lab orders', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    if ($role !== 'doctor') {
        // Ensure at least one doctor exists for FK if not the actor.
        User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    }

    $response = $this->actingAs($actor)->post(route('lab-orders.store'), [
        'patient_id' => $this->patient->id,
        'urgency' => 'routine',
        'items' => [['test_name' => 'NFS']],
    ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect(LabOrder::query()->where('patient_id', $this->patient->id)->exists())->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', false],
    ['doctor', true],
    ['secretary', false],
]);

it('lets only doctors record results, blocks others', function (string $role, bool $allowed) {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $order = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $doctor->id,
    ]);
    $item = $order->items()->create(['test_name' => 'NFS', 'result_status' => 'pending']);

    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->post(route('lab-orders.results', $order), [
        'items' => [[
            'id' => $item->id,
            'result' => 'Normal',
            'result_status' => 'normal',
            'result_date' => now()->toDateString(),
        ]],
    ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        expect($item->fresh()->result)->toBe('Normal');
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', false],
    ['doctor', true],
    ['secretary', false],
]);

it('lets a doctor order labs for a patient from another clinic (Phase 8 global access)', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $other = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $other->id]);

    $this->actingAs($doctor)->post(route('lab-orders.store'), [
        'patient_id' => $otherPatient->id,
        'items' => [['test_name' => 'NFS']],
    ])->assertSessionHasNoErrors();

    $labOrder = LabOrder::query()
        ->where('patient_id', $otherPatient->id)
        ->first();

    expect($labOrder)->not->toBeNull();
    expect($labOrder->clinic_id)->toBe($this->clinic->id);
});

it('uploads images to storage and attaches them to the lab order as documents', function () {
    Storage::fake('local');
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($doctor)->post(route('lab-orders.store'), [
        'patient_id' => $this->patient->id,
        'items' => [['test_name' => 'NFS']],
        'images' => [
            UploadedFile::fake()->image('result-1.jpg'),
            UploadedFile::fake()->image('result-2.png'),
        ],
    ])->assertSessionHasNoErrors();

    $labOrder = LabOrder::query()->where('patient_id', $this->patient->id)->firstOrFail();

    $docs = Document::query()
        ->where('entity_type', 'LabOrder')
        ->where('entity_id', $labOrder->id)
        ->get();

    expect($docs)->toHaveCount(2);
    expect($docs->pluck('document_type')->unique()->all())->toBe(['lab_result']);

    foreach ($docs as $doc) {
        expect($doc->clinic_id)->toBe($this->clinic->id);
        Storage::disk('local')->assertExists($doc->file_path);
    }
});

it('attaches uploaded images when editing a lab order', function () {
    Storage::fake('local');
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $order = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $doctor->id,
        'status' => 'pending',
    ]);

    $this->actingAs($doctor)->put(route('lab-orders.update', $order), [
        'status' => 'in_progress',
        'images' => [UploadedFile::fake()->image('scan.jpg')],
    ])->assertSessionHasNoErrors();

    expect($order->fresh()->status)->toBe('in_progress');

    $doc = Document::query()
        ->where('entity_type', 'LabOrder')
        ->where('entity_id', $order->id)
        ->first();

    expect($doc)->not->toBeNull();
    expect($doc->document_type)->toBe('lab_result');
    Storage::disk('local')->assertExists($doc->file_path);
});

it('lists attached images and PDFs on the lab order show page', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $order = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $this->patient->id,
        'doctor_id' => $doctor->id,
    ]);

    foreach ([
        ['name' => 'result.jpg', 'mime' => 'image/jpeg'],
        ['name' => 'report.pdf', 'mime' => 'application/pdf'],
    ] as $file) {
        Document::create([
            'clinic_id' => $this->clinic->id,
            'document_name' => $file['name'],
            'document_type' => 'lab_result',
            'file_name' => $file['name'],
            'file_path' => "clinics/{$this->clinic->id}/{$file['name']}",
            'mime_type' => $file['mime'],
            'entity_type' => 'LabOrder',
            'entity_id' => $order->id,
            'is_private' => true,
            'uploaded_by' => $doctor->id,
            'uploaded_at' => now(),
        ]);
    }

    $this->actingAs($doctor)
        ->get(route('lab-orders.show', $order))
        ->assertInertia(fn ($page) => $page
            ->component('lab-orders/show')
            ->has('images', 2));
});

it('accepts a PDF upload and attaches it as a document', function () {
    Storage::fake('local');
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($doctor)->post(route('lab-orders.store'), [
        'patient_id' => $this->patient->id,
        'items' => [['test_name' => 'NFS']],
        'images' => [UploadedFile::fake()->create('notes.pdf', 100, 'application/pdf')],
    ])->assertSessionHasNoErrors();

    $labOrder = LabOrder::query()->where('patient_id', $this->patient->id)->firstOrFail();

    $doc = Document::query()
        ->where('entity_type', 'LabOrder')
        ->where('entity_id', $labOrder->id)
        ->firstOrFail();

    expect($doc->mime_type)->toBe('application/pdf');
    expect($doc->document_type)->toBe('lab_result');
    Storage::disk('local')->assertExists($doc->file_path);
});

it('rejects a disallowed file type on a lab order', function () {
    Storage::fake('local');
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($doctor)->post(route('lab-orders.store'), [
        'patient_id' => $this->patient->id,
        'items' => [['test_name' => 'NFS']],
        'images' => [UploadedFile::fake()->create('malware.txt', 10, 'text/plain')],
    ])->assertSessionHasErrors('images.0');
});
