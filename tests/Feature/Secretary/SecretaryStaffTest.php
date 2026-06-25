<?php

use App\Models\Clinic;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    // The clinic owner is a secretary (matches CreateNewUser).
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('renders the staff page for the secretary', function () {
    $this->actingAs($this->secretary)
        ->get(route('secretary.staff'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/staff')
            ->has('staff')
            ->has('caps')
        );
});

it('lets the secretary invite a secretary scoped to their own clinic', function () {
    $this->actingAs($this->secretary)
        ->post(route('secretary.staff.invitations.store'), [
            'role' => 'secretary',
            'first_name' => 'Salma',
            'last_name' => 'Idrissi',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $invitation = Invitation::query()->where('first_name', 'Salma')->firstOrFail();

    expect($invitation->role)->toBe('secretary');
    expect($invitation->clinic_id)->toBe($this->clinic->id);
    expect($invitation->invited_by)->toBe($this->secretary->id);
    expect($invitation->expires_at->isFuture())->toBeTrue();
});

it('lets the secretary invite a doctor (a fresh clinic needs one)', function () {
    $this->actingAs($this->secretary)
        ->post(route('secretary.staff.invitations.store'), [
            'role' => 'doctor',
            'first_name' => 'Karim',
            'last_name' => 'Alaoui',
        ])
        ->assertSessionHasNoErrors();

    $invitation = Invitation::query()->where('first_name', 'Karim')->firstOrFail();
    expect($invitation->role)->toBe('doctor');
    expect($invitation->clinic_id)->toBe($this->clinic->id);
});

it('rejects a role outside doctor/secretary', function () {
    $this->actingAs($this->secretary)
        ->post(route('secretary.staff.invitations.store'), [
            'role' => 'super_admin',
            'first_name' => 'X',
            'last_name' => 'Y',
        ])
        ->assertSessionHasErrors('role');

    expect(Invitation::query()->count())->toBe(0);
});

it('enforces the per-clinic secretary cap (3)', function () {
    // Owner is 1 secretary; add 2 more to reach the cap of 3.
    User::factory()->secretary()->count(2)->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary)
        ->post(route('secretary.staff.invitations.store'), [
            'role' => 'secretary',
            'first_name' => 'Over',
            'last_name' => 'Cap',
        ])
        ->assertSessionHasErrors('role');

    expect(Invitation::query()->where('first_name', 'Over')->exists())->toBeFalse();
});

it('counts outstanding invitations toward the cap', function () {
    // Owner (1) + 1 more = 2 secretaries; 1 pending secretary invite = 3 -> cap.
    User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    Invitation::create([
        'clinic_id' => $this->clinic->id,
        'role' => 'secretary',
        'first_name' => 'Pending',
        'last_name' => 'Invite',
        'token' => Str::random(48),
        'invited_by' => $this->secretary->id,
        'expires_at' => now()->addDays(7),
    ]);

    $this->actingAs($this->secretary)
        ->post(route('secretary.staff.invitations.store'), [
            'role' => 'secretary',
            'first_name' => 'One',
            'last_name' => 'TooMany',
        ])
        ->assertSessionHasErrors('role');
});

it('blocks a doctor from the secretary staff routes', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($doctor)->get(route('secretary.staff'))->assertForbidden();
    $this->actingAs($doctor)->post(route('secretary.staff.invitations.store'), [
        'role' => 'secretary', 'first_name' => 'A', 'last_name' => 'B',
    ])->assertForbidden();
});

it('does not let a secretary revoke another clinic\'s invitation', function () {
    $other = Clinic::factory()->create();
    $invitation = Invitation::create([
        'clinic_id' => $other->id,
        'role' => 'secretary',
        'first_name' => 'Other',
        'last_name' => 'Clinic',
        'token' => Str::random(48),
        'invited_by' => $this->secretary->id,
        'expires_at' => now()->addDays(7),
    ]);

    $this->actingAs($this->secretary)
        ->delete(route('secretary.staff.invitations.revoke', $invitation))
        ->assertNotFound();

    expect(Invitation::query()->whereKey($invitation->id)->exists())->toBeTrue();
});

it('lets the secretary revoke an invitation in their own clinic', function () {
    $invitation = Invitation::create([
        'clinic_id' => $this->clinic->id,
        'role' => 'secretary',
        'first_name' => 'Bye',
        'last_name' => 'Invite',
        'token' => Str::random(48),
        'invited_by' => $this->secretary->id,
        'expires_at' => now()->addDays(7),
    ]);

    $this->actingAs($this->secretary)
        ->delete(route('secretary.staff.invitations.revoke', $invitation))
        ->assertSessionHasNoErrors();

    expect(Invitation::query()->whereKey($invitation->id)->exists())->toBeFalse();
});

it('lets the secretary remove a clinic staff member but not themselves or other clinics', function () {
    $colleague = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $foreign = User::factory()->secretary()->create(['clinic_id' => Clinic::factory()->create()->id]);

    // Cannot remove self.
    $this->actingAs($this->secretary)
        ->delete(route('secretary.staff.destroy', $this->secretary))
        ->assertForbidden();

    // Cannot remove another clinic's user.
    $this->actingAs($this->secretary)
        ->delete(route('secretary.staff.destroy', $foreign))
        ->assertForbidden();

    // Can remove a same-clinic colleague (soft delete).
    $this->actingAs($this->secretary)
        ->delete(route('secretary.staff.destroy', $colleague))
        ->assertSessionHasNoErrors();

    $this->assertSoftDeleted('users', ['id' => $colleague->id]);
});

it('creates a working secretary account when the invitation is accepted', function () {
    $this->actingAs($this->secretary)->post(route('secretary.staff.invitations.store'), [
        'role' => 'secretary',
        'first_name' => 'New',
        'last_name' => 'Secretary',
    ])->assertSessionHasNoErrors();

    $token = Invitation::query()->where('first_name', 'New')->firstOrFail()->token;

    // Public acceptance (guest) sets email + password.
    $this->post(route('invitations.accept', ['token' => $token]), [
        'email' => 'new.secretary@example.test',
        'password' => 'Sup3r$ecret!',
        'password_confirmation' => 'Sup3r$ecret!',
    ])->assertRedirect();

    $created = User::query()->where('email', 'new.secretary@example.test')->firstOrFail();
    expect($created->role)->toBe('secretary');
    expect($created->clinic_id)->toBe($this->clinic->id);
});
