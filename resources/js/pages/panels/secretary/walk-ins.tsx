import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar as CalendarIcon,
    ChevronRight,
    Clock,
    MoreHorizontal,
    UserPlus,
    Users,
} from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
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
import { findDoctor, findPatient, localName } from '@/lib/mock/secretary';
import { cn } from '@/lib/utils';

const ROWS: {
    p: string;
    arrived: string;
    waitMin: number;
    reason: { en: string; fr: string; ar: string };
    assigned: string | null;
    urgent: boolean;
}[] = [
    {
        p: 'p7',
        arrived: '11:04',
        waitMin: 10,
        reason: {
            en: 'Chest pain',
            fr: 'Douleur thoracique',
            ar: 'ألم في الصدر',
        },
        assigned: 'd1',
        urgent: true,
    },
    {
        p: 'p3',
        arrived: '11:08',
        waitMin: 6,
        reason: { en: 'Sore throat', fr: 'Mal de gorge', ar: 'التهاب الحلق' },
        assigned: 'd2',
        urgent: false,
    },
    {
        p: 'p10',
        arrived: '11:12',
        waitMin: 2,
        reason: {
            en: 'Refill request',
            fr: 'Renouvellement ordonnance',
            ar: 'تجديد وصفة',
        },
        assigned: null,
        urgent: false,
    },
];

export default function SecretaryWalkIns() {
    const { t, lang } = useSecretaryLang();

    return (
        <>
            <Head title={t.nav_walkins} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_walkins}
                    description="3 patients waiting · Average wait 12 min · 6 of 11 converted to follow-up today"
                    actions={
                        <Button
                            size="sm"
                            className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                        >
                            <UserPlus className="size-3.5" />
                            Register walk-in
                        </Button>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label="Waiting now"
                        value="3"
                        icon={UserPlus}
                        tone="navy"
                    />
                    <KpiCard
                        label="Average wait"
                        value="12 min"
                        icon={Clock}
                        tone="warn"
                    />
                    <KpiCard
                        label="Today total"
                        value="11"
                        icon={Users}
                        tone="navy"
                        trend={{ value: '+22%', direction: 'up' }}
                    />
                    <KpiCard
                        label="Converted"
                        value="6"
                        icon={CalendarIcon}
                        tone="olive"
                    />
                </div>

                <SectionCard
                    title="Walk-in queue"
                    titleIcon={<UserPlus className="size-4" />}
                    actions={
                        <span className="text-[12px] text-muted-foreground">
                            Sorted by arrival
                        </span>
                    }
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    Patient
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Arrived
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Wait
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Reason
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Assigned to
                                </TableHead>
                                <TableHead className="w-44" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ROWS.map((r, i) => {
                                const p = findPatient(r.p);
                                const d = r.assigned
                                    ? findDoctor(r.assigned)
                                    : null;

                                if (!p) {
                                    return null;
                                }

                                return (
                                    <TableRow
                                        key={i}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
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
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                                        <StatusPill tone="danger">
                                                            {p.blood}
                                                        </StatusPill>
                                                        {r.urgent && (
                                                            <StatusPill tone="danger">
                                                                <AlertTriangle className="size-2.5" />
                                                                Urgent
                                                            </StatusPill>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px] font-semibold tabular-nums">
                                            {r.arrived}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[13px] font-semibold tabular-nums">
                                                {r.waitMin}
                                                <span className="ms-0.5 text-[11px] font-normal text-muted-foreground">
                                                    {t.wr_min}
                                                </span>
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {r.reason[lang]}
                                        </TableCell>
                                        <TableCell>
                                            {d ? (
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
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="h-7 gap-1 bg-olive-600 text-[11px] text-white hover:bg-olive-700"
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    size="sm"
                                                    className="h-7 gap-1 bg-navy-900 text-[11px] text-white hover:bg-navy-800"
                                                >
                                                    <ChevronRight className="size-3" />
                                                    Call in
                                                </Button>
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
            </div>
        </>
    );
}
