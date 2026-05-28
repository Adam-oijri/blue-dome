<?php

use App\Models\Clinic;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\User;

/**
 * The schema does NOT ship a trigger to sync inventory.quantity_in_stock
 * with inventory_transactions — that math lives in
 * App\Observers\InventoryTransactionObserver. These tests prove the
 * directionality table works: purchase / return → +; sale / consumption
 * / expired / damaged / transfer → −.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->admin = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->actingAs($this->admin);
});

it('adds to stock on purchase transaction', function () {
    $item = Inventory::factory()->create([
        'clinic_id' => $this->clinic->id,
        'quantity_in_stock' => 10,
    ]);

    $this->post(route('inventory.transactions.store', $item), [
        'transaction_type' => 'purchase',
        'quantity' => 25,
        'unit_price' => 12.5,
    ])->assertSessionHasNoErrors();

    expect((float) $item->fresh()->quantity_in_stock)->toEqual(35.0);
});

it('subtracts from stock on consumption transaction', function () {
    $item = Inventory::factory()->create([
        'clinic_id' => $this->clinic->id,
        'quantity_in_stock' => 50,
    ]);

    $this->post(route('inventory.transactions.store', $item), [
        'transaction_type' => 'consumption',
        'quantity' => 12,
    ])->assertSessionHasNoErrors();

    expect((float) $item->fresh()->quantity_in_stock)->toEqual(38.0);
});

it('subtracts from stock on sale transaction', function () {
    $item = Inventory::factory()->create([
        'clinic_id' => $this->clinic->id,
        'quantity_in_stock' => 100,
    ]);

    $this->post(route('inventory.transactions.store', $item), [
        'transaction_type' => 'sale',
        'quantity' => 7,
    ])->assertSessionHasNoErrors();

    expect((float) $item->fresh()->quantity_in_stock)->toEqual(93.0);
});

it('allows negative adjustment to remove stock', function () {
    $item = Inventory::factory()->create([
        'clinic_id' => $this->clinic->id,
        'quantity_in_stock' => 20,
    ]);

    InventoryTransaction::create([
        'inventory_id' => $item->id,
        'clinic_id' => $this->clinic->id,
        'transaction_type' => 'adjustment',
        'quantity' => -3,
        'transaction_date' => now()->toDateString(),
    ]);

    expect((float) $item->fresh()->quantity_in_stock)->toEqual(17.0);
});

it('blocks doctors from creating inventory transactions', function () {
    $item = Inventory::factory()->create(['clinic_id' => $this->clinic->id]);
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($doctor)
        ->post(route('inventory.transactions.store', $item), [
            'transaction_type' => 'purchase',
            'quantity' => 10,
        ])
        ->assertForbidden();
});
