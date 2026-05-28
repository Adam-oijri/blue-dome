import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar as CalendarIcon,
    CircleDollarSign,
    Filter,
    MessageCircle,
    MoreHorizontal,
    Phone,
    RefreshCcw,
    Stethoscope,
    UserPlus,
    Wallet,
} from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import {
    SECRETARY_MOCK,
    findDoctor,
    findPatient,
    fmtScheduleMinute,
    localName,
    localSpecialty,
} from '@/lib/mock/secretary';
import type { ScheduleStatus, WaitingRoomStatus } from '@/lib/mock/secretary';
import { cn } from '@/lib/utils';

const SCHEDULE_TOTAL_MIN = 600;

const SCHEDULE_BLOCK_STYLE: Record<ScheduleStatus, string> = {
    confirmed: 'bg-olive-100 text-olive-700 border-olive-600/40',
    pending: 'bg-warning-soft text-warning border-warning/40',
    in_progress: 'bg-info-soft text-info border-info/40',
    completed: 'bg-muted text-muted-foreground border-border',
    cancelled: 'bg-card text-muted-foreground border-border border-dashed',
    break: 'bg-muted text-muted-foreground border-border',
};

const WR_STATUS: Record<WaitingRoomStatus, { tone: StatusTone; key: string }> =
    {
        arrived: { tone: 'info', key: 'wr_status_arrived' },
        with_nurse: { tone: 'warning', key: 'wr_status_with_nurse' },
        in_room: { tone: 'navy', key: 'wr_status_in_room' },
        ready_pay: { tone: 'olive', key: 'wr_status_ready_pay' },
    };

const WA_STATUS_TONE: Record<string, StatusTone> = {
    seen: 'info',
    delivered: 'neutral',
    sent: 'neutral',
    failed: 'danger',
    confirmed: 'success',
};

const CHECKLIST_MORNING = [
    { key: 'cl_open_drawer', done: true },
    { key: 'cl_sync_calendar', done: true },
    { key: 'cl_review_noshows', done: true },
    { key: 'cl_print_list', done: false },
];

const CHECKLIST_EVENING = [
    { key: 'cl_reconcile', done: false },
    { key: 'cl_send_recap', done: false },
    { key: 'cl_archive_files', done: false },
    { key: 'cl_lock_drawer', done: false },
];

