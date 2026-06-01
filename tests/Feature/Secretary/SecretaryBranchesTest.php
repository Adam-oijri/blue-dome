<?php

use App\Models\Branch;
use App\Models\Clinic;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

/**
 * Create a branch for a clinic. Only one is_main=true branch is allowed per
 * clinic (unique partial index), so additional branches must pass is_main=false.
 *
 * @param  array<string, mixed>  $attributes
 */
function makeBranch(string $clinicId, string $code, bool $isMain, array $attributes = []): Branch
{
    return Branch::create(array_merge([
        'clinic_id' => $clinicId,
        'branch_name' => "Branch {$code}",
        'branch_code' => $code,
        'is_main' => $isMain,
    ], $attributes));
}

it('renders the secretary branches page with branches and totals', function () {
    makeBranch($this->clinic->id, 'MAIN', true);
    makeBranch($this->clinic->id, 'SEC', false);

    $this->actingAs($this->secretary)
        ->get(route('secretary.branches'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/branches')
            ->has('branches', 2)
            ->has('totals')
            ->where('totals.locations', 2)
        );
});

it('scopes branches to the secretary clinic', function () {
    makeBranch($this->clinic->id, 'MAIN', true);

    $otherClinic = Clinic::factory()->create();
    makeBranch($otherClinic->id, 'OTHER', true);

    $this->actingAs($this->secretary)
        ->get(route('secretary.branches'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('branches', 1)
            ->where('branches.0.branch_code', 'MAIN')
        );
});
