<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Per-request mailer "from" override. When the authenticated user's clinic
 * has an EmailIntegration row, swap config('mail.from.{address,name}') so any
 * Mailable / Notification dispatched synchronously during this request goes
 * out under the clinic's identity instead of the system default.
 *
 * Falls through silently for guest requests and clinics without a configured
 * EmailIntegration — those keep the global config/mail.php defaults.
 *
 * **Limitation:** this only fires inside the request lifecycle. Queued
 * Mailables run in worker processes that never hit this middleware; they
 * must read $clinic->emailIntegration inside their envelope() and call
 * ->from(...) explicitly. The phase-1 sole mail path (password reset) is
 * synchronous, so the override applies. Revisit when queued Mailables land.
 */
class ApplyClinicMailFrom
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        $clinic = $user?->clinic;
        $integration = $clinic?->emailIntegration;

        if ($integration && $integration->from_email) {
            config([
                'mail.from.address' => $integration->from_email,
                'mail.from.name' => $integration->from_name ?? $clinic->name,
            ]);
        }

        return $next($request);
    }
}
