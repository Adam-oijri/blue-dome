<?php

use App\Models\Clinic;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('filters clinics on the index by search query', function () {
    $found = Clinic::factory()->create(['name' => 'Acme Health Center']);
    Clinic::factory()->create(['name' => 'Beta Practice']);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.clinics.index', ['search' => 'Acme']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('clinics.total', 1)
            ->where('clinics.data.0.id', $found->id)
            ->where('filters.search', 'Acme')
        );
});

it('filters clinics on the index by status', function () {
    Clinic::factory()->create(['subscription_status' => 'active']);
    Clinic::factory()->create(['subscription_status' => 'suspended']);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.clinics.index', ['status' => 'suspended']))
        ->assertInertia(fn ($page) => $page
            ->where('clinics.data', fn ($rows) => collect($rows)->every(fn ($r) => $r['subscription_status'] === 'suspended'))
        );
});

it('exposes the clinic manager id on the clinic show page', function () {
    $clinic = Clinic::factory()->create();
    $manager = User::factory()->secretary()->create(['clinic_id' => $clinic->id]);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.clinics.show', ['clinic' => $clinic->id]))
        ->assertInertia(fn ($page) => $page
            ->where('manager.id', $manager->id)
        );
});
