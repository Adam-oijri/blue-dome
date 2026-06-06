import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar as CalendarIcon,
    CircleDollarSign,
    MessageCircle,
    Plus,
    RefreshCcw,
    Stethoscope,
    UserPlus,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { NotificationsPanel } from '@/components/blue-dome/notifications-panel';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { fmtMAD } from '@/lib/format';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import {
    toggle as toggleChecklistRoute,
} from '@/routes/secretary/checklist';
import {
    destroy as destroyChecklistItemRoute,
    store as storeChecklistItemRoute,
} from '@/routes/secretary/checklist/items';
import { advance as advanceWaitingRoom } from '@/routes/secretary/waiting-room';
import type { NotificationItem } from '@/types/notifications';

type ScheduleStatus =
    | 'confirmed'
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

type WaitingRoomStatus = 'arrived' | 'in_room';

type Person = { first_name: string | null; last_name: string | null };

type ScheduleBlock = {
    start_minute: number;
    duration: number;
    status: ScheduleStatus;
    patient_name: string;
};

type ScheduleRow = {
    doctor: { id: string | null; first_name: string | null; last_name: string | null };
    blocks: ScheduleBlock[];
};

type WaitingRoomRow = {
    id: string;
    patient: {
        first_name: string | null;
        last_name: string | null;
        gender: string | null;
        blood_type: string | null;
        has_chronic: boolean;
    };
    doctor: Person;
    arrived_at: string | null;
    wait_minutes: number;
    status: WaitingRoomStatus;
    walkin: boolean;
};

type WhatsAppRow = {
    id: string;
    recipient_name: string | null;
    status: string;
    appt_time: string | null;
};

interface Props {
    kpis: {
        today: number;
        pending: number;
        walkins: number;
        cash: number;
        noshows: number;
    };
    schedule: ScheduleRow[];
    waiting_room: WaitingRoomRow[];
    whatsapp: WhatsAppRow[];
    now_minute: number;
    now_label: string;
    checklist_done: string[];
    checklist_custom: { id: string; label: string }[];
    recent_notifications: NotificationItem[];
}

const SCHEDULE_TOTAL_MIN = 600;

const SCHEDULE_BLOCK_STYLE: Record<ScheduleStatus, string> = {
    confirmed: 'bg-olive-100 text-olive-700 border-olive-600/40',
    pending: 'bg-warning-soft text-warning border-warning/40',
    in_progress: 'bg-info-soft text-info border-info/40',
    completed: 'bg-muted text-muted-foreground border-border',
    cancelled: 'bg-card text-muted-foreground border-border border-dashed',
};

const WR_STATUS: Record<WaitingRoomStatus, { tone: StatusTone; key: string }> = {
    arrived: { tone: 'info', key: 'wr_status_arrived' },
    in_room: { tone: 'navy', key: 'wr_status_in_room' },
};

const WA_STATUS_TONE: Record<string, StatusTone> = {
    seen: 'info',
    read: 'info',
    delivered: 'neutral',
    sent: 'neutral',
    failed: 'danger',
    confirmed: 'success',
};

const CHECKLIST_MORNING = [
    'cl_open_drawer',
    'cl_sync_calendar',
    'cl_review_noshows',
    'cl_print_list',
];

const CHECKLIST_EVENING = [
    'cl_reconcile',
    'cl_send_recap',
    'cl_archive_files',
    'cl_lock_drawer',
];

const fullName = (p?: Person | null): string =>
    p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';

