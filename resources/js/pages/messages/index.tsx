import { Head, Link, router, usePage } from '@inertiajs/react';
import { Hash, Plus, Send, Users } from 'lucide-react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { index, poll, start, store } from '@/routes/messages';

type ConversationSummary = {
    id: string;
    type: 'direct' | 'clinic';
    title: string | null;
    last_message: string | null;
    last_message_at: string | null;
    unread: number;
};

type Colleague = {
    id: string;
    name: string;
    role: string;
    clinic?: string | null;
};

type ChatMessage = {
    id: string;
    body: string;
    sender_id: string;
    sender_name: string;
    at: string | null;
};

type PollResponse = {
    messages?: ChatMessage[];
    conversations?: ConversationSummary[];
    unread?: number;
};

const LABELS = {
    en: {
        title: 'Messages',
        description: 'Chat with your clinic team',
        clinic_team: 'Clinic team',
        new_message: 'New message',
        no_messages: 'No messages yet',
        no_preview: 'No messages yet',
        placeholder: 'Write a message…',
        send: 'Send',
        role_doctor: 'Doctor',
        role_secretary: 'Secretary',
        role_super_admin: 'Platform support',
        no_colleagues: 'No colleagues to message',
    },
    fr: {
        title: 'Messagerie',
        description: 'Discutez avec votre équipe',
        clinic_team: 'Équipe de la clinique',
        new_message: 'Nouveau message',
        no_messages: 'Aucun message',
        no_preview: 'Aucun message',
        placeholder: 'Écrire un message…',
        send: 'Envoyer',
        role_doctor: 'Médecin',
        role_secretary: 'Secrétaire',
        role_super_admin: 'Support plateforme',
        no_colleagues: 'Aucun collègue à contacter',
    },
    ar: {
        title: 'الرسائل',
        description: 'تواصل مع فريق العيادة',
        clinic_team: 'فريق العيادة',
        new_message: 'رسالة جديدة',
        no_messages: 'لا توجد رسائل بعد',
        no_preview: 'لا توجد رسائل بعد',
        placeholder: 'اكتب رسالة…',
        send: 'إرسال',
        role_doctor: 'طبيب',
        role_secretary: 'سكرتير',
        role_super_admin: 'دعم المنصة',
        no_colleagues: 'لا يوجد زملاء للمراسلة',
    },
} as const;

function formatTime(at: string | null, lang: string): string {
    if (!at) {
        return '';
    }

    try {
        return new Intl.DateTimeFormat(lang, {
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(at));
    } catch {
        return '';
    }
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return '?';
    }

    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

/** Merge poll results into the current thread, ignoring messages already shown. */
function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    if (incoming.length === 0) {
        return current;
    }

    const seen = new Set(current.map((m) => m.id));
    const fresh = incoming.filter((m) => !seen.has(m.id));

    return fresh.length === 0 ? current : [...current, ...fresh];
}

