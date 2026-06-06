<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Security alert sent after the forgot-password flow finishes resetting the
 * account password. Queued (mail failure never 500s the request); localized
 * via User::preferredLocale().
 */
class PasswordResetCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('emails.password_reset_done.subject'))
            ->greeting(__('emails.password_reset_done.greeting', ['name' => $notifiable->first_name]))
            ->line(__('emails.password_reset_done.line_1'))
            ->line(__('emails.password_reset_done.line_2'))
            ->salutation(__('emails.salutation'));
    }
}
