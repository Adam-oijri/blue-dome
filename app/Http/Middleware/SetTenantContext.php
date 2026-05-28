<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Pushes the authenticated user, their clinic, and a super-admin flag into the
 * Postgres session via `set_config(..., true)`. Every clinic-scoped query and
 * every RLS policy reads from these GUCs through `fn_current_clinic_id()` and
 * `fn_is_super_admin()`. The third argument `true` scopes the value to the
 * current transaction — Laravel runs HTTP requests inside the implicit
 * connection-level transaction RefreshDatabase uses for tests, and inside an
 * explicit `DB::transaction()` for write paths in app code.
 */
class SetTenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user !== null) {
            DB::statement('SELECT set_config(?, ?, true)', [
                'app.current_user_id',
                (string) $user->id,
            ]);

            DB::statement('SELECT set_config(?, ?, true)', [
                'app.current_clinic_id',
                (string) ($user->clinic_id ?? ''),
            ]);

            DB::statement('SELECT set_config(?, ?, true)', [
                'app.is_super_admin',
                $user->role === 'super_admin' ? 'true' : 'false',
            ]);
        }

        return $next($request);
    }
}
