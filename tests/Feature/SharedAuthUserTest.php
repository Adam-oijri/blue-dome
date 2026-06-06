<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the authenticated user is shared to the frontend with the fields the sidebar renders', function () {
    $user = User::factory()->superAdmin()->create();

    $this->actingAs($user)
        ->get(route('super-admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.id', $user->id)
            ->where('auth.user.first_name', $user->first_name)
            ->where('auth.user.last_name', $user->last_name)
            ->where('auth.user.role', 'super_admin')
        );
});
