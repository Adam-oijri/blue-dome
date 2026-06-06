<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('root path redirects to default locale landing', function (): void {
    $this->get('/')->assertRedirect('/ma-fr/');
});

test('unprefixed paths inside the locale group redirect to default locale', function (): void {
    $this->get('/super-admin')->assertRedirect('/ma-fr/super-admin');
});

test('unprefixed Fortify routes redirect to default locale equivalent', function (): void {
    $this->get('/login')->assertRedirect('/ma-fr/login');
});

test('valid locale slugs render the landing', function (string $slug): void {
    $this->get('/'.$slug.'/')->assertOk();
})->with(['ma-en', 'ma-fr', 'ma-ar']);

test('unsupported locale slugs return 404 (no fallback loop)', function (): void {
    $this->get('/ma-de/')->assertNotFound();
});

test('authenticated user locale syncs from URL', function (): void {
    $user = User::factory()->doctor()->create(['locale' => 'fr']);

    $this->actingAs($user)->get('/ma-en/doctor');

    expect($user->fresh()->locale)->toBe('en');
});

test('Inertia locale prop carries the slug and metadata', function (): void {
    $response = $this->get('/ma-ar/');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('locale.slug', 'ma-ar')
            ->where('locale.lang', 'ar')
            ->where('locale.dir', 'rtl')
            ->where('locale.country', 'MA')
            ->etc()
        );
});

test('hreflang tags emit one row per supported locale', function (): void {
    $body = $this->get('/ma-fr/')->getContent();

    expect($body)->toContain('hreflang="en-MA"')
        ->toContain('hreflang="fr-MA"')
        ->toContain('hreflang="ar-MA"')
        ->toContain('hreflang="x-default"');
});
