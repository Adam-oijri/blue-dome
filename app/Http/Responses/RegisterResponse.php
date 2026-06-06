<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Send a freshly-registered user to their role panel. Fortify's default
     * targets `fortify.home` ('/'), which would drop the new (still-unverified)
     * clinic manager on the public landing page; routing to their home route
     * instead lets the `verified` middleware bounce them to the email
     * verification screen — the correct first-run experience. Mirrors
     * LoginResponse so both flows share one redirect rule.
     */
    public function toResponse($request): Response
    {
        /** @var Request $request */
        $route = $request->user()->homeRouteName();

        return $request->wantsJson()
            ? response()->json(['redirect' => route($route)])
            : Inertia::location(route($route));
    }
}
