<?php

namespace App\Http\Middleware;

use App\Support\LocaleRegistry;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'locale' => $this->resolveLocale($request),
        ];
    }

    /**
     * Resolve the locale slug + metadata for the current request. Falls back
     * to the configured default when no locale segment is present (the
     * landing redirect chain or unprefixed routes shouldn't normally hit
     * this fallback, but it keeps the prop typed for components that mount
     * before the route resolves).
     *
     * @return array{slug: string, country: string, lang: string, dir: string, supported: array<int, string>}
     */
    private function resolveLocale(Request $request): array
    {
        $slug = $request->attributes->get('locale_slug')
            ?? $request->route('locale')
            ?? LocaleRegistry::default();

        $entry = LocaleRegistry::entry($slug) ?? LocaleRegistry::entry(LocaleRegistry::default());

        return [
            'slug' => $slug,
            'country' => $entry['country'],
            'lang' => $entry['lang'],
            'dir' => $entry['dir'],
            'supported' => array_keys(LocaleRegistry::supported()),
        ];
    }
}
