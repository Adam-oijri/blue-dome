<?php

/**
 * Every auth route is locale-prefixed ({locale}/login). Laravel's default
 * unauthenticated redirect calls route('login') with no locale, which throws
 * UrlGenerationException (500). bootstrap/app.php now configures
 * redirectGuestsTo() to resolve the slug from the request, so a guest hitting
 * a protected route is cleanly redirected to that locale's login — not a 500.
 */
it('redirects an unauthenticated request to the same-locale login (not a 500)', function (string $locale) {
    $this->get("/{$locale}/patients")
        ->assertRedirect(route('login', ['locale' => $locale]));
})->with(['ma-fr', 'ma-ar', 'ma-en']);

it('redirects unauthenticated billing access to the localized login', function () {
    $this->get('/ma-fr/invoices')
        ->assertRedirect(route('login', ['locale' => 'ma-fr']));
});
