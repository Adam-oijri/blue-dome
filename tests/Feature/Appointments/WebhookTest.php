<?php

use App\Models\Clinic;
use App\Models\WhatsAppIntegration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->verifyToken = 'verify-'.Str::random(16);

    $this->integration = WhatsAppIntegration::create([
        'clinic_id' => $this->clinic->id,
        'phone_number_id' => '111222333',
        'business_account_id' => '444555666',
        'access_token_enc' => 'fake-access',
        'webhook_verify_token_enc' => $this->verifyToken,
        'is_active' => true,
    ]);
});

it('completes the Meta verify handshake by echoing hub_challenge', function () {
    $response = $this->get(route('webhooks.whatsapp.verify', [
        'hub_mode' => 'subscribe',
        'hub_verify_token' => $this->verifyToken,
        'hub_challenge' => '42',
    ]));

    $response->assertOk();
    expect($response->getContent())->toBe('42');

    expect($this->integration->fresh()->webhook_verified)->toBeTrue();
});

it('rejects the handshake with the wrong verify token', function () {
    $this->get(route('webhooks.whatsapp.verify', [
        'hub_mode' => 'subscribe',
        'hub_verify_token' => 'wrong-token',
        'hub_challenge' => '42',
    ]))->assertForbidden();
});

it('updates message_log.status on a delivery status callback', function () {
    $logId = (string) Str::uuid();

    DB::table('message_log')->insert([
        'id' => $logId,
        'clinic_id' => $this->clinic->id,
        'message_type' => 'whatsapp',
        'direction' => 'outbound',
        'recipient_type' => 'patient',
        'recipient_id' => (string) Str::uuid(),
        'recipient_contact' => '+212600000000',
        'recipient_name' => 'Test',
        'body' => 'Confirm: https://x.y',
        'provider_message_id' => 'wamid.fake-1',
        'status' => 'sent',
        'sent_at' => now(),
        'created_at' => now(),
    ]);

    $this->postJson(route('webhooks.whatsapp.status', ['verify_token' => $this->verifyToken]), [
        'entry' => [[
            'changes' => [[
                'value' => [
                    'statuses' => [[
                        'id' => 'wamid.fake-1',
                        'status' => 'delivered',
                        'timestamp' => (string) now()->timestamp,
                    ]],
                ],
            ]],
        ]],
    ])->assertSuccessful();

    $row = DB::table('message_log')->where('id', $logId)->first();
    expect($row->status)->toBe('delivered');
    expect($row->delivered_at)->not->toBeNull();
});