export default function SecretaryDashboard() {
    const { t, lang } = useSecretaryLang();
    const k = SECRETARY_MOCK.kpis;
    const nowPct = (SECRETARY_MOCK.nowMin / SCHEDULE_TOTAL_MIN) * 100;
    const docsAtBranch = SECRETARY_MOCK.doctors.filter(
        (d) => d.branch === 'b1',
    );

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
                        value={k.today.value}
                        icon={CalendarIcon}
                        tone="navy"
                        trend={{ value: '+3', direction: 'up' }}
                    />
                    <KpiCard
                        label={t.kpi_pending}
                        value={k.pending.value}
                        icon={MessageCircle}
                        tone="warn"
                        trend={{ value: '2 fail', direction: 'down' }}
                    />
                    <KpiCard
                        label={t.kpi_walkins}
                        value={k.walkins.value}
                        icon={UserPlus}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.kpi_cash}
                        value={`${k.cash.value.toLocaleString('en-US')} ${t.mad}`}
                        icon={CircleDollarSign}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.kpi_noshows}
                        value={k.noshows.value}
                        icon={AlertTriangle}
                        tone="warn"
                        trend={{ value: '-0.4%', direction: 'up' }}
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

                            <div className="flex flex-col gap-2">
                                {docsAtBranch.map((d, docIdx) => {
                                    const blocks =
                                        SECRETARY_MOCK.schedule[d.id] ?? [];

                                    return (
                                        <div
                                            key={d.id}
                                            className="grid grid-cols-[180px_1fr] items-center gap-3"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={cn(
                                                        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                        d.hue === 'navy'
                                                            ? 'bg-navy-700'
                                                            : 'bg-olive-600',
                                                    )}
                                                >
                                                    {d.initials}
                                                </div>
                                                <div className="min-w-0 leading-tight">
                                                    <div className="truncate text-[12px] font-semibold">
                                                        {localName(d, lang)}
                                                    </div>
                                                    <div className="truncate text-[11px] text-muted-foreground">
                                                        {localSpecialty(
                                                            d,
                                                            lang,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative h-12 overflow-hidden rounded-md bg-muted/30">
                                                {blocks.map((b, i) => {
                                                    const left =
                                                        (b.start /
                                                            SCHEDULE_TOTAL_MIN) *
                                                        100;
                                                    const width =
                                                        (b.dur /
                                                            SCHEDULE_TOTAL_MIN) *
                                                        100;
                                                    const p = b.patient
                                                        ? findPatient(b.patient)
                                                        : null;

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
                                                                {b.status ===
                                                                'break'
                                                                    ? t.sched_legend_break
                                                                    : p
                                                                      ? localName(
                                                                            p,
                                                                            lang,
                                                                        )
                                                                      : ''}
                                                            </div>
                                                            <div className="truncate tabular-nums opacity-80">
                                                                {fmtScheduleMinute(
                                                                    b.start,
                                                                )}
                                                                –
                                                                {fmtScheduleMinute(
                                                                    b.start +
                                                                        b.dur,
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
                                                            {
                                                                SECRETARY_MOCK.nowLabel
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

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
                                    {
                                        label: t.sched_legend_break,
                                        dot: 'bg-muted-foreground',
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
                                    LIVE
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                >
                                    <RefreshCcw className="size-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                >
                                    <Filter className="size-3.5" />
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
                                {SECRETARY_MOCK.waitingRoom.map((r, i) => {
                                    const p = findPatient(r.patient);
                                    const d = findDoctor(r.doctor);

                                    if (!p || !d) {
                                        return null;
                                    }

                                    const s = WR_STATUS[r.status];
                                    const longWait =
                                        r.waitMin >= 25 && r.waitMin < 40;
                                    const critWait = r.waitMin >= 40;

                                    return (
                                        <TableRow
                                            key={i}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                            p.gender === 'm'
                                                                ? 'bg-navy-700'
                                                                : 'bg-olive-600',
                                                        )}
                                                    >
                                                        {p.initials}
                                                    </div>
                                                    <div>
                                                        <div className="text-[13px] font-semibold">
                                                            {localName(p, lang)}
                                                        </div>
                                                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                                                            <StatusPill tone="danger">
                                                                {p.blood}
                                                            </StatusPill>
                                                            {p.chronic && (
                                                                <StatusPill tone="warning">
                                                                    Chronic
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
                                                            d.hue === 'navy'
                                                                ? 'bg-navy-700'
                                                                : 'bg-olive-600',
                                                        )}
                                                    >
                                                        {d.initials}
                                                    </div>
                                                    <span className="text-[12px]">
                                                        {localName(
                                                            d,
                                                            lang,
                                                        ).replace(
                                                            /^(Dr\.|د\.)\s*/,
                                                            '',
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[12px] tabular-nums">
                                                {r.arrivedAt}
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
                                                    {r.waitMin}
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
                                                        >
                                                            {t.wr_action_call}
                                                        </Button>
                                                    )}
                                                    {r.status ===
                                                        'with_nurse' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 gap-1 text-[11px]"
                                                        >
                                                            <Stethoscope className="size-3" />
                                                            {t.wr_action_call}
                                                        </Button>
                                                    )}
                                                    {r.status ===
                                                        'ready_pay' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-7 gap-1 bg-olive-600 text-[11px] text-white hover:bg-olive-700"
                                                        >
                                                            <Wallet className="size-3" />
                                                            {t.wr_action_pay}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7"
                                                    >
                                                        <MoreHorizontal className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </SectionCard>

                    <div className="flex flex-col gap-4">
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
                                {SECRETARY_MOCK.whatsapp
                                    .slice(0, 5)
                                    .map((row, i) => {
                                        const p = findPatient(row.patient);
                                        const d = findDoctor(row.doctor);

                                        if (!p || !d) {
                                            return null;
                                        }

                                        return (
                                            <li
                                                key={i}
                                                className="space-y-1.5 px-4 py-2.5"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={cn(
                                                            'grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white',
                                                            p.gender === 'm'
                                                                ? 'bg-navy-700'
                                                                : 'bg-olive-600',
                                                        )}
                                                    >
                                                        {p.initials}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-[12px] font-semibold">
                                                            {localName(p, lang)}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {localName(
                                                                d,
                                                                lang,
                                                            ).replace(
                                                                /^(Dr\.|د\.)\s*/,
                                                                '',
                                                            )}{' '}
                                                            · {row.apptTime}
                                                        </div>
                                                    </div>
                                                    <StatusPill
                                                        tone={
                                                            WA_STATUS_TONE[
                                                                row.status
                                                            ]
                                                        }
                                                        withDot
                                                    >
                                                        {t[
                                                            `wa_status_${row.status}`
                                                        ] ?? row.status}
                                                    </StatusPill>
                                                </div>
                                            </li>
                                        );
                                    })}
                            </ul>
                        </SectionCard>

                        <SectionCard
                            title={t.cl_title}
                            bodyClassName="space-y-2 p-3"
                        >
                            <div className="px-1 text-[11px] tracking-wider text-muted-foreground uppercase">
                                {t.cl_morning}
                            </div>
                            {CHECKLIST_MORNING.map((it) => (
                                <ChecklistItem
                                    key={it.key}
                                    done={it.done}
                                    label={t[it.key] ?? it.key}
                                />
                            ))}
                            <div className="mt-2 px-1 text-[11px] tracking-wider text-muted-foreground uppercase">
                                {t.cl_evening}
                            </div>
                            {CHECKLIST_EVENING.map((it) => (
                                <ChecklistItem
                                    key={it.key}
                                    done={it.done}
                                    label={t[it.key] ?? it.key}
                                />
                            ))}
                        </SectionCard>

                        <SectionCard
                            title={t.dock_new_appt}
                            bodyClassName="grid grid-cols-2 gap-2 p-3"
                        >
                            <Button
                                variant="outline"
                                className="h-14 flex-col gap-1 text-[11px]"
                            >
                                <UserPlus className="size-4" />
                                {t.dock_new_patient}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-14 flex-col gap-1 text-[11px]"
                            >
                                <CalendarIcon className="size-4" />
                                {t.dock_new_appt}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-14 flex-col gap-1 text-[11px]"
                            >
                                <Phone className="size-4" />
                                {t.dock_walkin}
                            </Button>
                            <Button className="h-14 flex-col gap-1 bg-olive-600 text-[11px] text-white hover:bg-olive-700">
                                <Wallet className="size-4" />
                                {t.dock_payment}
                            </Button>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </>
    );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
    return (
        <button
            type="button"
            className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-start text-[12px] transition-colors',
                done ? 'text-muted-foreground line-through' : 'hover:bg-muted',
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
    );
}
