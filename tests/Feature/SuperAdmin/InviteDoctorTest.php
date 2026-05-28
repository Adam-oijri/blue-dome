<?php

use App\Models\Clinic;
use App\Models\DoctorProfile;
use App\Models\Invitation;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('lets a super-admin create a doctor invitation', function () {
    $clinic = Clinic::factory()->create();

    $this->actingAs($this->superAdmin)
        ->from(route('super-admin.users'))
        ->post(route('super-admin.invitations.store'), [
            'role' => 'doctor',
            'clinic_id' => $clinic->id,
            'first_name' => 'Aicha',
            'last_name' => 'Bennani',
        ])
        ->assertRedirect(route('super-admin.users'))
        ->assertSessionHasNoErrors();

    $invitation = Invitation::query()->where('clinic_id', $clinic->id)->first();

    expect($invitation)->not->toBeNull()
        ->and($invitation->first_name)->toBe('Aicha')
        ->and($invitation->role)->toBe('doctor')
        ->and($invitation->isPending())->toBeTrue();
});

it('blocks invitation creation for non-super-admin roles', function () {
    $clinic = Clinic::factory()->create();

    $this->actingAs(User::factory()->doctor()->create())
        ->post(route('super-admin.invitations.store'), [
            'role' => 'doctor',
            'clinic_id' => $clinic->id,
            'first_name' => 'Aicha',
            'last_name' => 'Bennani',
        ])
        ->assertForbidden();
});

it('rejects an invite when the clinic is already at the doctor cap', function () {
    $clinic = Clinic::factory()->create();
    User::factory()->doctor()->count(2)->create(['clinic_id' => $clinic->id]);

    $this->actingAs($this->superAdmin)
        ->from(route('super-admin.users'))
        ->post(route('super-admin.invitations.store'), [
            'role' => 'doctor',
            'clinic_id' => $clinic->id,
            'first_name' => 'Third',
            'last_name' => 'Doctor',
        ])
        ->assertSessionHasErrors('clinic_id');

    expect(Invitation::query()->where('clinic_id', $clinic->id)->count())->toBe(0);
});

it('shows the accept page for a valid token', function () {
    $invitation = Invitation::factory()->create([
        'first_name' => 'Aicha',
        'last_name' => 'Bennani',
    ]);

    $this->get(route('invitations.show', ['token' => $invitation->token]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/accept-invite')
            ->where('firstName', 'Aicha')
            ->where('token', $invitation->token)
        );
});

it('shows the invalid page for an expired token', function () {
    $invitation = Invitation::factory()->expired()->create();

    $this->get(route('invitations.show', ['token' => $invitation->token]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/invite-invalid'));
});

it('creates the doctor and logs them in when the invite is accepted', function () {
    $clinic = Clinic::factory()->create();
    $invitation = Invitation::factory()->create([
        'clinic_id' => $clinic->id,
        'first_name' => 'Aicha',
        'last_name' => 'Bennani',
    ]);

    $this->post(route('invitations.accept', ['token' => $invitation->token]), [
        'email' => 'aicha@example.com',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertRedirect(route('doctor.dashboard'));

    $doctor = User::query()->where('email', 'aicha@example.com')->first();

    expect($doctor)->not->toBeNull()
        ->and($doctor->role)->toBe('doctor')
        ->and($doctor->clinic_id)->toBe($clinic->id)
        ->and($invitation->fresh()->accepted_at)->not->toBeNull();

    expect(DoctorProfile::query()->where('user_id', $doctor->id)->exists())->toBeTrue();

    $this->assertAuthenticatedAs($doctor);
});

it('rejects an already-accepted invite', function () {
    $invitation = Invitation::factory()->accepted()->create();

    $this->post(route('invitations.accept', ['token' => $invitation->token]), [
        'email' => 'x@example.com',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertNotFound();
});

it('lets a super-admin create a secretary invitation', function () {
    $clinic = Clinic::factory()->create();

    $this->actingAs($this->superAdmin)
        ->from(route('super-admin.users'))
        ->post(route('super-admin.invitations.store'), [
            'role' => 'secretary',
            'clinic_id' => $clinic->id,
            'first_name' => 'Salma',
            'last_name' => 'Karimi',
        ])
        ->assertRedirect(route('super-admin.users'))
        ->assertSessionHasNoErrors();

    expect(
        Invitation::query()
            ->where('clinic_id', $clinic->id)
            ->where('role', 'secretary')
            ->exists()
    )->toBeTrue();
});

it('rejects a secretary invite when the clinic is at the secretary cap', function () {
    $clinic = Clinic::factory()->create();
    User::factory()->secretary()->count(3)->create(['clinic_id' => $clinic->id]);

    $this->actingAs($this->superAdmin)
        ->from(route('super-admin.users'))
        ->post(route('super-admin.invitations.store'), [
            'role' => 'secretary',
            'clinic_id' => $clinic->id,
            'first_name' => 'Fourth',
            'last_name' => 'Secretary',
        ])
        ->assertSessionHasErrors('clinic_id');
});

it('rejects an invite for a role other than doctor or secretary', function () {
    $clinic = Clinic::factory()->create();

    $this->actingAs($this->superAdmin)
        ->from(route('super-admin.users'))
        ->post(route('super-admin.invitations.store'), [
            'role' => 'super_admin',
            'clinic_id' => $clinic->id,
            'first_name' => 'No',
            'last_name' => 'Way',
        ])
        ->assertSessionHasErrors('role');
});

it('creates a secretary without a doctor profile and redirects to the secretary dashboard', function () {
    $clinic = Clinic::factory()->create();
    $invitation = Invitation::factory()->create([
        'clinic_id' => $clinic->id,
        'role' => 'secretary',
        'first_name' => 'Salma',
        'last_name' => 'Karimi',
    ]);

    $this->post(route('invitations.accept', ['token' => $invitation->token]), [
        'email' => 'salma@example.com',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertRedirect(route('secretary.dashboard'));

    $secretary = User::query()->where('email', 'salma@example.com')->first();

    expect($secretary)->not->toBeNull()
        ->and($secretary->role)->toBe('secretary');

    expect(DoctorProfile::query()->where('user_id', $secretary->id)->exists())->toBeFalse();

    $this->assertAuthenticatedAs($secretary);
});
