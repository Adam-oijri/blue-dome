<?php

use App\Models\Clinic;
use App\Models\DoctorProfile;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('lets a super-admin edit a user', function () {
    $user = User::factory()->secretary()->create();

    $this->actingAs($this->superAdmin)
        ->from(route('super-admin.users.edit', $user))
        ->patch(route('super-admin.users.update', $user), [
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'email' => 'updated@example.com',
            'phone' => '+212600000000',
            'role' => 'secretary',
            'is_active' => '1',
        ])
        ->assertRedirect(route('super-admin.users'))
        ->assertSessionHasNoErrors();

    $fresh = $user->fresh();
    expect($fresh->first_name)->toBe('Updated')
        ->and($fresh->email)->toBe('updated@example.com')
        ->and($fresh->phone)->toBe('+212600000000');
});

it('rejects promoting a user into an already-full role', function () {
    $clinic = Clinic::factory()->create();
    User::factory()->doctor()->count(2)->create(['clinic_id' => $clinic->id]);
    $secretary = User::factory()->secretary()->create(['clinic_id' => $clinic->id]);

    $this->actingAs($this->superAdmin)
        ->patch(route('super-admin.users.update', $secretary), [
            'first_name' => $secretary->first_name,
            'last_name' => $secretary->last_name,
            'email' => $secretary->email,
            'role' => 'doctor',
            'is_active' => '1',
        ])
        ->assertSessionHasErrors('role');

    expect($secretary->fresh()->role)->toBe('secretary');
});

it('blocks a super-admin from demoting or deactivating themselves', function () {
    $this->actingAs($this->superAdmin)
        ->patch(route('super-admin.users.update', $this->superAdmin), [
            'first_name' => $this->superAdmin->first_name,
            'last_name' => $this->superAdmin->last_name,
            'email' => $this->superAdmin->email,
            'role' => 'secretary',
            'is_active' => '0',
        ])
        ->assertSessionHasErrors(['role', 'is_active']);

    expect($this->superAdmin->fresh()->role)->toBe('super_admin')
        ->and($this->superAdmin->fresh()->is_active)->toBeTrue();
});

it('deactivates and reactivates a user', function () {
    $user = User::factory()->secretary()->create(['is_active' => true]);

    $base = [
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'email' => $user->email,
        'role' => 'secretary',
    ];

    $this->actingAs($this->superAdmin)
        ->patch(route('super-admin.users.update', $user), [...$base, 'is_active' => '0'])
        ->assertSessionHasNoErrors();
    expect($user->fresh()->is_active)->toBeFalse();

    $this->actingAs($this->superAdmin)
        ->patch(route('super-admin.users.update', $user), [...$base, 'is_active' => '1'])
        ->assertSessionHasNoErrors();
    expect($user->fresh()->is_active)->toBeTrue();
});

it('soft-deletes and restores a user', function () {
    $user = User::factory()->secretary()->create();

    $this->actingAs($this->superAdmin)
        ->delete(route('super-admin.users.destroy', $user))
        ->assertSessionHasNoErrors();
    expect(User::withTrashed()->find($user->id)->trashed())->toBeTrue();

    $this->actingAs($this->superAdmin)
        ->post(route('super-admin.users.restore', ['user' => $user->id]))
        ->assertSessionHasNoErrors();
    expect(User::withTrashed()->find($user->id)->trashed())->toBeFalse();
});

it('forbids a super-admin from deleting their own account', function () {
    $this->actingAs($this->superAdmin)
        ->delete(route('super-admin.users.destroy', $this->superAdmin))
        ->assertForbidden();
});

it('lets a super-admin edit a doctor profile', function () {
    $clinic = Clinic::factory()->create();
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);

    $this->actingAs($this->superAdmin)
        ->from(route('super-admin.doctors.profile.edit', $doctor))
        ->patch(route('super-admin.doctors.profile.update', $doctor), [
            'specialty' => 'Cardiology',
            'consultation_duration' => 30,
            'consultation_fee' => 300,
        ])
        ->assertRedirect(route('super-admin.doctors'))
        ->assertSessionHasNoErrors();

    $profile = DoctorProfile::query()->where('user_id', $doctor->id)->first();
    expect($profile)->not->toBeNull()
        ->and($profile->specialty)->toBe('Cardiology')
        ->and((int) $profile->consultation_duration)->toBe(30);
});

it('forbids doctor and secretary from staff-management routes', function (string $role) {
    $target = User::factory()->secretary()->create();
    $doctor = User::factory()->doctor()->create();
    $actor = User::factory()->{$role}()->create();

    $this->actingAs($actor)->get(route('super-admin.users.edit', $target))->assertForbidden();
    $this->actingAs($actor)->delete(route('super-admin.users.destroy', $target))->assertForbidden();
    $this->actingAs($actor)->get(route('super-admin.doctors.profile.edit', $doctor))->assertForbidden();
})->with(['doctor', 'secretary']);
