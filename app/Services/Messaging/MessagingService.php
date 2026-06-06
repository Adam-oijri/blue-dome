<?php

namespace App\Services\Messaging;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Closure;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

/**
 * Staff chat domain logic: the per-clinic group channel, 1:1 DMs (including
 * cross-clinic DMs with the platform super admin), membership, posting, read
 * watermarks and unread counts.
 *
 * Tenancy: conversations are clinic-scoped via the `tenant_isolation` RLS
 * policy. A super-admin↔staff DM is stored under the STAFF member's clinic_id
 * — the staff side sees it through normal RLS, the super admin through the
 * `fn_is_super_admin()` bypass. Display names are denormalized onto messages
 * and participant rows so neither side needs to join `users` across the clinic
 * boundary (which RLS would block for staff reading a super-admin row). The
 * handful of staff→super-admin lookups that genuinely need the super-admin's
 * user row run under {@see self::elevated()}.
 */
class MessagingService
{
    private const CLINIC_KEY = 'clinic';

    private const STAFF_ROLES = ['doctor', 'secretary'];

    private const SUPER_ADMIN = 'super_admin';

    /**
     * The per-clinic group channel, ensuring the caller has a participant row
     * (created caught-up so there's no historical unread backlog).
     */
    public function clinicChannel(User $user): Conversation
    {
        $conversation = Conversation::firstOrCreate(
            ['clinic_id' => $user->clinic_id, 'dedupe_key' => self::CLINIC_KEY],
            ['type' => 'clinic'],
        );

        ConversationParticipant::firstOrCreate(
            ['conversation_id' => $conversation->id, 'user_id' => $user->id],
            [
                'clinic_id' => $user->clinic_id,
                'display_name' => $this->displayName($user),
                'last_read_at' => now(),
                'created_at' => now(),
            ],
        );

        return $conversation;
    }

    /**
     * Resolve (or create) the 1:1 conversation between two users, deduped by
     * the sorted user pair. The conversation lives in the staff member's clinic
     * (for a super-admin↔staff DM) or the shared clinic (staff↔staff).
     */
    public function openDirect(User $me, User $other): Conversation
    {
        $clinicId = $this->directClinicId($me, $other);

        $pair = collect([$me->id, $other->id])->sort()->values()->all();
        $key = 'dm:'.implode(':', $pair);

        $conversation = Conversation::firstOrCreate(
            ['clinic_id' => $clinicId, 'dedupe_key' => $key],
            ['type' => 'direct'],
        );

        foreach ([$me, $other] as $participant) {
            ConversationParticipant::firstOrCreate(
                ['conversation_id' => $conversation->id, 'user_id' => $participant->id],
                [
                    'clinic_id' => $clinicId,
                    'display_name' => $this->displayName($participant),
                    'created_at' => now(),
                ],
            );
        }

        return $conversation;
    }

    /**
     * The conversations to show the user: their DMs (any clinic, for the super
     * admin) plus — for clinic staff — their clinic channel.
     *
     * @return array<int, array<string, mixed>>
     */
    public function conversationsFor(User $user): array
    {
        if ($this->isStaff($user)) {
            $this->clinicChannel($user); // ensure the channel + participant row exists
        }

        $ids = ConversationParticipant::query()
            ->where('user_id', $user->id)
            ->pluck('conversation_id');

        return Conversation::query()
            ->whereIn('id', $ids)
            ->with('participants')
            ->orderByDesc('last_message_at')
            ->get()
            ->map(fn (Conversation $c): array => $this->summarize($c, $user))
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function summarize(Conversation $conversation, User $user): array
    {
        $mine = $conversation->participants->firstWhere('user_id', $user->id);

        $last = Message::query()
            ->where('conversation_id', $conversation->id)
            ->orderByDesc('seq')
            ->first(['body']);

        $unread = Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->when($mine?->last_read_at, fn ($q) => $q->where('created_at', '>', $mine->last_read_at))
            ->count();

        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'title' => $this->title($conversation, $user),
            'last_message' => $last?->body,
            'last_message_at' => $conversation->last_message_at?->toIso8601String(),
            'unread' => $unread,
        ];
    }

