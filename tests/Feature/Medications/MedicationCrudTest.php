<?php

use App\Models\Clinic;
use App\Models\Medication;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
});

it('lets all clinic staff and super_admin list medications', function (string $role) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    Medication::factory()->count(3)->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($actor)
        ->get(route('medications.index'))
        ->assertSuccessful();
})->with(['super_admin', 'doctor', 'secretary']);

it('lets the secretary create medications but blocks doctor/super_admin', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->post(route('medications.store'), [
        'trade_name' => 'NewMed',
        'generic_name' => 'newgeneric',
        'form' => 'tablet',
        'strength' => '100mg',
    ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect(Medication::query()->where('trade_name', 'NewMed')->exists())->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', false],
    ['doctor', false],
    ['secretary', true],
]);

it('finds medications via fuzzy search powered by the pg_trgm index', function () {
    $admin = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    Medication::factory()->create(['clinic_id' => $this->clinic->id, 'trade_name' => 'Amoxicilline 500mg']);
    Medication::factory()->create(['clinic_id' => $this->clinic->id, 'trade_name' => 'Doliprane 500mg']);

    $response = $this->actingAs($admin)
        ->get(route('medications.index', ['q' => 'amox']));

    $response->assertSuccessful();
    $payload = $response->viewData('page')['props']['medications']['data'];

    expect(collect($payload)->pluck('trade_name')->all())->toContain('Amoxicilline 500mg');
});

it('rejects duplicate trade_name+strength+form within the same clinic', function () {
    $admin = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    Medication::factory()->create([
        'clinic_id' => $this->clinic->id,
        'trade_name' => 'Doliprane',
        'strength' => '500mg',
        'form' => 'tablet',
    ]);

    $this->actingAs($admin)->post(route('medications.store'), [
        'trade_name' => 'Doliprane',
        'strength' => '500mg',
        'form' => 'tablet',
    ])->assertSessionHasErrors('trade_name');
});
