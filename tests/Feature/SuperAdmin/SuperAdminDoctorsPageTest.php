<?php

use App\Models\Clinic;
use App\Models\DoctorProfile;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('renders the doctors page', function () {
    $clinic = Clinic::factory()->create();
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);
    DoctorProfile::create([
        'user_id' => $doctor->id,
        'clinic_id' => $clinic->id,
        'specialty' => 'Pediatrics',
        'consultation_fee' => 350,
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.doctors'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/super-admin/doctors')
            ->has('doctors.data')
            ->has('specialties')
            ->has('kpis.total')
        );
});

it('filters by specialty', function () {
    $clinic = Clinic::factory()->create();
    $cardiologist = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);
    DoctorProfile::create([
        'user_id' => $cardiologist->id,
        'clinic_id' => $clinic->id,
        'specialty' => 'Cardiology',
    ]);

    $clinic2 = Clinic::factory()->create();
    $pediatrician = User::factory()->doctor()->create(['clinic_id' => $clinic2->id]);
    DoctorProfile::create([
        'user_id' => $pediatrician->id,
        'clinic_id' => $clinic2->id,
        'specialty' => 'Pediatrics',
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.doctors', ['specialty' => 'Cardiology']))
        ->assertInertia(fn ($page) => $page
            ->where('doctors.data.0.id', $cardiologist->id)
            ->where('doctors.total', 1)
        );
});

it('blocks non-super-admin', function () {
    $this->actingAs(User::factory()->doctor()->create())
        ->get(route('super-admin.doctors'))
        ->assertForbidden();
});
