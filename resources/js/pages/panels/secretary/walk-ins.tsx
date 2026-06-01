import { Head } from '@inertiajs/react';
import { AlertTriangle, Clock, UserPlus } from 'lucide-react';

import { CreateAppointmentSheet } from '@/components/blue-dome/create-appointment-sheet';
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

type Person = {
    first_name: string | null;
    last_name: string | null;
};

type WalkInRow = {
    id: string;
    patient: (Person & { gender: string | null }) | null;
    doctor: Person | null;
    scheduled_start: string | null;
    status: string;
    priority: string;
    reason: string | null;
    wait_minutes: number;
};

interface Props {
    walk_ins: WalkInRow[];
    kpis: {
        waiting: number;
        avg_wait: number;
    };
}

const STATUS_TONE: Record<string, StatusTone> = {
    scheduled: 'navy',
    confirmed: 'info',
    arrived: 'olive',
    in_progress: 'success',
};

const URGENT_PRIORITIES = ['high', 'emergency'];

const STATUS_LABEL_KEY: Record<string, string> = {
    scheduled: 'wi_status_scheduled',
    confirmed: 'wa_status_confirmed',
    arrived: 'wr_status_arrived',
    in_progress: 'sched_legend_in_progress',
};

const PRIORITY_LABEL_KEY: Record<string, string> = {
    low: 'wi_priority_low',
    normal: 'wi_priority_normal',
    high: 'wi_priority_high',
    emergency: 'wi_priority_emergency',
};

const fullName = (p?: Person | null): string =>
    p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';

const initials = (p?: Person | null): string =>
    p
        ? `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() ||
          '?'
        : '?';

const timeOf = (iso: string | null): string => (iso ? iso.slice(11, 16) : '—');

export default function SecretaryWalkIns({ walk_ins, kpis }: Props) {
    const { t } = useSecretaryLang();

    return (
        <>
            <Head title={t.nav_walkins} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_walkins}
                    description={t.wr_subtitle}
                    actions={
                        <CreateAppointmentSheet>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <UserPlus className="size-3.5" />
                                {t.new_appointment}
                            </Button>
                        </CreateAppointmentSheet>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={t.kpi_walkins}
                        value={kpis.waiting}
                        icon={UserPlus}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.wr_col_wait}
                        value={`${kpis.avg_wait} ${t.wr_min}`}
                        icon={Clock}
                        tone="warn"
                    />
                </div>

                <SectionCard
                    title={t.wr_title}
                    titleIcon={<UserPlus className="size-4" />}
                    actions={
                        <span className="text-[12px] text-muted-foreground">
                            {t.wr_subtitle}
                        </span>
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
                                    {t.wr_col_arrived}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.wr_col_wait}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.wr_col_status}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.wr_col_doctor}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {walk_ins.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        {t.empty_none}
                                    </TableCell>
                                </TableRow>
                            )}
                            {walk_ins.map((r) => {
                                const urgent = URGENT_PRIORITIES.includes(
                                    r.priority,
                                );

                                return (
                                    <TableRow
                                        key={r.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={cn(
                                                        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                        r.patient?.gender ===
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
                                                    {urgent && (
                                                        <div className="mt-0.5">
                                                            <StatusPill tone="danger">
                                                                <AlertTriangle className="size-2.5" />
                                                                {t[
                                                                    PRIORITY_LABEL_KEY[
                                                                        r.priority
                                                                    ]
                                                                ] ?? r.priority}
                                                            </StatusPill>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px] font-semibold tabular-nums">
                                            {timeOf(r.scheduled_start)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[13px] font-semibold tabular-nums">
                                                {r.wait_minutes}
                                                <span className="ms-0.5 text-[11px] font-normal text-muted-foreground">
                                                    {t.wr_min}
                                                </span>
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={
                                                    STATUS_TONE[r.status] ??
                                                    'neutral'
                                                }
                                                withDot
                                            >
                                                {t[
                                                    STATUS_LABEL_KEY[r.status]
                                                ] ?? r.status}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {r.doctor
                                                ? fullName(r.doctor)
                                                : t.unassigned}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </SectionCard>
            </div>
        </>
    );
}
