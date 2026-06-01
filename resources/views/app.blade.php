@php
    // The landing (`welcome`) page is always rendered light — see welcome.tsx
    // for the React-side guarantee. We skip the inline dark toggle below so
    // dark-mode users don't see a flash of dark before the page mounts.
    $isLandingPage = isset($page['component']) && $page['component'] === 'welcome';
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ request()->attributes->get('locale_entry')['dir'] ?? 'ltr' }}" @class(['dark' => ! $isLandingPage && ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';
                const isLandingPage = {{ $isLandingPage ? 'true' : 'false' }};

                if (isLandingPage) {
                    return;
                }

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @php
            $currentLocale = request()->route('locale');
        @endphp
        @if ($currentLocale)
            @php
                // Strip the leading locale segment so we can substitute each supported slug.
                $localePath = ltrim(preg_replace('#^/' . preg_quote($currentLocale, '#') . '#', '', '/' . request()->path()), '/');
                $query = request()->getQueryString();
                $suffix = ($localePath === '' ? '/' : '/' . $localePath) . ($query ? '?' . $query : '');
            @endphp
            @foreach (config('locales.supported') as $altSlug => $entry)
                <link rel="alternate" hreflang="{{ $entry['lang'] . '-' . $entry['country'] }}" href="{{ url('/' . $altSlug . $suffix) }}">
            @endforeach
            <link rel="alternate" hreflang="x-default" href="{{ url('/' . config('locales.default') . $suffix) }}">
        @endif

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
