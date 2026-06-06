<?php

namespace App\Listeners;

use App\Notifications\TwoFactorChangedNotification;
use Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed;
use Laravel\Fortify\Events\TwoFactorAuthenticationEvent;

/**
 * Emails the user a security alert when two-factor authentication is confirmed
 * (turned on) or disabled. Wired to both Fortify events in AppServiceProvider;
 * `Confirmed` (not `Enabled`) is the real "on" because the app uses
 * `confirm => true`. Synchronous so it sends in-request under the user locale.
 */
class NotifyTwoFactorChangedListener
{
    public function handle(TwoFactorAuthenticationEvent $event): void
    {
        $event->user->notify(new TwoFactorChangedNotification(
            enabled: $event instanceof TwoFactorAuthenticationConfirmed,
        ));
    }
}
