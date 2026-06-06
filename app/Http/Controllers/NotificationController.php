<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\Notifications\NotificationFeedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(private NotificationFeedService $feed) {}

    /**
     * Full "view all" feed page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('notifications/index', [
            'items' => $this->feed->recent($request->user(), 50),
        ]);
    }

    /**
     * JSON feed for the topbar bell dropdown (lazy-loaded on open).
     */
    public function feed(Request $request): JsonResponse
    {
        return response()->json([
            'items' => $this->feed->recent($request->user(), 15),
            'unread' => $this->feed->unreadCount($request->user()),
        ]);
    }

    /**
     * Mark a single targeted alert as read. Scoped to the actor so a foreign
     * notification id simply 404s (ownership enforced by the query).
     */
    public function markRead(Request $request, string $locale, string $notification): RedirectResponse
    {
        unset($locale);

        Notification::query()
            ->forUser($request->user()->id)
            ->where('id', $notification)
            ->firstOrFail()
            ->forceFill(['is_read' => true, 'read_at' => now()])
            ->save();

        return back();
    }

    /**
     * Clear everything: mark all alerts read and advance the activity-feed
     * seen-at watermark so the unread badge resets to zero.
     */
    public function markAllRead(Request $request, string $locale): RedirectResponse
    {
        unset($locale);

        $user = $request->user();

        Notification::query()
            ->forUser($user->id)
            ->unread()
            ->update(['is_read' => true, 'read_at' => now()]);

        $user->forceFill(['notifications_seen_at' => now()])->saveQuietly();

        return back();
    }
}
