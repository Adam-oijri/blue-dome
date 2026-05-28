<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    /**
     * Send each role to its panel. The route names match the controllers
     * registered in routes/web.php under the corresponding role guard.
     */
    public function toResponse($request): Response
    {
        /** @var Request $request */
        $user = $request->user();

        $route = match ($user->role) {
            'super_admin' => 'super-admin.dashboard',
            'doctor' => 'doctor.dashboard',
            'secretary' => 'secretary.dashboard',
            default => 'dashboard',
        };

        return $request->wantsJson()
            ? response()->json(['two_factor' => false, 'redirect' => route($route)])
            : Inertia::location(route($route));
    }
}
