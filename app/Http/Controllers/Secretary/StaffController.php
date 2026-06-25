<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Http\Requests\Secretary\StoreStaffInvitationRequest;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Clinic-side staff management for the secretary (the clinic manager / owner
 * account). Lets the clinic invite + manage its own doctors and secretaries
 * without super-admin, reusing the tokenized invitation flow
 * (App\Http\Controllers\InvitationController handles public acceptance, which
 * stamps role + clinic from the invitation). The clinic is always the actor's
 * own clinic — never taken from input. Per-clinic caps mirror
 * fn_enforce_user_role_caps (doctor 2, secretary 3).
 */
class StaffController extends Controller
{
    /** Per-clinic active staff caps, mirrors fn_enforce_user_role_caps(). */
    private const ROLE_CAPS = ['doctor' => 2, 'secretary' => 3];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $clinicId = $user->clinic_id;

        $staff = User::query()
            ->where('clinic_id', $clinicId)
            ->whereIn('role', ['doctor', 'secretary'])
            ->orderBy('role')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'email', 'role', 'is_active'])
            ->map(fn (User $member): array => [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'email' => $member->email,
                'role' => $member->role,
                'is_active' => (bool) $member->is_active,
                'is_self' => $member->id === $user->id,
            ])
            ->all();

        $pending = Invitation::query()
            ->where('clinic_id', $clinicId)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->orderByDesc('created_at')
            ->get(['id', 'first_name', 'last_name', 'role', 'expires_at'])
            ->map(fn (Invitation $invite): array => [
                'id' => $invite->id,
                'first_name' => $invite->first_name,
                'last_name' => $invite->last_name,
                'role' => $invite->role,
                'expires_at' => $invite->expires_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('panels/secretary/staff', [
            'staff' => $staff,
            'pending' => $pending,
            'caps' => self::ROLE_CAPS,
            'counts' => [
                'doctor' => collect($staff)->where('role', 'doctor')->count(),
                'secretary' => collect($staff)->where('role', 'secretary')->count(),
            ],
        ]);
    }

    public function storeInvitation(StoreStaffInvitationRequest $request): RedirectResponse
    {
        $clinicId = $request->user()->clinic_id;
        $role = $request->validated()['role'];

        // Mirror fn_enforce_user_role_caps and also count outstanding pending
        // invitations, so we never issue more links than the clinic can accept.
        $taken = User::query()
            ->where('clinic_id', $clinicId)
            ->where('role', $role)
            ->count()
            + Invitation::query()
                ->where('clinic_id', $clinicId)
                ->where('role', $role)
                ->whereNull('accepted_at')
                ->where('expires_at', '>', now())
                ->count();

        if ($taken >= self::ROLE_CAPS[$role]) {
            throw ValidationException::withMessages([
                'role' => __('staff.'.$role.'_cap_reached'),
            ]);
        }

        $invitation = Invitation::create([
            'clinic_id' => $clinicId,
            'role' => $role,
            'first_name' => $request->validated()['first_name'],
            'last_name' => $request->validated()['last_name'],
            'token' => Str::random(48),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(7),
        ]);

        $name = trim($invitation->first_name.' '.$invitation->last_name);

        Inertia::flash('invite', [
            'url' => route('invitations.show', [
                'locale' => $request->route('locale'),
                'token' => $invitation->token,
            ]),
            'name' => $name,
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('staff.'.$role.'_invited', ['name' => $name]),
        ]);
    }

    public function revokeInvitation(Request $request, string $locale, Invitation $invitation): RedirectResponse
    {
        unset($locale);

        abort_unless($invitation->clinic_id === $request->user()->clinic_id, 404);

        $invitation->delete();

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('staff.invitation_revoked'),
        ]);
    }

    public function destroy(Request $request, string $locale, User $user): RedirectResponse
    {
        unset($locale);

        $this->authorize('delete', $user);

        $name = trim($user->first_name.' '.$user->last_name);
        $user->delete();

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('staff.removed', ['name' => $name]),
        ]);
    }
}
