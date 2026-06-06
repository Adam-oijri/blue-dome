<?php

namespace App\Http\Middleware;

use App\Models\Clinic;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gates the authenticated app behind an active clinic subscription. A
 * self-service signup gets a free trial (config('billing.trial_days')); once
 * it lapses — or the clinic is suspended/expired/cancelled/deactivated — the
 * user is bounced to the `trial-expired` screen until reactivated.
 *
 * Exemptions: super-admin (platform operator) always passes, and a clinic
 * with a NULL `subscription_expiry` is grandfathered (every seeded / migrated
 * clinic predating self-signup, so nothing existing is locked out).
 */
class EnsureClinicActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || $user->role === 'super_admin') {
            return $next($request);
        }

        $clinic = $user->clinic;

        if ($clinic !== null && $this->isBlocked($clinic)) {
            return redirect()->route('trial-expired');
        }

        return $next($request);
    }

    /**
     * A clinic is blocked when it is deactivated, in a non-serviceable
     * subscription state, or on a trial whose dated expiry is in the past.
     * NULL expiry ⇒ never blocked (grandfathered).
     */
    private function isBlocked(Clinic $clinic): bool
    {
        if (! $clinic->is_active) {
            return true;
        }

        if (in_array($clinic->subscription_status, ['expired', 'suspended', 'cancelled'], true)) {
            return true;
        }

        return $clinic->subscription_status === 'trial'
            && $clinic->subscription_expiry !== null
            && $clinic->subscription_expiry->lt(today());
    }
}
