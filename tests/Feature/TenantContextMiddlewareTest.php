<?php

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/**
 * Confirms SetTenantContext writes the three Postgres GUCs the RLS policies
 * read. A throwaway route inside the test echoes the GUC state back so the
 * assertion is end-to-end rather than reaching into middleware internals.
 */
beforeEach(function () {
    Route::middleware('web')->get('/__test/tenant-ping', function () {
        return [
            'clinic_id' => DB::selectOne("SELECT current_setting('app.current_clinic_id', true) AS v")->v,
            'user_id' => DB::selectOne("SELECT current_setting('app.current_user_id', true) AS v")->v,
            'is_super_admin' => DB::selectOne("SELECT current_setting('app.is_super_admin', true) AS v")->v,
        ];
    });
});

it('sets the three GUCs for an authenticated secretary', function () {
    $clinic = Clinic::factory()->create();
    $user = User::factory()->secretary()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->getJson('/__test/tenant-ping');

    $response->assertOk();
    expect($response->json('clinic_id'))->toBe($clinic->id);
    expect($response->json('user_id'))->toBe($user->id);
    expect($response->json('is_super_admin'))->toBe('false');
});

it('flips is_super_admin for a super_admin user', function () {
    $clinic = Clinic::factory()->create();
    $user = User::factory()->superAdmin()->create(['clinic_id' => $clinic->id]);

    $response = $this->actingAs($user)->getJson('/__test/tenant-ping');

    $response->assertOk();
    expect($response->json('is_super_admin'))->toBe('true');
});

it('leaves the GUCs empty when no user is authenticated', function () {
    // The shared beforeEach in tests/Pest.php sets app.is_super_admin so
    // factories can bypass RLS. Pre-set the GUCs here to prove the middleware
    // CLEARS them for an unauthenticated request — session-scoped GUCs persist
    // on a reused connection, so a guest must not inherit a prior user's tenant.
    DB::statement("SELECT set_config('app.current_user_id', '', true)");
    DB::statement("SELECT set_config('app.current_clinic_id', '', true)");
    DB::statement("SELECT set_config('app.is_super_admin', '', true)");

    $response = $this->getJson('/__test/tenant-ping');

    $response->assertOk();
    expect($response->json('clinic_id'))->toBeEmpty();
    expect($response->json('user_id'))->toBeEmpty();
    expect($response->json('is_super_admin'))->toBeEmpty();
});
