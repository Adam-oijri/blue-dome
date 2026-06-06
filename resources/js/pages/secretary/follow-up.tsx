import { Head } from '@inertiajs/react';
import { AlertTriangle, Phone, PhoneCall } from 'lucide-react';

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
import { cn } from '@/lib/utils';
import { Pagination } from '@/pages/panels/super-admin/users';

type Person = {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    gender: string | null;
};

type FollowUpRow = {
    id: string;
    patient?: Person | null;
    reason: string | null;
    priority: string | null;
    status: string;
    attempts: number;
    last_attempt_at: string | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

interface Props {
    follow_ups: Paginated<FollowUpRow>;
    kpis: {
        due: number;
        high_priority: number;
        reached_today: number;
    };
}

const STATUS_TONE: Record<string, StatusTone> = {
    pending: 'neutral',
    in_progress: 'info',
    no_answer: 'warning',
    wrong_number: 'danger',
    rescheduled: 'navy',
    completed: 'success',
};

const PRIORITY_TONE: Record<string, StatusTone> = {
    emergency: 'danger',
    high: 'danger',
    normal: 'neutral',
    low: 'neutral',
};

const PRIORITY_LABEL_KEY: Record<string, string> = {
    emergency: 'fc_priority_emergency',
    high: 'fc_priority_high',
    normal: 'fc_priority_normal',
    low: 'fc_priority_low',
};

const fullName = (p?: Person | null): string =>
    p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';

const initials = (p?: Person | null): string =>
    p
        ? `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() ||
          '?'
        : '?';

export default function SecretaryFollowUp({ follow_ups, kpis }: Props) {
    const { t } = useSecretaryLang();

    return (
        <>
            <Head title={t.nav_followups} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader title={t.nav_followups} />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                    <KpiCard
                        label={t.nav_followups}
                        value={kpis.due}
                        icon={Phone}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.fc_kpi_high_priority}
                        value={kpis.high_priority}
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.fc_kpi_reached_today}
                        value={kpis.reached_today}
                        icon={PhoneCall}
                        tone="success"
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.wr_col_patient}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_reason}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_priority}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.wr_col_status}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_attempts}
                                </TableHead>
                                <TableHead className="w-32" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {follow_ups.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        {t.empty_none}
                                    </TableCell>
                                </TableRow>
                            )}
                            {follow_ups.data.map((c) => {
                                const p = c.patient;

                                return (
                                    <TableRow
                                        key={c.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                        p?.gender === 'male'
                                                            ? 'bg-navy-700'
                                                            : 'bg-olive-600',
                                                    )}
                                                >
                                                    {initials(p)}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-semibold">
                                                        {fullName(p)}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {p?.phone ?? '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {c.reason ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={
                                                    PRIORITY_TONE[
                                                        c.priority ?? 'normal'
                                                    ] ?? 'neutral'
                                                }
                                            >
                                                {t[
                                                    PRIORITY_LABEL_KEY[
                                                        c.priority ?? 'normal'
                                                    ]
                                                ] ??
                                                    c.priority ??
                                                    'normal'}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={
                                                    STATUS_TONE[c.status] ??
                                                    'neutral'
                                                }
                                                withDot
                                            >
                                                {t[`fc_status_${c.status}`] ??
                                                    c.status}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell className="text-[13px] tabular-nums">
                                            {c.attempts}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1.5">
                                                {p?.phone && (
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 gap-1.5"
                                                    >
                                                        <a href={`tel:${p.phone}`}>
                                                            <Phone className="size-3.5" />
                                                            {t.wr_action_call}
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <Pagination paginated={follow_ups} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
