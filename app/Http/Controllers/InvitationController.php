<?php

namespace App\Http\Controllers;

use App\Models\DoctorProfile;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public, token-secured invitation acceptance. A guest opens the link from
 * `SuperAdmin\InvitationController`, sees the pre-filled name, and sets their
 * own email + password to activate the doctor account.
 */
class InvitationController extends Controller
{
    public function show(string $locale, string $token): Response
    {
        $invitation = Invitation::query()
            ->with('clinic:id,name')
            ->where('token', $token)
            ->first();

        if ($invitation === null || ! $invitation->isPending()) {
            return Inertia::render('auth/invite-invalid');
        }

        return Inertia::render('auth/accept-invite', [
            'token' => $token,
            'role' => $invitation->role,
            'firstName' => $invitation->first_name,
            'lastName' => $invitation->last_name,
            'clinicName' => $invitation->clinic?->name,
        ]);
    }

    public function accept(Request $request, string $locale, string $token): RedirectResponse
    {
        $invitation = Invitation::query()->where('token', $token)->first();

        if ($invitation === null || ! $invitation->isPending()) {
            abort(404);
        }

        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        try {
            $user = DB::transaction(function () use ($invitation, $validated): User {
                $user = User::forceCreate([
                    'clinic_id' => $invitation->clinic_id,
                    'first_name' => $invitation->first_name,
                    'last_name' => $invitation->last_name,
                    'email' => $validated['email'],
                    'password_hash' => Hash::make($validated['password']),
                    'role' => $invitation->role,
                    'is_active' => true,
                    'email_verified' => true,
                    'email_verified_at' => now(),
                ]);

                if ($invitation->role === 'doctor') {
                    DoctorProfile::create([
                        'user_id' => $user->id,
                        'clinic_id' => $invitation->clinic_id,
                        'consultation_duration' => 30,
                    ]);
                }

                $invitation->forceFill([
                    'accepted_at' => now(),
                    'accepted_user_id' => $user->id,
                ])->save();

                return $user;
            });
        } catch (QueryException $e) {
            // fn_enforce_user_role_caps() raises a check_violation when the
            // clinic is already at its doctor cap (race with another accept).
            if ($e->getCode() === '23514') {
                throw ValidationException::withMessages([
                    'email' => __('This clinic can no longer accept new doctors.'),
                ]);
            }

            throw $e;
        }

        Auth::login($user);
        $request->session()->regenerate();

        $dashboard = $invitation->role === 'secretary'
            ? 'secretary.dashboard'
            : 'doctor.dashboard';

        return redirect()->route($dashboard, ['locale' => $locale]);
    }
}
