<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\EmailVerificationNotificationSentResponse as EmailVerificationNotificationSentResponseContract;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

class EmailVerificationNotificationSentResponse implements EmailVerificationNotificationSentResponseContract
{
    /**
     * Fortify's default returns a bare back() that falls through to "/" when
     * there is no referer, dropping the {locale} segment. Fall back to the
     * locale-aware home route instead.
     */
    public function toResponse($request): Response
    {
        return $request->wantsJson()
            ? new JsonResponse('', 202)
            : back(fallback: route('home'))->with('status', Fortify::VERIFICATION_LINK_SENT);
    }
}
