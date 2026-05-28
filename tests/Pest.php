<?php

use Illuminate\Foundation\Testing\DatabaseTruncation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
*/

/*
 * Standard Feature tests run inside a RefreshDatabase transaction. Set the
 * super-admin GUC at the top of every test so factories can write to
 * clinic-scoped tables without going through the SetTenantContext middleware
 * — the `true` third argument scopes the value to the wrapping transaction,
 * which is rolled back along with the data at the end of the test.
 */
pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->beforeEach(function () {
        DB::statement("SELECT set_config('app.is_super_admin', 'true', true)");

        // Every test path lives under a `{locale}` prefix; seed the URL
        // generator with the default slug so `route('foo')` calls (which the
        // SetLocale middleware would otherwise fill in via URL::defaults
        // mid-request) resolve to a complete URL when called from a test.
        URL::defaults(['locale' => config('locales.default')]);
    })
    ->in('Feature');

/*
 * RLS tests open multiple Postgres connections to assert tenant isolation
 * across concurrent sessions. RefreshDatabase wraps the whole test in a
 * single transaction, which collapses those sessions into one and defeats
 * the test. DatabaseTruncation migrates the schema once per process and
 * truncates between tests without wrapping in a transaction.
 */
pest()->extend(TestCase::class)
    ->use(DatabaseTruncation::class)
    ->in('Rls');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
*/

function something()
{
    // ..
}
