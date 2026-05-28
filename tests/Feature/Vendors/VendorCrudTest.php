<?php

use App\Models\Clinic;
use App\Models\User;
use App\Models\Vendor;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
});

it('only the secretary can create vendors', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->post(route('vendors.store'), [
        'vendor_name' => 'New Supplier',
        'category' => 'supplies',
    ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        expect(Vendor::query()->where('vendor_name', 'New Supplier')->exists())->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', false],
    ['doctor', false],
    ['secretary', true],
]);
