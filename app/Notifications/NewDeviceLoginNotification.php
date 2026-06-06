<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Security alert sent when an account is signed into from a device that has
 * not been seen before. Queued (mail failure never 500s the login); localized
 * via User::preferredLocale().
 */
class NewDeviceLoginNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $ip,
        public ?string $userAgent,
        public string $when,
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
            ->subject(__('emails.new_device.subject'))
            ->greeting(__('emails.new_device.greeting', ['name' => $notifiable->first_name]))
            ->line(__('emails.new_device.line_1'))
            ->line(__('emails.new_device.when', ['when' => $this->when]))
            ->line(__('emails.new_device.ip', ['ip' => $this->ip]))
            ->line(__('emails.new_device.device', ['device' => $this->userAgent ?? '—']))
            ->line(__('emails.new_device.line_2'))
            ->salutation(__('emails.salutation'));
    }
}
