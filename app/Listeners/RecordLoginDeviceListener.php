<?php

namespace App\Listeners;

use App\Models\User;
use App\Models\UserKnownDevice;
use App\Notifications\NewDeviceLoginNotification;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\DB;

/**
 * On every successful login, fingerprint the device (user-agent) and remember
 * it. A sign-in from a device not seen before on an existing account triggers
 * a security-alert email; the user's first-ever device is recorded silently
 * (no alert right after signup / first login).
 *
 * The Login event fires before SetTenantContext sets the tenant GUC, so the
 * device write is wrapped in a transaction with a transaction-local
 * super-admin elevation to satisfy the table's RLS policy. See
 * [[project_rls_provisioning_elevation]].
 */
class RecordLoginDeviceListener
{
    public function handle(Login $event): void
    {
        $user = $event->user;

        if (! $user instanceof User) {
            return;
        }

        $request = request();
        $userAgent = $request?->userAgent();
        $ip = $request?->ip() ?? '0.0.0.0';
        $deviceHash = hash('sha256', (string) $userAgent);

        $shouldAlert = DB::transaction(function () use ($user, $deviceHash, $ip, $userAgent): bool {
            DB::statement("SELECT set_config('app.is_super_admin', 'true', true)");

            $existing = UserKnownDevice::query()
                ->where('user_id', $user->id)
                ->where('device_hash', $deviceHash)
                ->first();

            if ($existing !== null) {
                $existing->forceFill(['ip_address' => $ip, 'last_seen_at' => now()])->save();

                return false;
            }

            $hadDevices = UserKnownDevice::query()->where('user_id', $user->id)->exists();

            UserKnownDevice::create([
                'clinic_id' => $user->clinic_id,
                'user_id' => $user->id,
                'device_hash' => $deviceHash,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'last_seen_at' => now(),
            ]);

            return $hadDevices;
        });

        if ($shouldAlert) {
            $user->notify(new NewDeviceLoginNotification(
                ip: $ip,
                userAgent: $userAgent,
                when: now()->toDayDateTimeString(),
            ));
        }
    }
}
