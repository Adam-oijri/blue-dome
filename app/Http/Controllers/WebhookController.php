<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppIntegration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Meta WhatsApp webhook endpoints. Public — no auth — and we verify against
 * the `webhook_verify_token_enc` value stored per clinic in
 * `whatsapp_integration`. The verify handshake is GET; status callbacks are
 * POST. Both are unauthenticated; the token IS the auth.
 */
class WebhookController extends Controller
{
    public function verifyWhatsApp(Request $request): Response
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode !== 'subscribe' || ! is_string($token) || $challenge === null) {
            return response('Bad request', 400);
        }

        $integration = $this->integrationForToken($token);

        if ($integration === null) {
            return response('Forbidden', 403);
        }

        $integration->forceFill(['webhook_verified' => true])->save();

        return response((string) $challenge, 200);
    }

    public function whatsAppStatus(Request $request): JsonResponse
    {
        $token = $request->header('X-Hub-Verify-Token') ?? $request->query('verify_token');

        $integration = is_string($token) ? $this->integrationForToken($token) : null;

        if ($integration === null) {
            return response()->json(['ok' => false], 403);
        }

        $payload = $request->all();

        // Meta sends entry[*].changes[*].value.statuses[*] for delivery status updates.
        foreach (data_get($payload, 'entry.*.changes.*.value.statuses.*', []) as $status) {
            $wamid = data_get($status, 'id');
            $deliveryStatus = data_get($status, 'status');
            $timestamp = data_get($status, 'timestamp');

            if (! is_string($wamid) || ! is_string($deliveryStatus)) {
                continue;
            }

            $set = ['status' => $deliveryStatus];

            if ($deliveryStatus === 'delivered') {
                $set['delivered_at'] = $timestamp ? now()->createFromTimestamp((int) $timestamp) : now();
            } elseif ($deliveryStatus === 'read') {
                $set['read_at'] = $timestamp ? now()->createFromTimestamp((int) $timestamp) : now();
            } elseif ($deliveryStatus === 'failed') {
                $set['failed_at'] = $timestamp ? now()->createFromTimestamp((int) $timestamp) : now();
            }

            DB::table('message_log')
                ->where('provider_message_id', $wamid)
                ->update($set);
        }

        Log::info('whatsapp.webhook.status', ['clinic_id' => $integration->clinic_id]);

        return response()->json(['ok' => true]);
    }

    private function integrationForToken(string $token): ?WhatsAppIntegration
    {
        // The token is stored encrypted; we cannot use a SQL WHERE for it.
        // Iterating the active integrations is fine — there's one row per
        // clinic, capped by the platform's clinic count.
        return WhatsAppIntegration::query()
            ->where('is_active', true)
            ->get()
            ->first(function (WhatsAppIntegration $integration) use ($token): bool {
                try {
                    return $integration->webhook_verify_token_enc === $token;
                } catch (\Throwable) {
                    return false;
                }
            });
    }
}
