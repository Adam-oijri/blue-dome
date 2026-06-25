<?php

/**
 * Phase 9 exit-gate: every translatable key shipped in any of the three
 * locales (fr/ar/en) must exist in the other two.
 *
 * The IG §domain rules locks fr as primary, ar as RTL secondary, en as
 * tertiary. The string-coverage test guarantees a missing key in any locale
 * surfaces as a CI failure rather than as a fr-fallback at runtime — which
 * looks "fine" until an Arabic patient sees a stray French toast message
 * during a clinical workflow.
 *
 * As of the Phase 9 localization audit, validation.php is fully translated
 * in fr/ar (standard rule messages + the clinic-domain `attributes`), so it
 * is parity-checked in full like every other namespace — no exemption.
 */

/**
 * Flatten a translation array into a dot-notated keyset.
 *
 * @param  array<string, mixed>  $data
 * @return array<int, string>
 */
function flattenLangKeys(array $data, string $prefix = ''): array
{
    $keys = [];

    foreach ($data as $key => $value) {
        $path = $prefix === '' ? (string) $key : $prefix.'.'.$key;

        if (is_array($value)) {
            $keys = array_merge($keys, flattenLangKeys($value, $path));
        } else {
            $keys[] = $path;
        }
    }

    return $keys;
}

/**
 * Return [filename => keyset] for every PHP file in lang/{locale}.
 *
 * @return array<string, array<int, string>>
 */
function localeKeyMap(string $locale): array
{
    $dir = base_path('lang/'.$locale);

    if (! is_dir($dir)) {
        return [];
    }

    $map = [];
    foreach (glob($dir.'/*.php') as $file) {
        $name = basename($file, '.php');
        $data = require $file;
        if (! is_array($data)) {
            continue;
        }

        $map[$name] = flattenLangKeys($data);
    }

    return $map;
}

it('keeps every translation key in lockstep across fr / ar / en', function () {
    $maps = [
        'fr' => localeKeyMap('fr'),
        'ar' => localeKeyMap('ar'),
        'en' => localeKeyMap('en'),
    ];

    // 1. Every file present in any locale must be present in the others.
    $allFiles = array_unique(array_merge(
        array_keys($maps['fr']),
        array_keys($maps['ar']),
        array_keys($maps['en']),
    ));
    sort($allFiles);

    $missingFiles = [];
    foreach ($allFiles as $file) {
        foreach (['fr', 'ar', 'en'] as $locale) {
            if (! array_key_exists($file, $maps[$locale])) {
                $missingFiles[] = "lang/$locale/$file.php is missing";
            }
        }
    }

    expect($missingFiles)->toBe([], implode("\n", $missingFiles));

    // 2. Within each file, every key in any locale must be in the others.
    $missingKeys = [];
    foreach ($allFiles as $file) {
        $combined = array_unique(array_merge(
            $maps['fr'][$file] ?? [],
            $maps['ar'][$file] ?? [],
            $maps['en'][$file] ?? [],
        ));
        sort($combined);

        foreach (['fr', 'ar', 'en'] as $locale) {
            $present = $maps[$locale][$file] ?? [];
            $absent = array_diff($combined, $present);
            foreach ($absent as $key) {
                $missingKeys[] = "lang/$locale/$file.php missing key: $key";
            }
        }
    }

    expect($missingKeys)->toBe([], implode("\n", $missingKeys));
});
