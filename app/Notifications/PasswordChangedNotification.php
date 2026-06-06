<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Security alert sent after a signed-in user changes their password in
 * Settings. Queued so a slow/unreachable mail provider never blocks or 500s
 * the request; renders in the recipient's locale via User::preferredLocale().
 */
class PasswordChangedNotification extends Notification implements ShouldQueue
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
            ->subject(__('emails.password_changed.subject'))
            ->greeting(__('emails.password_changed.greeting', ['name' => $notifiable->first_name]))
            ->line(__('emails.password_changed.line_1'))
            ->line(__('emails.password_changed.line_2'))
            ->salutation(__('emails.salutation'));
    }
}
