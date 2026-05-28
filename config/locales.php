<?php

/*
 * Supported locale slugs are {country}-{lang} pairs.
 * Adding a new locale is a config-only change here. The route constraint
 * regex is derived from this array's keys at runtime by SetLocale middleware
 * and routes/web.php (see App\Support\LocaleRegistry::slugRegex()).
 */
return [
    'default' => 'ma-fr',

    'fallback_lang' => 'fr',

    'supported' => [
        'ma-en' => ['country' => 'MA', 'lang' => 'en', 'dir' => 'ltr', 'label' => 'English'],
        'ma-fr' => ['country' => 'MA', 'lang' => 'fr', 'dir' => 'ltr', 'label' => 'Français'],
        'ma-ar' => ['country' => 'MA', 'lang' => 'ar', 'dir' => 'rtl', 'label' => 'العربية'],
        // Phase 2 additions go here: 'fr-fr', 'fr-en', 'tn-ar', 'tn-fr', 'dz-ar', 'dz-fr', etc.
    ],
];