export default function MessagesIndex({
    conversations,
    colleagues,
    active_id,
    thread,
}: {
    conversations: ConversationSummary[];
    colleagues: Colleague[];
    active_id: string;
    thread: ChatMessage[];
}) {
    const { slug: locale, lang } = useLocale();
    const t = LABELS[lang] ?? LABELS.en;
    const currentUserId = usePage().props.auth?.user?.id;

    const [messages, setMessages] = useState<ChatMessage[]>(thread);
    const [convos, setConvos] = useState<ConversationSummary[]>(conversations);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);

    // Reset thread + list whenever the active conversation changes (navigation),
    // reading the fresh server props for the newly-opened conversation.
    const [seenActive, setSeenActive] = useState(active_id);

    if (active_id !== seenActive) {
        setSeenActive(active_id);
        setMessages(thread);
        setConvos(conversations);
        setDraft('');
    }

    const lastIdRef = useRef<string | null>(null);
    useEffect(() => {
        lastIdRef.current = messages.length
            ? messages[messages.length - 1].id
            : null;
    }, [messages]);

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = scrollRef.current;

        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages]);

    const pollOnce = useCallback(() => {
        if (!active_id) {
            return;
        }

        const after = lastIdRef.current;
        const url = poll.url(
            { locale },
            { query: { conversation: active_id, ...(after ? { after } : {}) } },
        );

        fetch(url, {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((res) => (res.ok ? (res.json() as Promise<PollResponse>) : null))
            .then((data) => {
                if (!data) {
                    return;
                }

                if (data.messages?.length) {
                    setMessages((prev) => mergeMessages(prev, data.messages ?? []));
                }

                if (data.conversations) {
                    setConvos(data.conversations);
                }
            })
            .catch(() => {});
    }, [active_id, locale]);

    useEffect(() => {
        const id = window.setInterval(pollOnce, 3000);

        return () => window.clearInterval(id);
    }, [pollOnce]);

    const send = (): void => {
        const body = draft.trim();

        if (!body || sending || !active_id) {
            return;
        }

        setSending(true);
        router.post(
            store.url({ locale }),
            { conversation_id: active_id, body },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setDraft('');
                    pollOnce();
                },
                onFinish: () => setSending(false),
            },
        );
    };

    const onComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            send();
        }
    };

    const onSubmit = (event: FormEvent): void => {
        event.preventDefault();
        send();
    };

    const startDirect = (userId: string): void => {
        router.post(start.url({ locale }), { user_id: userId }, { preserveScroll: true });
    };

    const ordered = [...convos].sort((a, b) => {
        if (a.type === 'clinic') {
            return -1;
        }

        if (b.type === 'clinic') {
            return 1;
        }

        return (b.last_message_at ?? '').localeCompare(a.last_message_at ?? '');
    });

    const roleLabel = (role: string): string => {
        if (role === 'super_admin') {
            return t.role_super_admin;
        }

        return role === 'secretary' ? t.role_secretary : t.role_doctor;
    };

    return (
        <>
            <Head title={t.title} />

            <div className="flex h-[calc(100svh-60px)] flex-col px-6 py-5">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        {t.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t.description}
                    </p>
                </div>

                <div className="mt-4 flex min-h-0 flex-1 gap-4">
                    {/* Conversation list */}
                    <aside className="flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                            <span className="text-sm font-semibold">
                                {t.title}
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 gap-1 px-2 text-xs"
                                    >
                                        <Plus className="size-3.5" />
                                        {t.new_message}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    {colleagues.length === 0 ? (
                                        <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                                            {t.no_colleagues}
                                        </div>
                                    ) : (
                                        colleagues.map((c) => (
                                            <DropdownMenuItem
                                                key={c.id}
                                                onSelect={() => startDirect(c.id)}
                                                className="gap-2"
                                            >
                                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-100 text-[11px] font-semibold text-navy-700 dark:bg-navy-800 dark:text-slate-200">
                                                    {initials(c.name)}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm">
                                                        {c.name}
                                                    </span>
                                                    <span className="block truncate text-[11px] text-muted-foreground">
                                                        {c.clinic
                                                            ? `${roleLabel(c.role)} · ${c.clinic}`
                                                            : roleLabel(c.role)}
                                                    </span>
                                                </span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {ordered.map((c) => {
                                const isActive = c.id === active_id;
                                const label =
                                    c.type === 'clinic'
                                        ? t.clinic_team
                                        : (c.title ?? '—');

                                return (
                                    <Link
                                        key={c.id}
                                        href={index.url(
                                            { locale },
                                            { query: { conversation: c.id } },
                                        )}
                                        preserveScroll
                                        className={cn(
                                            'flex items-center gap-2.5 border-b border-border/60 px-3 py-2.5 text-start transition hover:bg-muted/60',
                                            isActive && 'bg-muted',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                                c.type === 'clinic'
                                                    ? 'bg-olive-100 text-olive-700 dark:bg-olive-900 dark:text-olive-200'
                                                    : 'bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-slate-200',
                                            )}
                                        >
                                            {c.type === 'clinic' ? (
                                                <Hash className="size-4" />
                                            ) : (
                                                initials(label)
                                            )}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium">
                                                {label}
                                            </span>
                                            <span className="block truncate text-[12px] text-muted-foreground">
                                                {c.last_message ?? t.no_preview}
                                            </span>
                                        </span>
                                        {c.unread > 0 && !isActive && (
                                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                                                {c.unread > 99 ? '99+' : c.unread}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Active thread */}
                    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                        <div
                            ref={scrollRef}
                            className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4"
                        >
                            {messages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <Users className="size-8 opacity-40" />
                                    <p className="text-sm">{t.no_messages}</p>
                                </div>
                            ) : (
                                messages.map((m) => {
                                    const mine = m.sender_id === currentUserId;

                                    return (
                                        <div
                                            key={m.id}
                                            className={cn(
                                                'flex flex-col',
                                                mine ? 'items-end' : 'items-start',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[78%] rounded-2xl px-3.5 py-2 text-sm',
                                                    mine
                                                        ? 'bg-olive-600 text-white'
                                                        : 'bg-muted text-foreground',
                                                )}
                                            >
                                                {!mine && (
                                                    <p className="mb-0.5 text-[11px] font-semibold opacity-80">
                                                        {m.sender_name}
                                                    </p>
                                                )}
                                                <p className="whitespace-pre-wrap break-words">
                                                    {m.body}
                                                </p>
                                            </div>
                                            <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
                                                {formatTime(m.at, lang)}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <form
                            onSubmit={onSubmit}
                            className="flex items-end gap-2 border-t border-border px-3 py-3"
                        >
                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={onComposerKeyDown}
                                placeholder={t.placeholder}
                                rows={1}
                                maxLength={5000}
                                className="max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={sending || draft.trim().length === 0}
                                aria-label={t.send}
                                className="size-10 shrink-0"
                            >
                                <Send className="size-4" />
                            </Button>
                        </form>
                    </section>
                </div>
            </div>
        </>
    );
}