    /**
     * Thread messages — the latest page on first load, or just those after
     * `$afterId` for the poller. Always returned chronologically by `seq`.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function messages(Conversation $conversation, ?string $afterId = null, int $limit = 50): Collection
    {
        $base = Message::query()->where('conversation_id', $conversation->id);

        if ($afterId !== null) {
            $afterSeq = Message::query()->whereKey($afterId)->value('seq');
            $rows = $base
                ->when($afterSeq !== null, fn ($q) => $q->where('seq', '>', $afterSeq))
                ->orderBy('seq')
                ->limit($limit)
                ->get();
        } else {
            $rows = $base->orderByDesc('seq')->limit($limit)->get()->reverse()->values();
        }

        return $rows->map(fn (Message $m): array => [
            'id' => $m->id,
            'body' => $m->body,
            'sender_id' => $m->sender_id,
            'sender_name' => $m->sender_name ?: '—',
            'at' => $m->created_at?->toIso8601String(),
        ]);
    }

    public function post(User $sender, Conversation $conversation, string $body): Message
    {
        $now = now();

        // Decide who to email BEFORE inserting (so the new message doesn't
        // count toward "already has unread") — only super-admin recipients who
        // are currently caught up, to avoid re-emailing an unread thread.
        $emailRecipients = $this->superAdminRecipientsToEmail($sender, $conversation);

        $message = Message::create([
            'clinic_id' => $conversation->clinic_id,
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'sender_name' => $this->displayName($sender),
            'body' => $body,
            'created_at' => $now,
        ]);

        $conversation->forceFill(['last_message_at' => $now])->save();

        // The sender is caught up on their own message.
        ConversationParticipant::updateOrCreate(
            ['conversation_id' => $conversation->id, 'user_id' => $sender->id],
            [
                'clinic_id' => $conversation->clinic_id,
                'display_name' => $this->displayName($sender),
                'last_read_at' => $now,
            ],
        );

        $this->emailNewMessage($emailRecipients, $sender, $body);

        return $message;
    }

    public function markRead(User $user, Conversation $conversation): void
    {
        ConversationParticipant::updateOrCreate(
            ['conversation_id' => $conversation->id, 'user_id' => $user->id],
            [
                'clinic_id' => $conversation->clinic_id,
                'display_name' => $this->displayName($user),
                'last_read_at' => now(),
            ],
        );
    }

    /**
     * Access rule: the clinic channel is for staff of that clinic; a direct
     * conversation is gated purely on membership (which works for the super
     * admin across the clinic boundary).
     */
    public function canAccess(User $user, Conversation $conversation): bool
    {
        if ($conversation->type === 'clinic') {
            return $this->isStaff($user) && $conversation->clinic_id === $user->clinic_id;
        }

        return ConversationParticipant::query()
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->exists();
    }

    /** Total unread across the user's conversations (for the sidebar badge). */
    public function unreadTotal(User $user): int
    {
        $count = DB::table('messages as m')
            ->join('conversation_participants as p', function ($join) use ($user): void {
                $join->on('p.conversation_id', '=', 'm.conversation_id')
                    ->where('p.user_id', '=', $user->id);
            })
            ->where('m.sender_id', '!=', $user->id)
            ->where(fn ($q) => $q->whereNull('p.last_read_at')->orWhereColumn('m.created_at', '>', 'p.last_read_at'))
            ->count();

        return (int) min($count, 99);
    }

