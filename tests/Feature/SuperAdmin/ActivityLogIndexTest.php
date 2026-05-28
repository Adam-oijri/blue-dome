<?php

use App\Models\ActivityLog;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

it('shows cross-tenant activity rows to a super_admin', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();
    $clinicC = Clinic::factory()->create();

    foreach ([$clinicA, $clinicB, $clinicC] as $clinic) {
        Patient::factory()->create(['clinic_id' => $clinic->id]);
    }

    $response = $this->actingAs($superAdmin)->get(route('super-admin.activity-log'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('activity.data')
        ->where('activity.total', fn ($total) => $total >= 3)
    );

    $rowsForClinics = ActivityLog::query()
        ->whereIn('clinic_id', [$clinicA->id, $clinicB->id, $clinicC->id])
        ->where('action', 'create')
        ->where('entity_type', 'Patient')
        ->pluck('clinic_id')
        ->unique()
        ->values();

    expect($rowsForClinics)->toHaveCount(3);
});

it('rejects a doctor reading the cross-tenant activity log', function () {
    $doctor = User::factory()->doctor()->create();

    $this->actingAs($doctor)
        ->get(route('super-admin.activity-log'))
        ->assertForbidden();
});
