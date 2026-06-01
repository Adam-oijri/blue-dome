<?php

use App\Models\Clinic;
use App\Models\Inventory;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->clinic = Clinic::factory()->create();
});

it('lets a super-admin create inventory on the route clinic, not their own', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.inventory.store', $this->clinic), [
            'item_name' => 'Sterile Gauze',
            'category' => 'supplies',
            'quantity_in_stock' => 20,
            'min_stock_level' => 5,
            'unit' => 'box',
        ])
        ->assertSessionHasNoErrors();

    $item = Inventory::query()->where('item_name', 'Sterile Gauze')->first();

    expect($item)->not->toBeNull()
        ->and($item->clinic_id)->toBe($this->clinic->id)
        ->and($item->clinic_id)->not->toBe($this->superAdmin->clinic_id);
});

it('lets a super-admin update and delete a route-clinic item', function () {
    $item = Inventory::factory()->create(['clinic_id' => $this->clinic->id, 'item_name' => 'Old']);

    $this->actingAs($this->superAdmin)
        ->patch(route('super-admin.clinics.inventory.update', ['clinic' => $this->clinic->id, 'inventory' => $item->id]), [
            'item_name' => 'New Name',
        ])
        ->assertSessionHasNoErrors();
    expect($item->fresh()->item_name)->toBe('New Name');

    $this->actingAs($this->superAdmin)
        ->delete(route('super-admin.clinics.inventory.destroy', ['clinic' => $this->clinic->id, 'inventory' => $item->id]))
        ->assertSessionHasNoErrors();
    expect(Inventory::withTrashed()->find($item->id)->trashed())->toBeTrue();
});

it('404s when touching an item from a different clinic via the route clinic', function () {
    $other = Clinic::factory()->create();
    $item = Inventory::factory()->create(['clinic_id' => $other->id]);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.clinics.inventory.edit', ['clinic' => $this->clinic->id, 'inventory' => $item->id]))
        ->assertNotFound();
});

it('records a stock transaction on the route clinic', function () {
    $item = Inventory::factory()->create(['clinic_id' => $this->clinic->id, 'quantity_in_stock' => 10]);

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.clinics.inventory.transactions.store', ['clinic' => $this->clinic->id, 'inventory' => $item->id]), [
            'transaction_type' => 'purchase',
            'quantity' => 5,
        ])
        ->assertSessionHasNoErrors();

    expect($item->transactions()->where('transaction_type', 'purchase')->exists())->toBeTrue();
});

it('forbids doctor and secretary from clinic-scoped inventory routes', function (string $role) {
    $actor = User::factory()->{$role}()->create();

    $this->actingAs($actor)
        ->get(route('super-admin.clinics.inventory.index', $this->clinic))
        ->assertForbidden();
    $this->actingAs($actor)
        ->post(route('super-admin.clinics.inventory.store', $this->clinic), [
            'item_name' => 'X', 'category' => 'supplies',
        ])
        ->assertForbidden();
})->with(['doctor', 'secretary']);
