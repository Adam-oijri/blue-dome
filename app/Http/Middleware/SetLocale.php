<?php

namespace App\Http\Middleware;

use App\Support\LocaleRegistry;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Reads the {locale} route parameter, validates it against the registry,
 * applies it to Laravel's app locale, and makes it the default for URL
 * generation so route() / Wayfinder helpers automatically include it.
 *
 * Stamped onto the route attribute bag as `locale_entry` so other consumers
 * (HandleInertiaRequests, controllers) can read the resolved metadata
 * without re-looking-up the slug.
 */
class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $slug = $request->route('locale');

        if ($slug === null) {
            $slug = LocaleRegistry::default();
        }

        $entry = LocaleRegistry::entry($slug);

        if ($entry === null) {
            throw new NotFoundHttpException("Unsupported locale slug: {$slug}");
        }

        App::setLocale($entry['lang']);
        URL::defaults(['locale' => $slug]);

        // Fortify's built-in logout / post-verification redirects are bare
        // config paths ("/", "/dashboard") that drop the {locale} segment.
        // Repoint them at the locale-prefixed routes now that the default is set.
        config([
            'fortify.redirects.logout' => route('home'),
            'fortify.redirects.email-verification' => route('dashboard'),
        ]);

        $request->attributes->set('locale_slug', $slug);
        $request->attributes->set('locale_entry', $entry);

        $this->syncAuthUserLocale($entry['lang']);

        return $next($request);
    }

    /**
     * URL is the source of truth — if the authenticated user's `locale`
     * column drifts from the language they're actively browsing, quietly
     * catch up so the next pre-auth redirect / email respects the choice.
     */
    private function syncAuthUserLocale(string $lang): void
    {
        $user = Auth::user();

        if ($user === null || $user->locale === $lang) {
            return;
        }

        $user->forceFill(['locale' => $lang])->saveQuietly();
    }
}
