<?php

use App\Models\User;

/**
 * The super-admin restore routes bind {id}/{user} as plain strings on UUID-PK
 * models. A non-UUID id used to reach findOrFail and raise a Postgres
 * "invalid input syntax for type uuid" 500; it must return a clean 404.
 */
beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('returns 404 (not 500) restoring a user with a non-UUID id', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.users.restore', ['user' => 'not-a-uuid']))
        ->assertNotFound();
});

it('returns 404 (not 500) restoring a recycle entry with a non-UUID id', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.recycle.restore', ['type' => 'patient', 'id' => 'not-a-uuid']))
        ->assertNotFound();
});
