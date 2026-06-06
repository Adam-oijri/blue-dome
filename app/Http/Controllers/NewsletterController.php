<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use App\Notifications\NewsletterWelcomeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Notification;

class NewsletterController extends Controller
{
    /**
     * Public landing-page newsletter signup. Records the subscriber (idempotent
     * on email — re-submitting just refreshes the row / re-subscribes) and
     * emails the address a localized confirmation with a sign-in link.
     * Synchronous so it renders in the request locale; rate-limited at the
     * route since it's unauthenticated.
     */
    public function store(Request $request, string $locale): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        NewsletterSubscriber::updateOrCreate(
            ['email' => $validated['email']],
            [
                'locale' => App::getLocale(),
                'status' => 'subscribed',
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
            ],
        );

        // Queued email: pass the locale slug for URL building + the language
        // for the copy (the recipient is an on-demand address, no preference).
        Notification::route('mail', $validated['email'])
            ->notify((new NewsletterWelcomeNotification($locale))->locale(App::getLocale()));

        return back();
    }
}
