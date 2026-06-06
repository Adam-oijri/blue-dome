<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Security alert sent when two-factor authentication is turned on or off.
 * Queued (mail failure never 500s the request); localized via
 * User::preferredLocale().
 */
class TwoFactorChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public bool $enabled) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $key = $this->enabled ? 'two_factor_enabled' : 'two_factor_disabled';

        return (new MailMessage)
            ->subject(__("emails.{$key}.subject"))
            ->greeting(__("emails.{$key}.greeting", ['name' => $notifiable->first_name]))
            ->line(__("emails.{$key}.line_1"))
            ->line(__("emails.{$key}.line_2"))
            ->salutation(__('emails.salutation'));
    }
}
