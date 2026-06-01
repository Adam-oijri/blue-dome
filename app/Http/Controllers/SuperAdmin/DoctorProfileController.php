<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\UpdateDoctorProfileRequest;
use App\Models\DoctorProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Edits a doctor's clinical profile (specialty, fees, license). Gated through
 * UserPolicy::update on the owning doctor user.
 */
class DoctorProfileController extends Controller
{
    public function edit(string $locale, User $user): Response
    {
        unset($locale);
        $this->authorize('update', $user);
        abort_unless($user->role === 'doctor', 404);

        $profile = DoctorProfile::query()->where('user_id', $user->id)->first();

        return Inertia::render('panels/super-admin/doctors/edit', [
            'doctor' => $user->only(['id', 'first_name', 'last_name']),
            'profile' => $profile?->only([
                'specialty', 'sub_specialty', 'license_number', 'license_expiry',
                'consultation_duration', 'consultation_fee', 'follow_up_fee',
                'emergency_fee', 'accepts_new_patients', 'bio',
            ]),
        ]);
    }

    public function update(UpdateDoctorProfileRequest $request, string $locale, User $user): RedirectResponse
    {
        unset($locale);
        $this->authorize('update', $user);
        abort_unless($user->role === 'doctor', 404);

        $profile = DoctorProfile::firstOrNew(['user_id' => $user->id]);

        if (! $profile->exists) {
            $profile->clinic_id = $user->clinic_id;
        }

        $profile->fill($request->validated());
        $profile->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Doctor profile updated.')]);

        return to_route('super-admin.doctors');
    }
}
