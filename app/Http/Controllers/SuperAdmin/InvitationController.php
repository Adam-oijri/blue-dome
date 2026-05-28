<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Creates a tokenized doctor invitation and flashes the shareable link back to
 * the super-admin Users page drawer. The route guard `role:super_admin` is the
 * gate.
 */
class InvitationController extends Controller
{
    /** Per-clinic active staff caps, mirrors fn_enforce_user_role_caps(). */
    private const ROLE_CAPS = ['doctor' => 2, 'secretary' => 3];

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'clinic_id' => ['required', 'uuid', Rule::exists('clinics', 'id')],
            'role' => ['required', Rule::in(['doctor', 'secretary'])],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
        ]);

        $role = $validated['role'];

        $count = User::query()
            ->where('clinic_id', $validated['clinic_id'])
            ->where('role', $role)
            ->count();

        if ($count >= self::ROLE_CAPS[$role]) {
            throw ValidationException::withMessages([
                'clinic_id' => __('This clinic already has the maximum number of :role accounts.', ['role' => $role]),
            ]);
        }

        $invitation = Invitation::create([
            'clinic_id' => $validated['clinic_id'],
            'role' => $role,
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'token' => Str::random(48),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(7),
        ]);

        $url = route('invitations.show', [
            'locale' => $request->route('locale'),
            'token' => $invitation->token,
        ]);

        Inertia::flash('invite', [
            'url' => $url,
            'name' => trim($invitation->first_name.' '.$invitation->last_name),
        ]);

        return back();
    }
}
