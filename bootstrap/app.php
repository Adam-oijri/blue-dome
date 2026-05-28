<?php

use App\Http\Middleware\ApplyClinicMailFrom;
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
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        // Phase 9: weekly field_changes retention sweep (open question #16).
        // Drops audit rows older than 7 years — matches the activity_log
        // retention floor in IG §security rules.
        $schedule->command('app:rotate-field-changes')
            ->weeklyOn(1, '03:00')
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
