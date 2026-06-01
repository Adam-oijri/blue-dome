<?php

use App\Models\Clinic;
use App\Models\SecretaryChecklistCustomItem;
use App\Models\SecretaryChecklistItem;
use App\Models\User;
use Carbon\CarbonImmutable;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('adds a custom checklist item and exposes it on the dashboard', function () {
    $this->actingAs($this->secretary)
        ->post(route('secretary.checklist.items.store'), ['label' => 'Water the plants'])
        ->assertRedirect();

    $item = SecretaryChecklistCustomItem::query()
        ->where('user_id', $this->secretary->id)
        ->first();

    expect($item)->not->toBeNull()
        ->and($item->label)->toBe('Water the plants');

    $this->actingAs($this->secretary)
        ->get(route('secretary.dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('checklist_custom.0.id', $item->id)
            ->where('checklist_custom.0.label', 'Water the plants')
        );
});

it('toggles a custom item by its id', function () {
    $item = SecretaryChecklistCustomItem::factory()->create([
        'clinic_id' => $this->clinic->id,
        'user_id' => $this->secretary->id,
    ]);

    $this->actingAs($this->secretary)
        ->post(route('secretary.checklist.toggle'), ['item_key' => $item->id])
        ->assertRedirect();

    expect(SecretaryChecklistItem::query()
        ->where('user_id', $this->secretary->id)
        ->where('item_key', $item->id)
        ->exists())->toBeTrue();
});

it('removes a custom item and its completions', function () {
    $item = SecretaryChecklistCustomItem::factory()->create([
        'clinic_id' => $this->clinic->id,
        'user_id' => $this->secretary->id,
    ]);
    SecretaryChecklistItem::factory()->create([
        'clinic_id' => $this->clinic->id,
        'user_id' => $this->secretary->id,
        'checklist_date' => CarbonImmutable::today()->toDateString(),
        'item_key' => $item->id,
    ]);

    $this->actingAs($this->secretary)
        ->delete(route('secretary.checklist.items.destroy', ['item' => $item->id]))
        ->assertRedirect();

    expect(SecretaryChecklistCustomItem::query()->whereKey($item->id)->exists())->toBeFalse()
        ->and(SecretaryChecklistItem::query()->where('item_key', $item->id)->exists())->toBeFalse();
});

it('forbids deleting another secretary custom item', function () {
    $other = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $item = SecretaryChecklistCustomItem::factory()->create([
        'clinic_id' => $this->clinic->id,
        'user_id' => $other->id,
    ]);

    $this->actingAs($this->secretary)
        ->delete(route('secretary.checklist.items.destroy', ['item' => $item->id]))
        ->assertForbidden();

    expect(SecretaryChecklistCustomItem::query()->whereKey($item->id)->exists())->toBeTrue();
});

it('rejects toggling a custom item the secretary does not own', function () {
    $other = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $item = SecretaryChecklistCustomItem::factory()->create([
        'clinic_id' => $this->clinic->id,
        'user_id' => $other->id,
    ]);

    $this->actingAs($this->secretary)
        ->post(route('secretary.checklist.toggle'), ['item_key' => $item->id])
        ->assertSessionHasErrors('item_key');
});

it('exposes the secretary completed checklist items on the dashboard', function () {
    SecretaryChecklistItem::factory()->create([
        'clinic_id' => $this->clinic->id,
        'user_id' => $this->secretary->id,
        'checklist_date' => CarbonImmutable::today()->toDateString(),
        'item_key' => 'cl_open_drawer',
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/dashboard')
            ->where('checklist_done', ['cl_open_drawer'])
        );
});

it('toggles a checklist item on and back off', function () {
    $payload = ['item_key' => 'cl_reconcile'];

    // First toggle marks it done.
    $this->actingAs($this->secretary)
        ->post(route('secretary.checklist.toggle'), $payload)
        ->assertRedirect();

    expect(SecretaryChecklistItem::query()
        ->where('user_id', $this->secretary->id)
        ->where('item_key', 'cl_reconcile')
        ->exists())->toBeTrue();

    // Second toggle clears it.
    $this->actingAs($this->secretary)
        ->post(route('secretary.checklist.toggle'), $payload)
        ->assertRedirect();

    expect(SecretaryChecklistItem::query()
        ->where('user_id', $this->secretary->id)
        ->where('item_key', 'cl_reconcile')
        ->exists())->toBeFalse();
});

it('rejects checklist keys outside the whitelist', function () {
    $this->actingAs($this->secretary)
        ->post(route('secretary.checklist.toggle'), ['item_key' => 'cl_inject_evil'])
        ->assertSessionHasErrors('item_key');

    expect(SecretaryChecklistItem::query()->count())->toBe(0);
});

it('only shows the acting secretary their own completed items', function () {
    $other = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    SecretaryChecklistItem::factory()->create([
        'clinic_id' => $this->clinic->id,
        'user_id' => $other->id,
        'checklist_date' => CarbonImmutable::today()->toDateString(),
        'item_key' => 'cl_lock_drawer',
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.dashboard'))
        ->assertInertia(fn ($page) => $page->where('checklist_done', []));
});
