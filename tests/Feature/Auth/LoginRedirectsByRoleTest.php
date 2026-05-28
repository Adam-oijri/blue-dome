<?php

use App\Models\User;

/**
 * Each role lands on its own panel after login. LoginResponse uses
 * Inertia::location, which sends a 409 with an X-Inertia-Location header;
 * for a vanilla POST the redirect is a 302 to the same target.
 */
it('redirects super_admin to /super-admin', function () {
    $user = User::factory()->superAdmin()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('super-admin.dashboard'));
    $this->assertAuthenticatedAs($user);
});

it('redirects doctor to /doctor', function () {
    $user = User::factory()->doctor()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('doctor.dashboard'));
    $this->assertAuthenticatedAs($user);
});

it('redirects secretary to /secretary', function () {
    $user = User::factory()->secretary()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('secretary.dashboard'));
    $this->assertAuthenticatedAs($user);
});

it('rejects a secretary from the /super-admin panel', function () {
    $secretary = User::factory()->secretary()->create();

    $this->actingAs($secretary)
        ->get(route('super-admin.dashboard'))
        ->assertForbidden();
});

it('rejects a doctor from the /super-admin panel', function () {
    $doctor = User::factory()->doctor()->create();

    $this->actingAs($doctor)
        ->get(route('super-admin.dashboard'))
        ->assertForbidden();
});
