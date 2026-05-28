<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClinicSettings\UpdateWhatsAppRequest;
use App\Models\Clinic;
use App\Models\WhatsAppIntegration;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Cross-tenant view of a clinic's WhatsApp configuration. Mirrors
 * App\Http\Controllers\ClinicSettings\WhatsAppController but takes the
 * {clinic} from the URL instead of Auth::user()->clinic.
 */
class ClinicWhatsAppController extends Controller
{
    public function edit(string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('update', $clinic);

        $integration = $clinic->whatsappIntegration;

        return Inertia::render('panels/super-admin/clinics/whatsapp', [
            'clinic' => [
                'id' => $clinic->id,
                'name' => $clinic->name,
            ],
            'webhookUrl' => rtrim(config('app.url'), '/').'/webhooks/whatsapp',
            'integration' => $integration ? [
                'phone_number_id' => $integration->phone_number_id,
                'business_account_id' => $integration->business_account_id,
                'display_phone_number' => $integration->display_phone_number,
                'daily_message_limit' => $integration->daily_message_limit,
                'is_active' => (bool) $integration->is_active,
                'webhook_verified' => (bool) $integration->webhook_verified,
                'messages_sent_today' => $integration->messages_sent_today,
                'quality_rating' => $integration->quality_rating,
                'messaging_limit_tier' => $integration->messaging_limit_tier,
                'has_access_token' => filled($integration->access_token_enc),
                'has_app_secret' => filled($integration->app_secret_enc),
                'has_webhook_verify_token' => filled($integration->webhook_verify_token_enc),
            ] : null,
        ]);
    }

    public function update(UpdateWhatsAppRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);
        $this->authorize('update', $clinic);

        $validated = $request->validated();
        $integration = WhatsAppIntegration::firstOrNew(['clinic_id' => $clinic->id]);

        $integration->phone_number_id = $validated['phone_number_id'];
        $integration->business_account_id = $validated['business_account_id'];
        $integration->display_phone_number = $validated['display_phone_number'] ?? null;
        $integration->daily_message_limit = $validated['daily_message_limit'];
        $integration->is_active = $validated['is_active'];

        if (! empty($validated['access_token'])) {
            $integration->access_token_enc = $validated['access_token'];
        } elseif (! $integration->exists) {
            return back()->withErrors([
                'access_token' => 'Access token is required to enable WhatsApp.',
            ]);
        }

        if (! empty($validated['app_secret'])) {
            $integration->app_secret_enc = $validated['app_secret'];
        }

        if (! empty($validated['webhook_verify_token'])) {
            $integration->webhook_verify_token_enc = $validated['webhook_verify_token'];
        }

        $integration->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('WhatsApp settings saved.')]);

        return to_route('super-admin.clinics.whatsapp.edit', ['clinic' => $clinic->id]);
    }
}
