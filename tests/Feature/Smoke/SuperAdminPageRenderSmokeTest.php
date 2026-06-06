<?php

use App\Models\Clinic;
use App\Models\User;

/**
 * Render smoke for the super-admin console: the global pages plus the
 * clinic-scoped management screens. Returns 200 with the expected component.
 */
beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('renders parameterless super-admin pages', function (string $routeName, string $component) {
    $this->actingAs($this->superAdmin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component($component));
})->with([
    ['super-admin.dashboard', 'panels/super-admin/dashboard'],
    ['super-admin.activity-log', 'panels/super-admin/activity-log'],
    ['super-admin.appointments', 'panels/super-admin/appointments'],
    ['super-admin.finance', 'panels/super-admin/finance'],
    ['super-admin.recycle', 'panels/super-admin/recycle'],
    ['super-admin.settings', 'panels/super-admin/settings'],
    ['super-admin.doctors', 'panels/super-admin/doctors'],
    ['super-admin.users', 'panels/super-admin/users'],
    ['super-admin.clinics.index', 'panels/super-admin/clinics/index'],
    ['super-admin.clinics.create', 'panels/super-admin/clinics/create'],
]);

it('renders the clinic detail and config pages', function (string $routeName, string $component) {
    $clinic = Clinic::factory()->create();

    $this->actingAs($this->superAdmin)
        ->get(route($routeName, $clinic))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component($component));
})->with([
    ['super-admin.clinics.show', 'panels/super-admin/clinics/show'],
    ['super-admin.clinics.edit', 'panels/super-admin/clinics/edit'],
    ['super-admin.clinics.email.edit', 'panels/super-admin/clinics/email'],
    ['super-admin.clinics.whatsapp.edit', 'panels/super-admin/clinics/whatsapp'],
    ['super-admin.clinics.patients.index', 'panels/super-admin/clinics/patients/index'],
    ['super-admin.clinics.invoices.index', 'panels/super-admin/clinics/invoices/index'],
    ['super-admin.clinics.inventory.index', 'panels/super-admin/clinics/inventory/index'],
    ['super-admin.clinics.appointments.index', 'panels/super-admin/clinics/appointments/index'],
]);

it('renders the user edit and doctor profile edit pages', function () {
    $clinic = Clinic::factory()->create();
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);

    $this->actingAs($this->superAdmin)->get(route('super-admin.users.edit', $doctor))
        ->assertOk()->assertInertia(fn ($p) => $p->component('panels/super-admin/users/edit'));
    $this->actingAs($this->superAdmin)->get(route('super-admin.doctors.profile.edit', $doctor))
        ->assertOk()->assertInertia(fn ($p) => $p->component('panels/super-admin/doctors/edit'));
});
