<?php

use App\Models\Clinic;
use App\Models\Inventory;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * v_inventory_alerts is a Postgres view that filters inventory rows to
 * those that need attention and tags each with an alert_type:
 *   out_of_stock | low_stock | expired | expiring_soon | ok
 *
 * The controller's `alerts()` reads this view and orders by severity.
 */
beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->admin = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('surfaces low-stock items via the alerts view', function () {
    Inventory::factory()->lowStock()->create([
        'clinic_id' => $this->clinic->id,
        'item_name' => 'Bandages',
    ]);
    Inventory::factory()->create([
        'clinic_id' => $this->clinic->id,
        'item_name' => 'Healthy Stock',
        'quantity_in_stock' => 100,
        'min_stock_level' => 5,
    ]);

    $rows = DB::table('v_inventory_alerts')
        ->where('clinic_id', $this->clinic->id)
        ->get();

    expect($rows)->toHaveCount(1)
        ->and($rows->first()->item_name)->toBe('Bandages')
        ->and($rows->first()->alert_type)->toBe('low_stock');
});

it('surfaces expiring-soon items via the alerts view', function () {
    Inventory::factory()->expiringSoon()->create([
        'clinic_id' => $this->clinic->id,
        'item_name' => 'Insulin',
        'quantity_in_stock' => 50,
        'min_stock_level' => 5,
    ]);

    $rows = DB::table('v_inventory_alerts')
        ->where('clinic_id', $this->clinic->id)
        ->get();

    expect($rows)->toHaveCount(1)
        ->and($rows->first()->item_name)->toBe('Insulin')
        ->and($rows->first()->alert_type)->toBe('expiring_soon');
});

it('tags out-of-stock items with out_of_stock', function () {
    Inventory::factory()->create([
        'clinic_id' => $this->clinic->id,
        'item_name' => 'Empty',
        'quantity_in_stock' => 0,
        'min_stock_level' => 5,
    ]);

    $row = DB::table('v_inventory_alerts')
        ->where('clinic_id', $this->clinic->id)
        ->first();

    expect($row->alert_type)->toBe('out_of_stock');
});

it('lets the secretary reach the alerts endpoint', function () {
    Inventory::factory()->lowStock()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->admin)
        ->get(route('inventory.alerts'))
        ->assertSuccessful();
});
