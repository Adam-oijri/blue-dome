import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronRight,
    Clock,
    Filter,
    FlaskConical,
    Plus,
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
import { useDoctorLang } from '@/lib/i18n/doctor-context';

type LabStatus = 'pending' | 'sample_collected' | 'in_progress' | 'completed';
type Urgency = 'routine' | 'urgent' | 'stat';

const ORDERS: {
    id: string;
    patient: string;
    tests: number;
    lab: string;
    urgency: Urgency;
    status: LabStatus;
    date: string;
    abnormal?: number;
}[] = [
    {
        id: 'LAB-2026-1842',
        patient: 'Youssef Tazi',
        tests: 4,
        lab: 'Biocenter',
        urgency: 'routine',
        status: 'in_progress',
        date: 'May 5',
    },
    {
        id: 'LAB-2026-1839',
        patient: 'Hassan El Amrani',
        tests: 2,
        lab: 'Biocenter',
        urgency: 'urgent',
        status: 'completed',
        date: 'May 5',
        abnormal: 1,
    },
    {
        id: 'LAB-2026-1835',
        patient: 'Salma Idrissi',
        tests: 6,
        lab: 'Pasteur',
        urgency: 'routine',
        status: 'completed',
        date: 'May 4',
        abnormal: 0,
    },
    {
        id: 'LAB-2026-1828',
        patient: 'Latifa Ouazzani',
        tests: 3,
        lab: 'Biocenter',
        urgency: 'routine',
        status: 'sample_collected',
        date: 'May 4',
    },
    {
        id: 'LAB-2026-1820',
        patient: 'Aicha Berrada',
        tests: 5,
        lab: 'Pasteur',
        urgency: 'stat',
        status: 'completed',
        date: 'May 3',
        abnormal: 2,
    },
    {
        id: 'LAB-2026-1815',
        patient: 'Mehdi Saidi',
        tests: 4,
        lab: 'Biocenter',
        urgency: 'routine',
        status: 'pending',
        date: 'May 3',
    },
];

const STATUS: Record<LabStatus, { tone: StatusTone; label: string }> = {
    pending: { tone: 'neutral', label: 'Pending' },
    sample_collected: { tone: 'warning', label: 'Collected' },
    in_progress: { tone: 'info', label: 'In progress' },
    completed: { tone: 'success', label: 'Completed' },
};

const CRITICAL = [
    {
        patient: 'Aicha Berrada',
        test: 'Troponin I',
        value: '0.42 ng/mL',
        normal: '<0.04',
        critical: true,
    },
    {
        patient: 'Hassan El Amrani',
        test: 'LDL Cholesterol',
        value: '218 mg/dL',
        normal: '<100',
        critical: false,
    },
    {
        patient: 'Aicha Berrada',
        test: 'Potassium',
        value: '5.9 mEq/L',
        normal: '3.5–5.0',
        critical: true,
    },
];

export default function LabOrdersIndex() {
    const { t } = useDoctorLang();

    return (
        <>
            <Head title={t.lab_orders} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.lab_orders}
                    description="23 orders this week · 3 critical results pending review"
                    actions={
                        <Button
                            size="sm"
                            className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                        >
                            <Plus className="size-3.5" />
                            New lab order
                        </Button>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <KpiCard
                        label="In progress"
                        value="8"
                        icon={FlaskConical}
                        tone="navy"
                    />
                    <KpiCard
                        label="Awaiting review"
                        value="3"
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label="Critical results"
                        value="1"
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label="Avg. turnaround"
                        value="18h"
                        icon={Clock}
                        tone="success"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <SectionCard
                        title="Recent orders"
                        titleIcon={<FlaskConical className="size-4" />}
                        actions={
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Filter className="size-3.5" />
                                All labs
                            </Button>
                        }
                        bodyClassName="p-0"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        Order
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Patient
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Tests
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Lab
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Urgency
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ORDERS.map((o) => {
                                    const s = STATUS[o.status];

                                    return (
                                        <TableRow
                                            key={o.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3">
                                                <div className="text-[12px] font-medium tabular-nums">
                                                    {o.id}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {o.date}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[13px]">
                                                {o.patient}
                                            </TableCell>
                                            <TableCell className="text-[13px] tabular-nums">
                                                {o.tests}
                                                {o.abnormal != null &&
                                                    o.abnormal > 0 && (
                                                        <StatusPill
                                                            tone="danger"
                                                            className="ms-1.5 text-[10px]"
                                                        >
                                                            {o.abnormal} abn.
                                                        </StatusPill>
                                                    )}
                                            </TableCell>
                                            <TableCell className="text-[12px] text-muted-foreground">
                                                {o.lab}
                                            </TableCell>
                                            <TableCell>
                                                {o.urgency === 'stat' && (
                                                    <StatusPill tone="danger">
                                                        STAT
                                                    </StatusPill>
                                                )}
                                                {o.urgency === 'urgent' && (
                                                    <StatusPill tone="warning">
                                                        Urgent
                                                    </StatusPill>
                                                )}
                                                {o.urgency === 'routine' && (
                                                    <StatusPill>
                                                        Routine
                                                    </StatusPill>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill tone={s.tone}>
                                                    {s.label}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell>
                                                <ChevronRight className="size-3.5 text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </SectionCard>

                    <SectionCard
                        title="Critical results"
                        titleIcon={<AlertTriangle className="size-4" />}
                        bodyClassName="space-y-2 p-4"
                    >
                        {CRITICAL.map((r, i) => (
                            <div
                                key={i}
                                className={`rounded-lg border border-border p-3 ${r.critical ? 'bg-danger-soft/40' : 'bg-card'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <div className="text-[13px] font-semibold">
                                            {r.test}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {r.patient}
                                        </div>
                                    </div>
                                    <StatusPill
                                        tone={r.critical ? 'danger' : 'warning'}
                                    >
                                        {r.critical ? 'Critical' : 'High'}
                                    </StatusPill>
                                </div>
                                <div className="mt-2 flex items-center gap-3 text-[12px]">
                                    <span
                                        className={`font-semibold tabular-nums ${r.critical ? 'text-danger' : 'text-warning'}`}
                                    >
                                        {r.value}
                                    </span>
                                    <span className="text-muted-foreground">
                                        Normal: {r.normal}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </SectionCard>
                </div>
            </div>
        </>
    );
}
