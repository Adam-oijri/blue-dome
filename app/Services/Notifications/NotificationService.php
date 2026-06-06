<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Lang;

/**
 * Creates targeted in-app alerts (the notifications table). Each row's
 * title/message is rendered in the recipient's own locale at write time, so
 * the feed reads back already-localized. The acting user is never self-alerted.
 *
 * RLS: alerts are written in-request where SetTenantContext has set the actor's
 * clinic GUC, and recipients are always in that same clinic, so the inserts
 * satisfy the table's tenant_isolation WITH CHECK without elevation.
 */
class NotificationService
{
    /**
     * @param  iterable<User>  $recipients
     * @param  array<string, string>  $params  interpolation for the alert copy
     */
    public function send(
        iterable $recipients,
        string $type,
        array $params = [],
        ?string $actionUrl = null,
        ?string $referenceType = null,
        ?string $referenceId = null,
        bool $important = false,
    ): void {
        $actorId = Auth::id();
        $now = now();

        foreach ($recipients as $user) {
            if ($user->id === $actorId) {
                continue;
            }

            $locale = $user->locale ?: config('app.locale');

            // Notifications are best-effort: a failure here must never roll back
            // the action that triggered it (creating the appointment, payment…).
            try {
                Notification::create([
                    'clinic_id' => $user->clinic_id,
                    'user_id' => $user->id,
                    'type' => $type,
                    'title' => Lang::get("notifications.alert.{$type}.title", [], $locale),
                    'message' => Lang::get("notifications.alert.{$type}.message", $params, $locale),
                    'is_read' => false,
                    'is_important' => $important,
                    'action_url' => $actionUrl,
                    'reference_type' => $referenceType,
                    'reference_id' => $referenceId,
                    'created_by' => $actorId,
                    'created_at' => $now,
                ]);
            } catch (\Throwable $e) {
                report($e);
            }
        }
    }

    /**
     * Active users of a clinic holding the given role — the recipient set for
     * role-targeted alerts (e.g. secretaries for billing/stock).
     *
     * @return Collection<int, User>
     */
    public function clinicRole(string $clinicId, string $role): Collection
    {
        return User::query()
            ->where('clinic_id', $clinicId)
            ->where('role', $role)
            ->where('is_active', true)
            ->get();
    }
}
