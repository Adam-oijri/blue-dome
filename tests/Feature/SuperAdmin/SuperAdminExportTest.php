<?php

use App\Models\Clinic;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('exports users as CSV honoring the role filter', function () {
    $clinic = Clinic::factory()->create();
    User::factory()->doctor()->create(['clinic_id' => $clinic->id, 'first_name' => 'Docca', 'last_name' => 'Tor']);
    User::factory()->secretary()->create(['clinic_id' => $clinic->id, 'first_name' => 'Secca', 'last_name' => 'Retary']);

    $response = $this->actingAs($this->superAdmin)
        ->get(route('super-admin.users.export', ['role' => 'doctor']));

    $response->assertOk();
    $csv = $response->streamedContent();

    expect($csv)->toContain('Docca Tor')
        ->and($csv)->not->toContain('Secca Retary');
});

it('exports only the selected ids when ids[] is provided', function () {
    $a = User::factory()->secretary()->create(['first_name' => 'Alphaa']);
    $b = User::factory()->secretary()->create(['first_name' => 'Betaa']);

    $response = $this->actingAs($this->superAdmin)
        ->get(route('super-admin.users.export', ['ids' => [$a->id]]));

    $csv = $response->streamedContent();

    expect($csv)->toContain('Alphaa')
        ->and($csv)->not->toContain('Betaa');
});

it('guards CSV cells against formula injection', function () {
    Clinic::factory()->create(['name' => '=cmd|danger']);

    $response = $this->actingAs($this->superAdmin)
        ->get(route('super-admin.clinics.export'));

    expect($response->streamedContent())->toContain("'=cmd|danger");
});

it('forbids doctor and secretary from every export', function (string $role) {
    $actor = User::factory()->{$role}()->create();

    foreach ([
        'super-admin.users.export',
        'super-admin.clinics.export',
        'super-admin.appointments.export',
        'super-admin.doctors.export',
        'super-admin.finance.export',
    ] as $name) {
        $this->actingAs($actor)->get(route($name))->assertForbidden();
    }
})->with(['doctor', 'secretary']);

it('lets a super-admin reach every export', function () {
    foreach ([
        'super-admin.users.export',
        'super-admin.clinics.export',
        'super-admin.appointments.export',
        'super-admin.doctors.export',
        'super-admin.finance.export',
    ] as $name) {
        $this->actingAs($this->superAdmin)->get(route($name))->assertOk();
    }
});
