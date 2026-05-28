<?php

namespace App\Support;

/**
 * Single source of truth for which {country}-{lang} slugs the app understands.
 * Backed by config/locales.php so adding a new locale is a config-only change.
 */
class LocaleRegistry
{
    /**
     * @return array<string, array{country: string, lang: string, dir: string, label: string}>
     */
    public static function supported(): array
    {
        return config('locales.supported', []);
    }

    public static function default(): string
    {
        return config('locales.default', 'ma-fr');
    }

    public static function fallbackLang(): string
    {
        return config('locales.fallback_lang', 'fr');
    }

    /**
     * @return array{country: string, lang: string, dir: string, label: string}|null
     */
    public static function entry(string $slug): ?array
    {
        return self::supported()[$slug] ?? null;
    }

    public static function isSupported(string $slug): bool
    {
        return array_key_exists($slug, self::supported());
    }

    /**
     * Regex used as the route-parameter `where` constraint. Excludes `^$`
     * delimiters so it composes with Laravel's own anchoring.
     */
    public static function slugRegex(): string
    {
        $keys = array_keys(self::supported());

        if (empty($keys)) {
            return 'ma-(en|fr|ar)';
        }

        return implode('|', array_map('preg_quote', $keys));
    }

    /**
     * Resolve the best locale slug for a given user, falling back to the
     * configured default if neither user nor clinic has a usable preference.
     *
     * @param  array{country?: ?string, lang?: ?string}  $hint
     */
    public static function resolveSlug(array $hint): string
    {
        $country = $hint['country'] ?? 'MA';
        $lang = $hint['lang'] ?? self::fallbackLang();
        $candidate = strtolower($country).'-'.strtolower($lang);

        return self::isSupported($candidate) ? $candidate : self::default();
    }
}
