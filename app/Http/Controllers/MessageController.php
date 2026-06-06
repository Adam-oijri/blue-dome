<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\User;
use App\Services\Messaging\MessagingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function __construct(private MessagingService $messaging) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $active = $this->resolveActive($user, $request->string('conversation')->toString() ?: null);

        $this->messaging->markRead($user, $active);

        return Inertia::render('messages/index', [
            'conversations' => $this->messaging->conversationsFor($user),
            'colleagues' => $this->messaging->colleagues($user)->map(fn (User $u): array => [
                'id' => $u->id,
                'name' => trim($u->first_name.' '.$u->last_name),
                'role' => $u->role,
                'clinic' => $u->relationLoaded('clinic') ? $u->clinic?->name : null,
            ])->all(),
            'active_id' => $active->id,
            // Named `thread` (not `messages`) to avoid colliding with the
            // shared `messages` badge prop in HandleInertiaRequests.
            'thread' => $this->messaging->messages($active),
        ]);
    }

    /**
     * JSON poller: new messages in a conversation after `?after=<id>`, plus
     * refreshed conversation summaries + unread total.
     */
    public function poll(Request $request): JsonResponse
    {
        $user = $request->user();
        $conversation = Conversation::findOrFail($request->string('conversation')->toString());
        abort_unless($this->messaging->canAccess($user, $conversation), 403);

        $messages = $this->messaging->messages(
            $conversation,
            $request->string('after')->toString() ?: null,
        );

        $this->messaging->markRead($user, $conversation);

        return response()->json([
            'messages' => $messages,
            'conversations' => $this->messaging->conversationsFor($user),
            'unread' => $this->messaging->unreadTotal($user),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'conversation_id' => ['required', 'string'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $conversation = Conversation::findOrFail($validated['conversation_id']);
        abort_unless($this->messaging->canAccess($user, $conversation), 403);

        $this->messaging->post($user, $conversation, $validated['body']);

        return back();
    }

    /**
     * Open (or create) a direct conversation with a colleague.
     */
    public function start(Request $request): RedirectResponse
    {
        $validated = $request->validate(['user_id' => ['required', 'string']]);

        $other = $this->messaging->resolveCounterpart($request->user(), $validated['user_id']);
        $conversation = $this->messaging->openDirect($request->user(), $other);

        return redirect()->route('messages.index', ['conversation' => $conversation->id]);
    }

    public function read(Request $request, string $locale, string $conversation): RedirectResponse
    {
        unset($locale);

        $model = Conversation::findOrFail($conversation);
        abort_unless($this->messaging->canAccess($request->user(), $model), 403);

        $this->messaging->markRead($request->user(), $model);

        return back();
    }

    private function resolveActive(User $user, ?string $activeId): Conversation
    {
        if ($activeId !== null) {
            $conversation = Conversation::find($activeId);

            if ($conversation !== null && $this->messaging->canAccess($user, $conversation)) {
                return $conversation;
            }
        }

        return $this->messaging->clinicChannel($user);
    }
}
