<?php

use App\Models\NewsletterSubscriber;
use App\Notifications\NewsletterWelcomeNotification;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;

test('subscribing stores the subscriber and emails a confirmation', function () {
    Notification::fake();

    $this->post(route('newsletter.subscribe'), ['email' => 'lead@example.com'])
        ->assertRedirect();

    $subscriber = NewsletterSubscriber::query()->where('email', 'lead@example.com')->first();
    expect($subscriber)->not->toBeNull();
    expect($subscriber->status)->toBe('subscribed');
    expect($subscriber->subscribed_at)->not->toBeNull();

    Notification::assertSentOnDemand(
        NewsletterWelcomeNotification::class,
        fn ($notification, $channels, AnonymousNotifiable $notifiable) => $notifiable->routes['mail'] === 'lead@example.com',
    );
});

test('subscribing twice does not create a duplicate and re-subscribes', function () {
    Notification::fake();

    NewsletterSubscriber::create([
        'email' => 'repeat@example.com',
        'status' => 'unsubscribed',
        'subscribed_at' => now()->subMonth(),
        'unsubscribed_at' => now()->subWeek(),
    ]);

    $this->post(route('newsletter.subscribe'), ['email' => 'repeat@example.com'])
        ->assertRedirect();

    expect(NewsletterSubscriber::query()->where('email', 'repeat@example.com')->count())->toBe(1);

    $subscriber = NewsletterSubscriber::query()->where('email', 'repeat@example.com')->first();
    expect($subscriber->status)->toBe('subscribed');
    expect($subscriber->unsubscribed_at)->toBeNull();
});

test('the confirmation email renders with a localized sign-in link', function () {
    // Queued => runs outside a request, so the sign-in URL must carry the
    // locale explicitly rather than relying on URL defaults.
    $mail = (new NewsletterWelcomeNotification('ma-fr'))->toMail(new AnonymousNotifiable);

    expect($mail->actionUrl)->toContain('/ma-fr/login');
});

test('subscribing requires a valid email', function () {
    Notification::fake();

    $this->from(route('home'))
        ->post(route('newsletter.subscribe'), ['email' => 'not-an-email'])
        ->assertSessionHasErrors('email');

    Notification::assertNothingSent();
});
