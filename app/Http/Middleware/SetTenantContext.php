<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Pushes the authenticated user, their clinic, and a super-admin flag into the
 * Postgres session via `set_config(..., false)` (session-scoped). Every
 * clinic-scoped query and every RLS policy reads from these GUCs through
 * `fn_current_clinic_id()` / `fn_is_super_admin()`.
 *
 * Session scope (NOT transaction-local) is required: a normal HTTP request
 * runs OUTSIDE any transaction, so a `set_config(..., true)` (SET LOCAL) value
 * is discarded the moment that statement's implicit transaction ends — leaving
 * the GUCs empty and every RLS-protected read returning zero rows under a
 * non-BYPASSRLS database role (the production `blue_dome_app` role). For
 * unauthenticated requests we reset the GUCs so a reused/pooled connection
 * cannot inherit the previous request's tenant context.
 */
class SetTenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user !== null) {
            DB::statement('SELECT set_config(?, ?, false)', [
                'app.current_user_id',
                (string) $user->id,
            ]);

            DB::statement('SELECT set_config(?, ?, false)', [
                'app.current_clinic_id',
                (string) ($user->clinic_id ?? ''),
            ]);

            DB::statement('SELECT set_config(?, ?, false)', [
                'app.is_super_admin',
                $user->role === 'super_admin' ? 'true' : 'false',
            ]);
        } else {
            // Clear any tenant context left on a reused/pooled connection so a
            // guest request can't inherit the previous user's clinic.
            DB::statement('SELECT set_config(?, ?, false)', ['app.current_user_id', '']);
            DB::statement('SELECT set_config(?, ?, false)', ['app.current_clinic_id', '']);
            DB::statement('SELECT set_config(?, ?, false)', ['app.is_super_admin', '']);
        }

        return $next($request);
    }
}
