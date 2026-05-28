<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('renders the appointments page with paginated data', function () {
    $clinic = Clinic::factory()->create();
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);

    $start = now()->setTime(8, 0);
    Appointment::factory()->create([
        'clinic_id' => $clinic->id,
        'doctor_id' => $doctor->id,
        'appointment_day' => $start->toDateString(),
        'scheduled_start' => $start,
        'scheduled_end' => $start->copy()->addMinutes(30),
        'status' => 'scheduled',
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.appointments'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/super-admin/appointments')
            ->has('appointments.data')
            ->has('kpis.total')
        );
});

it('filters appointments by status', function () {
    $clinic = Clinic::factory()->create();
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);

    $base = now()->setTime(8, 0);
    Appointment::factory()->create([
        'clinic_id' => $clinic->id,
        'doctor_id' => $doctor->id,
        'appointment_day' => $base->toDateString(),
        'scheduled_start' => $base,
        'scheduled_end' => $base->copy()->addMinutes(30),
        'status' => 'completed',
    ]);
    Appointment::factory()->create([
        'clinic_id' => $clinic->id,
        'doctor_id' => $doctor->id,
        'appointment_day' => $base->copy()->addHours(1)->toDateString(),
        'scheduled_start' => $base->copy()->addHours(1),
        'scheduled_end' => $base->copy()->addHours(1)->addMinutes(30),
        'status' => 'cancelled',
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.appointments', ['status' => 'completed']))
        ->assertInertia(fn ($page) => $page
            ->where('appointments.data', fn ($rows) => collect($rows)->every(fn ($r) => $r['status'] === 'completed'))
        );
});

it('blocks non-super-admin', function () {
    $doctor = User::factory()->doctor()->create();
    $this->actingAs($doctor)->get(route('super-admin.appointments'))->assertForbidden();
});
