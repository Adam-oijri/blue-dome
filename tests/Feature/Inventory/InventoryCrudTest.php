<?php

use App\Models\Branch;
use App\Models\Clinic;
use App\Models\Inventory;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
});

it('lets secretary / super_admin create an inventory item but blocks the doctor', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->post(route('inventory.store'), [
        'item_name' => 'Sterile Gauze',
        'category' => 'supplies',
        'quantity_in_stock' => 20,
        'min_stock_level' => 5,
        'unit' => 'box',
    ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        expect(
            Inventory::query()
                ->where('clinic_id', $this->clinic->id)
                ->where('item_name', 'Sterile Gauze')
                ->exists()
        )->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', true],
    ['secretary', true],
    ['doctor', false],
]);

it('lets secretary / super_admin edit an inventory item but blocks the doctor', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    $item = Inventory::factory()->create([
        'clinic_id' => $this->clinic->id,
        'item_name' => 'Old name',
    ]);

    $response = $this->actingAs($actor)
        ->put(route('inventory.update', $item), [
            'item_name' => 'New name',
            'min_stock_level' => 12,
        ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        expect($item->fresh()->item_name)->toBe('New name');
    } else {
        $response->assertForbidden();
        expect($item->fresh()->item_name)->toBe('Old name');
    }
})->with([
    ['super_admin', true],
    ['secretary', true],
    ['doctor', false],
]);

it('blocks a secretary from editing inventory in another clinic', function () {
    $otherClinic = Clinic::factory()->create();
    $item = Inventory::factory()->create(['clinic_id' => $otherClinic->id]);

    $secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($secretary)
        ->put(route('inventory.update', $item), ['item_name' => 'Hacked'])
        ->assertForbidden();
});

it('filters the inventory list by branch', function () {
    $secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $branchA = Branch::create([
        'clinic_id' => $this->clinic->id,
        'branch_name' => 'Branch A',
        'is_main' => false,
        'is_active' => true,
    ]);
    $branchB = Branch::create([
        'clinic_id' => $this->clinic->id,
        'branch_name' => 'Branch B',
        'is_main' => false,
        'is_active' => true,
    ]);

    Inventory::factory()->create([
        'clinic_id' => $this->clinic->id,
        'branch_id' => $branchA->id,
        'item_name' => 'In A',
    ]);
    Inventory::factory()->create([
        'clinic_id' => $this->clinic->id,
        'branch_id' => $branchB->id,
        'item_name' => 'In B',
    ]);

    $this->actingAs($secretary)
        ->get(route('inventory.index', ['branch' => $branchA->id]))
        ->assertInertia(fn ($page) => $page
            ->component('inventory/index')
            ->has('inventory.data', 1)
            ->where('inventory.data.0.item_name', 'In A')
            ->where('filters.branch', $branchA->id));
});