    /**
     * People the user can start a direct conversation with:
     * - super admin → every active doctor/secretary, across all clinics;
     * - staff → their active clinic colleagues + the platform super admin(s)
     *   ("contact platform support").
     *
     * @return Collection<int, User>
     */
    public function colleagues(User $user): Collection
    {
        if ($this->isSuperAdmin($user)) {
            return User::query()
                ->whereIn('role', self::STAFF_ROLES)
                ->where('is_active', true)
                ->with('clinic:id,name')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'role', 'clinic_id']);
        }

        $clinicStaff = User::query()
            ->where('clinic_id', $user->clinic_id)
            ->whereIn('role', self::STAFF_ROLES)
            ->where('is_active', true)
            ->where('id', '!=', $user->id)
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'role', 'clinic_id']);

        return $clinicStaff->concat($this->activeSuperAdmins());
    }

    /**
     * Resolve the other party of a `start` request. A staff member cannot read
     * the platform super admin's user row across the clinic boundary, so that
     * single case is resolved under elevation; everything else uses the
     * caller's own (RLS-scoped) visibility.
     */
    public function resolveCounterpart(User $actor, string $userId): User
    {
        $user = User::find($userId);

        if ($user !== null) {
            return $user;
        }

        if ($this->isStaff($actor)) {
            $superAdmin = $this->elevated(fn () => User::query()
                ->whereKey($userId)
                ->where('role', self::SUPER_ADMIN)
                ->where('is_active', true)
                ->first());

            if ($superAdmin !== null) {
                return $superAdmin;
            }
        }

        abort(404);
    }

    private function title(Conversation $conversation, User $user): ?string
    {
        if ($conversation->type === 'clinic') {
            return null; // frontend renders a localized "Clinic team" label
        }

        $other = $conversation->participants->firstWhere(
            fn (ConversationParticipant $p) => $p->user_id !== $user->id,
        );

        return $other?->display_name ?: '—';
    }

    /**
     * The clinic a direct conversation belongs to, validating the pair is a
     * legitimate counterpart combination. Aborts 422 otherwise.
     */
    private function directClinicId(User $me, User $other): string
    {
        abort_if($other->id === $me->id, 422);
        abort_unless((bool) $other->is_active, 422);

        // super admin ↔ staff: live in the staff member's clinic.
        if ($this->isSuperAdmin($me) && $this->isStaff($other)) {
            return $other->clinic_id;
        }

        if ($this->isSuperAdmin($other) && $this->isStaff($me)) {
            return $me->clinic_id;
        }

        // staff ↔ staff: must share a clinic.
        if ($this->isStaff($me) && $this->isStaff($other) && $me->clinic_id === $other->clinic_id) {
            return $me->clinic_id;
        }

        abort(422);
    }

    /**
     * Super-admin participants of the conversation (other than the sender) who
     * are currently caught up — i.e. should receive a "new message" email
     * rather than being re-notified about an already-unread thread. Resolved
     * under elevation since their user rows are cross-clinic.
     *
     * @return Collection<int, User>
     */
    private function superAdminRecipientsToEmail(User $sender, Conversation $conversation): Collection
    {
        // The super admin only ever appears in direct conversations.
        if ($conversation->type !== 'direct' || $this->isSuperAdmin($sender)) {
            return collect();
        }

        $otherUserIds = ConversationParticipant::query()
            ->where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $sender->id)
            ->pluck('user_id');

        if ($otherUserIds->isEmpty()) {
            return collect();
        }

        $superAdmins = $this->elevated(fn () => User::query()
            ->whereIn('id', $otherUserIds)
            ->where('role', self::SUPER_ADMIN)
            ->where('is_active', true)
            ->get(['id', 'email', 'locale', 'first_name', 'last_name']));

        return $superAdmins->filter(
            fn (User $recipient) => $this->isCaughtUp($recipient, $conversation),
        )->values();
    }

    private function isCaughtUp(User $recipient, Conversation $conversation): bool
    {
        $lastRead = ConversationParticipant::query()
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $recipient->id)
            ->value('last_read_at');

        return ! Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $recipient->id)
            ->when($lastRead, fn ($q) => $q->where('created_at', '>', $lastRead))
            ->exists();
    }

    /**
     * Queue a localized "new message" email to each recipient. Sent on-demand
     * (anonymous notifiable) so the queue worker — which has no tenant context
     * — never has to re-fetch an RLS-hidden super-admin user row.
     *
     * @param  Collection<int, User>  $recipients
     */
    private function emailNewMessage(Collection $recipients, User $sender, string $body): void
    {
        foreach ($recipients as $recipient) {
            if (! $recipient->email) {
                continue;
            }

            Notification::route('mail', $recipient->email)->notify(
                (new NewMessageNotification($this->displayName($sender), Str::limit($body, 140)))
                    ->locale($recipient->preferredLocale() ?? config('app.locale')),
            );
        }
    }

    /**
     * Active platform super admins (resolved under elevation so a staff caller,
     * scoped to their own clinic by RLS, can still discover "platform support").
     *
     * @return Collection<int, User>
     */
    private function activeSuperAdmins(): Collection
    {
        return $this->elevated(fn () => User::query()
            ->where('role', self::SUPER_ADMIN)
            ->where('is_active', true)
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'role', 'clinic_id']));
    }

    /**
     * Run a read under a transaction-local super-admin GUC so it can see across
     * the clinic boundary, reverting on commit. Transaction-local (not session)
     * is required: a SET LOCAL only holds inside an explicit transaction, and a
     * plain request runs outside one (see SetTenantContext).
     *
     * @template T
     *
     * @param  Closure(): T  $callback
     * @return T
     */
    private function elevated(Closure $callback): mixed
    {
        return DB::transaction(function () use ($callback) {
            DB::statement("SELECT set_config('app.is_super_admin', 'true', true)");

            return $callback();
        });
    }

    private function isStaff(User $user): bool
    {
        return in_array($user->role, self::STAFF_ROLES, true);
    }

    private function isSuperAdmin(User $user): bool
    {
        return $user->role === self::SUPER_ADMIN;
    }

    private function displayName(User $user): string
    {
        return trim($user->first_name.' '.$user->last_name) ?: '—';
    }
}
