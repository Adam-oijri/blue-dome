<?php

namespace App\Services\Notifications;

use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Lang;

/**
 * Builds the unified dashboard notification feed from two sources:
 *  - targeted alerts (notifications table, per-user, already localized);
 *  - clinic activity (activity_log create/update/remove + key verbs), built
 *    server-side in the viewer's locale, excluding the viewer's own actions.
 * Super-admins see cross-clinic activity (RLS bypasses for them).
 */
class NotificationFeedService
{
    /** @var array<int, string> */
    private const ACTIVITY_VERBS = [
        'create', 'update', 'delete', 'soft_delete', 'restore',
        'status_change', 'confirm_appointment', 'send_invoice', 'send_prescription',
    ];

    /**
     * Unread badge: unread targeted alerts + clinic activity newer than the
     * user's seen-at watermark. Capped at 99.
     */
    public function unreadCount(User $user): int
    {
        $alerts = Notification::query()->forUser($user->id)->unread()->count();

        // Floor the window when the user has never opened notifications, so a
        // fresh account (esp. a super-admin over all clinics) doesn't count the
        // entire activity history.
        $since = $user->notifications_seen_at ?? now()->subDays(14);

        $activity = $this->activityQuery($user)
            ->where('created_at', '>', $since)
            ->count();

        return (int) min($alerts + $activity, 99);
    }

    /**
     * Merged, time-sorted recent feed items.
     *
     * @return array<int, array<string, mixed>>
     */
    public function recent(User $user, int $limit = 15): array
    {
        $alerts = Notification::query()
            ->forUser($user->id)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Notification $n): array => $this->alertItem($n));

        $activity = $this->activityQuery($user)
            ->with(['user:id,first_name,last_name'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (ActivityLog $a): array => $this->activityItem($a, $user));

        return $alerts->concat($activity)
            ->sortByDesc('at')
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * @return Builder<ActivityLog>
     */
    private function activityQuery(User $user): Builder
    {
        $query = ActivityLog::query()
            ->whereIn('action', self::ACTIVITY_VERBS)
            ->where(function (Builder $q) use ($user): void {
                $q->whereNull('user_id')->orWhere('user_id', '!=', $user->id);
            });

        if ($user->role !== 'super_admin') {
            $query->where('clinic_id', $user->clinic_id);
        }

        return $query;
    }

    /**
     * @return array<string, mixed>
     */
    private function alertItem(Notification $n): array
    {
        return [
            'id' => 'alert-'.$n->id,
            'notification_id' => $n->id,
            'kind' => 'alert',
            'type' => $n->type,
            'title' => $n->title,
            'message' => $n->message,
            'href' => $n->action_url,
            'at' => $n->created_at?->toIso8601String(),
            'read' => (bool) $n->is_read,
            'important' => (bool) $n->is_important,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function activityItem(ActivityLog $a, User $viewer): array
    {
        $actor = $a->user
            ? trim($a->user->first_name.' '.$a->user->last_name)
            : '—';

        $entityKey = 'notifications.entity.'.($a->entity_type ?? 'default');
        $entity = Lang::has($entityKey) ? __($entityKey) : __('notifications.entity.default');

        $verbKey = 'notifications.activity.'.$a->action;
        $title = __(
            Lang::has($verbKey) ? $verbKey : 'notifications.activity.default',
            ['actor' => $actor, 'entity' => $entity],
        );

        $seenAt = $viewer->notifications_seen_at;

        return [
            'id' => 'activity-'.$a->id,
            'notification_id' => null,
            'kind' => 'activity',
            'type' => $a->action,
            'title' => $title,
            'message' => null,
            'href' => null,
            'at' => $a->created_at?->toIso8601String(),
            'read' => $seenAt !== null && $a->created_at !== null && $a->created_at <= $seenAt,
            'important' => false,
        ];
    }
}
