<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Confirmation email for the public landing-page newsletter signup: a quick
 * recap of what subscribers receive plus a sign-in link. Queued so an
 * unreachable mail provider never 500s the subscribe request; the controller
 * sets the locale explicitly (the recipient is an on-demand address with no
 * locale preference).
 */
class NewsletterWelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  string  $localeSlug  the {locale} route slug (e.g. "ma-fr"); the
     *                              email is queued, so it runs outside a
     *                              request and must build URLs with an explicit
     *                              locale rather than relying on URL defaults.
     */
    public function __construct(public string $localeSlug) {}

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
            ->subject(__('emails.newsletter.subject'))
            ->greeting(__('emails.newsletter.greeting'))
            ->line(__('emails.newsletter.line_1'))
            ->line(__('emails.newsletter.line_2'))
            ->action(
                __('emails.newsletter.action'),
                url(route('login', ['locale' => $this->localeSlug])),
            )
            ->line(__('emails.newsletter.line_3'))
            ->salutation(__('emails.salutation'));
    }
}
