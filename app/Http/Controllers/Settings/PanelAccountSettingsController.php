<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

/**
 * Shared account-settings page for the role panels (super-admin, doctor,
 * secretary). Each panel renders the same Profile / Password / Two-factor /
 * Appearance forms backed by the existing settings routes; only the Inertia
 * page differs.
 */
abstract class PanelAccountSettingsController extends Controller
{
    /**
     * The Inertia page component that renders this panel's account settings.
     */
    abstract protected function view(): string;

    /**
     * Opening the panel's account settings does NOT require password
     * confirmation. The embedded two-factor mutations stay protected by
     * Fortify's own `password.confirm` guard on the two-factor.* routes
     * (active while `confirmPassword` is enabled in config/fortify.php).
     */
    public function edit(TwoFactorAuthenticationRequest $request): Response
    {
        $props = [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ];

        if (Features::canManageTwoFactorAuthentication()) {
            $request->ensureStateIsValid();

            $props['twoFactorEnabled'] = $request->user()->hasEnabledTwoFactorAuthentication();
            $props['requiresConfirmation'] = Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm');
        }

        return Inertia::render($this->view(), $props);
    }
}
