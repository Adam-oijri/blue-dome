<?php

use App\Http\Middleware\ApplyClinicMailFrom;
use App\Http\Middleware\EnsureClinicActive;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\SetTenantContext;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SetTenantContext::class,
            ApplyClinicMailFrom::class,
        ]);

        $middleware->alias([
            'role' => EnsureRole::class,
            'locale' => SetLocale::class,
            'clinic.active' => EnsureClinicActive::class,
        ]);

        // Every login route is locale-prefixed ({locale}/login). Laravel's
        // default unauthenticated redirect calls route('login') with no locale
        // and throws UrlGenerationException (500) before SetLocale's URL
        // default applies. Resolve the slug from the request and redirect to
        // the localized login so a dropped/expired session lands on the login
        // page instead of crashing.
        $middleware->redirectGuestsTo(function (Request $request): string {
            $segment = (string) $request->segment(1);
            $slug = array_key_exists($segment, config('locales.supported'))
                ? $segment
                : config('locales.default');

            return route('login', ['locale' => $slug]);
        });
    })
    ->withSchedule(function (Schedule $schedule): void {
        // Phase 9: weekly field_changes retention sweep (open question #16).
        // Drops audit rows older than 7 years — matches the activity_log
        // retention floor in IG §security rules.
        $schedule->command('app:rotate-field-changes')
            ->weeklyOn(1, '03:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Reconcile lapsed free trials (trial → expired) once a day. The
        // EnsureClinicActive gate already enforces expiry in real time; this
        // keeps the stored status accurate for the super-admin panel.
        $schedule->command('app:expire-trials')
            ->dailyAt('02:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Queue the automatic 24h-before WhatsApp confirmation reminders.
        // Hourly cadence; `reminder_24h_sent_at` keeps each appointment to a
        // single reminder regardless of how often the sweep runs.
        $schedule->command('app:send-appointment-reminders')
            ->hourly()
            ->withoutOverlapping()
            ->runInBackground();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Phase 9 §devops: optional Sentry integration. We do NOT require()
        // `sentry/sentry-laravel` here — installing it is gated on ops
        // approval per CLAUDE.md "do not change dependencies without
        // approval". When the package IS installed and `SENTRY_LARAVEL_DSN`
        // is set in `.env`, the package autodiscovers and registers itself
        // through Laravel's package-discovery; this block stays empty.
        // See `.env.example` for the enable runbook.
    })->create();
