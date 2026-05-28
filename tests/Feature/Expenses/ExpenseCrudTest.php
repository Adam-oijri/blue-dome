<?php

use App\Models\Clinic;
use App\Models\Expense;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
});

it('lets secretary and super_admin list expenses but blocks doctor', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);
    Expense::factory()->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->get(route('expenses.index'));

    if ($allowed) {
        $response->assertSuccessful();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', true],
    ['doctor', false],
    ['secretary', true],
]);

it('only the secretary can create expenses', function (string $role, bool $allowed) {
    $actor = User::factory()->state(['role' => $role])->create(['clinic_id' => $this->clinic->id]);

    $response = $this->actingAs($actor)->post(route('expenses.store'), [
        'category' => 'supplies',
        'amount' => 1500,
        'description' => 'Test',
    ]);

    if ($allowed) {
        $response->assertSessionHasNoErrors();
        expect(Expense::query()->where('description', 'Test')->exists())->toBeTrue();
    } else {
        $response->assertForbidden();
    }
})->with([
    ['super_admin', false],
    ['doctor', false],
    ['secretary', true],
]);

it('allocates expense_number with EXP- prefix on create', function () {
    $admin = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($admin)->post(route('expenses.store'), [
        'category' => 'rent',
        'amount' => 5000,
    ])->assertSessionHasNoErrors();

    $expense = Expense::query()->where('clinic_id', $this->clinic->id)->first();
    expect($expense->expense_number)->toMatch('/^EXP-\d{6}$/');
});
