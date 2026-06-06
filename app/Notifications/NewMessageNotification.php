<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Emails a recipient that they have a new in-app chat message. Sent on-demand
 * (anonymous mail notifiable) to the platform super admin when a staff member
 * messages them — the queue worker has no tenant context, so an on-demand
 * route avoids re-fetching an RLS-hidden super-admin user row. Queued so a mail
 * provider outage never blocks posting a message; the caller sets the locale.
 */
class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $senderName,
        public string $snippet,
    ) {}

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
            ->subject(__('emails.new_message.subject', ['sender' => $this->senderName]))
            ->greeting(__('emails.new_message.greeting'))
            ->line(__('emails.new_message.line_1', ['sender' => $this->senderName]))
            ->line('“'.$this->snippet.'”')
            ->action(
                __('emails.new_message.action'),
                url(route('messages.index', ['locale' => config('locales.default')])),
            )
            ->line(__('emails.new_message.line_2'))
            ->salutation(__('emails.salutation'));
    }
}
