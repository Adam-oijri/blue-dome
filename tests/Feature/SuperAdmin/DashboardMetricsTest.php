<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('counts total clinics across all subscription states', function () {
    Clinic::factory()->count(3)->create(['subscription_status' => 'active']);
    Clinic::factory()->create(['subscription_status' => 'trial']);
    Clinic::factory()->create(['subscription_status' => 'suspended']);

    $response = $this->actingAs($this->superAdmin)->get(route('super-admin.dashboard'));

    $response->assertOk();
    // +1 for the super_admin's own clinic created by the UserFactory.
    $response->assertInertia(fn ($page) => $page
        ->has('metrics.total_clinics')
        ->where('metrics.total_clinics', 6)
    );
});

it('excludes suspended clinics from active count', function () {
    Clinic::factory()->count(3)->create(['subscription_status' => 'active']);
    Clinic::factory()->create(['subscription_status' => 'trial']);
    Clinic::factory()->create(['subscription_status' => 'suspended', 'is_active' => false]);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.dashboard'))
        ->assertInertia(fn ($page) => $page
            // 3 active + 1 trial + super_admin's own (trial default) = 5
            ->where('metrics.active_clinics', 5)
        );
});

it('computes MRR from config-driven plan prices', function () {
    // Wipe the super_admin's seed clinic from the count so the assertion is
    // deterministic. The superAdmin user keeps a clinic_id, but it stays
    // 'trial' from the factory default and won't contribute to MRR.
    Clinic::factory()->create(['subscription_status' => 'active', 'subscription_plan' => 'basic']);
    Clinic::factory()->create(['subscription_status' => 'active', 'subscription_plan' => 'basic']);
    Clinic::factory()->create(['subscription_status' => 'active', 'subscription_plan' => 'professional']);
    Clinic::factory()->create(['subscription_status' => 'active', 'subscription_plan' => 'enterprise']);
    Clinic::factory()->create(['subscription_status' => 'trial', 'subscription_plan' => 'enterprise']);

    $prices = config('billing.plan_prices');
    $expected = ($prices['basic'] * 2) + $prices['professional'] + $prices['enterprise'];

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('metrics.mrr.amount', $expected)
            ->where('metrics.mrr.currency', config('billing.currency'))
        );
});

it('counts today\'s active appointments and ignores cancelled or past-day ones', function () {
    $clinic = Clinic::factory()->create();
    // Share one doctor across all five appointments — AppointmentFactory's
    // nested doctor()->create() would otherwise allocate four doctors and
    // trip the 2-doctor-per-clinic cap.
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);

    // Build non-overlapping time slots so the GiST exclusion constraint is
    // satisfied. All five appointments share the doctor; the constraint
    // only fires for active statuses.
    $today = now()->setTime(8, 0);
    $slots = [
        ['offset' => 0, 'status' => 'scheduled', 'day' => $today->copy()],
        ['offset' => 1, 'status' => 'scheduled', 'day' => $today->copy()->addHour()],
        ['offset' => 2, 'status' => 'confirmed', 'day' => $today->copy()->addHours(2)],
        ['offset' => 3, 'status' => 'cancelled', 'day' => $today->copy()->addHours(3)],
        ['offset' => 4, 'status' => 'scheduled', 'day' => $today->copy()->subDay()->addHours(4)],
    ];

    foreach ($slots as $slot) {
        Appointment::factory()->create([
            'clinic_id' => $clinic->id,
            'doctor_id' => $doctor->id,
            'appointment_day' => $slot['day']->toDateString(),
            'scheduled_start' => $slot['day'],
            'scheduled_end' => $slot['day']->copy()->addMinutes(30),
            'status' => $slot['status'],
        ]);
    }

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('metrics.active_appointments_today', 3)
        );
});

it('passes the selected period to the dashboard', function () {
    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.dashboard', ['period' => 'week']))
        ->assertInertia(fn ($page) => $page->where('period', 'week'));
});

it('falls back to the month period for an invalid value', function () {
    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.dashboard', ['period' => 'bogus']))
        ->assertInertia(fn ($page) => $page->where('period', 'month'));
});
