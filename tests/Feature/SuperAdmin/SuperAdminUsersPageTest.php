<?php

use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('renders the users page with all staff', function () {
    User::factory()->doctor()->count(2)->create();
    User::factory()->secretary()->create();

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.users'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/super-admin/users')
            ->has('users.data')
            ->has('clinics')
            ->has('kpis')
        );
});

it('filters users by role', function () {
    User::factory()->doctor()->create();
    User::factory()->secretary()->create();

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.users', ['role' => 'doctor']))
        ->assertInertia(fn ($page) => $page
            ->where('filters.role', 'doctor')
            ->where('users.data', fn ($users) => collect($users)->every(fn ($u) => $u['role'] === 'doctor'))
        );
});

it('filters by search query against email', function () {
    $found = User::factory()->doctor()->create(['email' => 'findme@test.local']);
    User::factory()->doctor()->create(['email' => 'someone@else.local']);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.users', ['search' => 'findme']))
        ->assertInertia(fn ($page) => $page
            ->where('users.total', 1)
            ->where('users.data.0.id', $found->id)
        );
});

it('blocks non-super-admin users with 403', function () {
    $doctor = User::factory()->doctor()->create();

    $this->actingAs($doctor)
        ->get(route('super-admin.users'))
        ->assertForbidden();
});