const initials = (p?: Person | null): string =>
    p
        ? `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() ||
          '?'
        : '?';

const minuteLabel = (m: number): string => {
    const h = Math.floor(m / 60) + 8;
    const mm = ((m % 60) + 60) % 60;

    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

// Deterministic cosmetic hue for a doctor avatar, derived from the id.
const doctorHue = (id: string | null): 'navy' | 'olive' => {
    if (!id) {
        return 'navy';
    }

    let sum = 0;

    for (let i = 0; i < id.length; i += 1) {
        sum += id.charCodeAt(i);
    }

    return sum % 2 === 0 ? 'navy' : 'olive';
};

export default function SecretaryDashboard({
    kpis,
    schedule,
    waiting_room,
    whatsapp,
    now_minute,
    now_label,
    checklist_done,
    checklist_custom,
    recent_notifications,
}: Props) {
    const { t } = useSecretaryLang();
    const { slug: locale } = useLocale();
    const nowPct = Math.min(
        100,
        Math.max(0, (now_minute / SCHEDULE_TOTAL_MIN) * 100),
    );

    const refreshWaitingRoom = (): void => {
        router.reload({ only: ['waiting_room', 'kpis'] });
    };

    const advancePatient = (row: WaitingRoomRow): void => {
        router.post(
            advanceWaitingRoom.url({ locale, appointment: row.id }),
            {},
            { preserveScroll: true },
        );
    };

    // Local, optimistic checklist state so ticking an item is instant — the
    // server save happens in the background and only rolls back on failure.
    const [doneSet, setDoneSet] = useState<Set<string>>(
        () => new Set(checklist_done),
    );
    const [customItems, setCustomItems] = useState(checklist_custom);
    const [newItem, setNewItem] = useState('');

    const toggleChecklistItem = (itemKey: string): void => {
        const wasDone = doneSet.has(itemKey);

        setDoneSet((prev) => {
            const next = new Set(prev);

            if (wasDone) {
                next.delete(itemKey);
            } else {
                next.add(itemKey);
            }

            return next;
        });

        router.post(
            toggleChecklistRoute.url({ locale }),
            { item_key: itemKey },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () =>
                    setDoneSet((prev) => {
                        // Roll back to the pre-click state on failure.
                        const next = new Set(prev);

                        if (wasDone) {
                            next.add(itemKey);
                        } else {
                            next.delete(itemKey);
                        }

                        return next;
                    }),
            },
        );
    };

    const addCustomItem = (event: FormEvent): void => {
        event.preventDefault();
        const label = newItem.trim();

        if (label === '') {
            return;
        }

        router.post(
            storeChecklistItemRoute.url({ locale }),
            { label },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['checklist_custom', 'checklist_done'],
                onSuccess: (page) => {
                    const props = page.props as unknown as Pick<
                        Props,
                        'checklist_custom'
                    >;
                    setCustomItems(props.checklist_custom);
                    setNewItem('');
                },
            },
        );
    };

    const removeCustomItem = (id: string): void => {
        setCustomItems((prev) => prev.filter((item) => item.id !== id));
        setDoneSet((prev) => {
            const next = new Set(prev);
            next.delete(id);

            return next;
        });

        router.delete(destroyChecklistItemRoute.url({ locale, item: id }), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head title={t.nav_dashboard} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.page_title}
                    description={t.page_subtitle}
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                    <KpiCard
                        label={t.kpi_today}
                        value={kpis.today}
                        icon={CalendarIcon}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.kpi_pending}
                        value={kpis.pending}
                        icon={MessageCircle}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.kpi_walkins}
                        value={kpis.walkins}
                        icon={UserPlus}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.kpi_cash}
                        value={`${fmtMAD(Number(kpis.cash))} ${t.mad}`}
                        icon={CircleDollarSign}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.kpi_noshows}
                        value={kpis.noshows}
                        icon={AlertTriangle}
                        tone="warn"
                    />
                </div>

                <SectionCard
                    title={t.sched_title}
                    titleIcon={<CalendarIcon className="size-4" />}
                    actions={
                        <span className="text-[12px] text-muted-foreground">
                            {t.sched_subtitle}
                        </span>
                    }
                    bodyClassName="p-4"
                    className="mb-5"
                >
                    <div className="overflow-x-auto">
                        <div className="min-w-[760px]">
                            <div className="relative mb-2 grid grid-cols-[180px_1fr] items-end gap-3 border-b border-border pb-1.5">
                                <div className="text-[11px] tracking-wider text-muted-foreground uppercase">
                                    {t.doctors_label}
                                </div>
                                <div className="relative h-5">
                                    {Array.from({ length: 11 }).map((_, i) => (
                                        <span
                                            key={i}
                                            className="absolute -translate-x-1/2 text-[10px] text-muted-foreground tabular-nums"
                                            style={{
                                                insetInlineStart: `${(i / 10) * 100}%`,
                                            }}
                                        >
                                            {String(8 + i).padStart(2, '0')}:00
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {schedule.length === 0 ? (
                                <div className="py-10 text-center text-sm text-muted-foreground">
                                    {t.empty_none}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {schedule.map((row, docIdx) => {
                                        const hue = doctorHue(row.doctor.id);

                                        return (
                                            <div
                                                key={row.doctor.id ?? docIdx}
                                                className="grid grid-cols-[180px_1fr] items-center gap-3"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={cn(
                                                            'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                            hue === 'navy'
                                                                ? 'bg-navy-700'
                                                                : 'bg-olive-600',
                                                        )}
                                                    >
                                                        {initials(row.doctor)}
                                                    </div>
                                                    <div className="min-w-0 leading-tight">
                                                        <div className="truncate text-[12px] font-semibold">
                                                            {fullName(
                                                                row.doctor,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="relative h-12 overflow-hidden rounded-md bg-muted/30">
                                                    {row.blocks.map((b, i) => {
                                                        const left =
                                                            (b.start_minute /
                                                                SCHEDULE_TOTAL_MIN) *
                                                            100;
                                                        const width =
                                                            (b.duration /
                                                                SCHEDULE_TOTAL_MIN) *
                                                            100;

                                                        return (
                                                            <div
                                                                key={i}
                                                                className={cn(
                                                                    'absolute top-1 bottom-1 overflow-hidden rounded border-s-[2px] px-1.5 py-0.5 text-[10px] leading-tight',
                                                                    SCHEDULE_BLOCK_STYLE[
                                                                        b.status
                                                                    ],
                                                                )}
                                                                style={{
                                                                    insetInlineStart: `${left}%`,
                                                                    width: `calc(${width}% - 2px)`,
                                                                }}
                                                            >
                                                                <div className="truncate font-semibold">
                                                                    {
                                                                        b.patient_name
                                                                    }
                                                                </div>
                                                                <div className="truncate tabular-nums opacity-80">
                                                                    {minuteLabel(
                                                                        b.start_minute,
                                                                    )}
                                                                    –
                                                                    {minuteLabel(
                                                                        b.start_minute +
                                                                            b.duration,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <div
                                                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-danger"
                                                        style={{
                                                            insetInlineStart: `${nowPct}%`,
                                                        }}
                                                    >
                                                        {docIdx === 0 && (
                                                            <span className="absolute top-0 -translate-y-full rounded-t bg-danger px-1 text-[9px] font-semibold whitespace-nowrap text-white">
                                                                {t.sched_now}{' '}
                                                                {now_label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
                                {[
                                    {
                                        label: t.sched_legend_confirmed,
                                        dot: 'bg-olive-500',
                                    },
                                    {
                                        label: t.sched_legend_pending,
                                        dot: 'bg-warning',
                                    },
                                    {
                                        label: t.sched_legend_in_progress,
                                        dot: 'bg-info',
                                    },
                                    {
                                        label: t.sched_legend_completed,
                                        dot: 'bg-muted-foreground',
                                    },
                                    {
                                        label: t.sched_legend_cancelled,
                                        dot: 'border-border border bg-card',
                                    },
                                ].map((lg) => (
                                    <span
                                        key={lg.label}
                                        className="flex items-center gap-1.5"
                                    >
                                        <span
                                            className={cn(
                                                'inline-block size-2.5 rounded-sm',
                                                lg.dot,
                                            )}
                                        />
                                        <span className="text-muted-foreground">
                                            {lg.label}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <SectionCard
                        title={t.wr_title}
                        titleIcon={<UserPlus className="size-4" />}
                        actions={
                            <>
                                <span className="inline-flex items-center gap-1 rounded-full bg-danger px-2 py-px text-[10px] font-semibold text-white">
                                    <span className="size-1.5 animate-pulse rounded-full bg-white" />
                                    {t.db_live}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    aria-label={t.db_refresh}
                                    onClick={refreshWaitingRoom}
                                >
                                    <RefreshCcw className="size-3.5" />
                                </Button>
                            </>
                        }
                        bodyClassName="p-0"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        {t.wr_col_patient}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.wr_col_doctor}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.wr_col_arrived}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.wr_col_wait}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.wr_col_status}
                                    </TableHead>
                                    <TableHead className="w-44" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {waiting_room.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-10 text-center text-sm text-muted-foreground"
                                        >
                                            {t.empty_none}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {waiting_room.map((r) => {
                                    const s = WR_STATUS[r.status];
                                    const longWait =
                                        r.wait_minutes >= 25 &&
                                        r.wait_minutes < 40;
                                    const critWait = r.wait_minutes >= 40;

                                    return (
                                        <TableRow
                                            key={r.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                            r.patient.gender ===
                                                                'male'
                                                                ? 'bg-navy-700'
                                                                : 'bg-olive-600',
                                                        )}
                                                    >
                                                        {initials(r.patient)}
                                                    </div>
                                                    <div>
                                                        <div className="text-[13px] font-semibold">
                                                            {fullName(r.patient)}
                                                        </div>
                                                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                                                            {r.patient
                                                                .blood_type && (
                                                                <StatusPill tone="danger">
                                                                    {
                                                                        r.patient
                                                                            .blood_type
                                                                    }
                                                                </StatusPill>
                                                            )}
                                                            {r.patient
                                                                .has_chronic && (
                                                                <StatusPill tone="warning">
                                                                    {t.pt_tag_chronic}
                                                                </StatusPill>
                                                            )}
                                                            {r.walkin && (
                                                                <StatusPill tone="olive">
                                                                    {
                                                                        t.wr_walkin_tag
                                                                    }
                                                                </StatusPill>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={cn(
                                                            'grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white',
                                                            doctorHue(
                                                                `${r.doctor.first_name ?? ''}${r.doctor.last_name ?? ''}`,
                                                            ) === 'navy'
                                                                ? 'bg-navy-700'
                                                                : 'bg-olive-600',
                                                        )}
                                                    >
                                                        {initials(r.doctor)}
                                                    </div>
                                                    <span className="text-[12px]">
                                                        {fullName(r.doctor)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[12px] tabular-nums">
                                                {r.arrived_at?.slice(11, 16) ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={cn(
                                                        'text-[13px] font-semibold tabular-nums',
                                                        critWait &&
                                                            'text-danger',
                                                        longWait &&
                                                            'text-warning',
                                                    )}
                                                >
                                                    {r.wait_minutes}
                                                    <span className="ms-0.5 text-[11px] font-normal text-muted-foreground">
                                                        {t.wr_min}
                                                    </span>
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill
                                                    tone={s.tone}
                                                    withDot
                                                >
                                                    {t[s.key] ?? r.status}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {r.status === 'arrived' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-7 gap-1 bg-navy-900 text-[11px] text-white hover:bg-navy-800"
                                                            onClick={() =>
                                                                advancePatient(r)
                                                            }
                                                        >
                                                            {t.wr_action_call}
                                                        </Button>
                                                    )}
                                                    {r.status === 'in_room' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 gap-1 text-[11px]"
                                                            onClick={() =>
                                                                advancePatient(r)
                                                            }
                                                        >
                                                            <Stethoscope className="size-3" />
                                                            {t.wr_action_done}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </SectionCard>

                    <div className="flex flex-col gap-4">
                        <NotificationsPanel items={recent_notifications} />
                        <SectionCard
                            title={t.wa_title}
                            titleIcon={<MessageCircle className="size-4" />}
                            actions={
                                <span className="text-[12px] text-muted-foreground">
                                    {t.wa_subtitle}
                                </span>
                            }
                            bodyClassName="p-0"
                        >
                            <ul className="max-h-[360px] divide-y divide-border overflow-y-auto">
                                {whatsapp.length === 0 && (
                                    <li className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                                        {t.empty_none}
                                    </li>
                                )}
                                {whatsapp.map((row) => (
                                    <li
                                        key={row.id}
                                        className="space-y-1.5 px-4 py-2.5"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-700 text-[11px] font-semibold text-white">
                                                {(row.recipient_name?.[0] ?? '?').toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[12px] font-semibold">
                                                    {row.recipient_name ?? '—'}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {row.appt_time ?? ''}
                                                </div>
                                            </div>
                                            <StatusPill
                                                tone={
                                                    WA_STATUS_TONE[row.status] ??
                                                    'neutral'
                                                }
                                                withDot
                                            >
                                                {t[`wa_status_${row.status}`] ??
                                                    row.status}
                                            </StatusPill>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </SectionCard>

                        <SectionCard
                            title={t.cl_title}
                            bodyClassName="space-y-2 p-3"
                        >
                            <div className="px-1 text-[11px] tracking-wider text-muted-foreground uppercase">
                                {t.cl_morning}
                            </div>
                            {CHECKLIST_MORNING.map((key) => (
                                <ChecklistItem
                                    key={key}
                                    done={doneSet.has(key)}
                                    label={t[key] ?? key}
                                    onToggle={() => toggleChecklistItem(key)}
                                />
                            ))}
                            <div className="mt-2 px-1 text-[11px] tracking-wider text-muted-foreground uppercase">
                                {t.cl_evening}
                            </div>
                            {CHECKLIST_EVENING.map((key) => (
                                <ChecklistItem
                                    key={key}
                                    done={doneSet.has(key)}
                                    label={t[key] ?? key}
                                    onToggle={() => toggleChecklistItem(key)}
                                />
                            ))}

                            {customItems.length > 0 && (
                                <div className="mt-2 px-1 text-[11px] tracking-wider text-muted-foreground uppercase">
                                    {t.cl_custom}
                                </div>
                            )}
                            {customItems.map((item) => (
                                <ChecklistItem
                                    key={item.id}
                                    done={doneSet.has(item.id)}
                                    label={item.label}
                                    onToggle={() => toggleChecklistItem(item.id)}
                                    onRemove={() => removeCustomItem(item.id)}
                                    removeLabel={t.cl_remove}
                                />
                            ))}

                            <form
                                onSubmit={addCustomItem}
                                className="mt-2 flex items-center gap-2"
                            >
                                <Input
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder={t.cl_add_placeholder}
                                    maxLength={120}
                                    className="h-8 text-[12px]"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    variant="outline"
                                    className="size-8 shrink-0"
                                    aria-label={t.cl_add}
                                    disabled={newItem.trim() === ''}
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </form>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </>
    );
}

function ChecklistItem({
    done,
    label,
    onToggle,
    onRemove,
    removeLabel,
}: {
    done: boolean;
    label: string;
    onToggle: () => void;
    onRemove?: () => void;
    removeLabel?: string;
}) {
    return (
        <div className="group flex items-center gap-1">
            <button
                type="button"
                onClick={onToggle}
                className={cn(
                    'flex flex-1 items-center gap-2.5 rounded-md px-2 py-1.5 text-start text-[12px] transition-colors',
                    done
                        ? 'text-muted-foreground line-through'
                        : 'hover:bg-muted',
                )}
            >
                <span
                    className={cn(
                        'grid size-4 shrink-0 place-items-center rounded border',
                        done
                            ? 'border-olive-600 bg-olive-600 text-white'
                            : 'border-border',
                    )}
                >
                    {done && (
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-2.5"
                        >
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    )}
                </span>
                <span className="flex-1">{label}</span>
            </button>
            {onRemove && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    aria-label={removeLabel}
                    className="size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger focus-visible:opacity-100"
                >
                    <X className="size-3.5" />
                </Button>
            )}
        </div>
    );
}
