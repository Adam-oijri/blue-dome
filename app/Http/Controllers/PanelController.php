<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the role-specific landing page each panel redirects to after
 * login. Carbon-based panel UIs will replace these placeholder pages as the
 * Inertia bridge is wired up in their respective phases.
 */
class PanelController extends Controller
{
    public function doctor(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('panels/doctor/dashboard', [
            'user' => $this->serializeUser($user),
            'clinic' => $this->serializeClinic($user->clinic),
        ]);
    }

    public function secretary(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('panels/secretary/dashboard', [
            'user' => $this->serializeUser($user),
            'clinic' => $this->serializeClinic($user->clinic),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeClinic(Clinic $clinic): array
    {
        return [
            'id' => $clinic->id,
            'name' => $clinic->name,
            'subscription_plan' => $clinic->subscription_plan,
            'subscription_status' => $clinic->subscription_status,
        ];
    }
}
