import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronRight,
    Clock,
    FileDown,
    FlaskConical,
    Plus,
} from 'lucide-react';

import { CreateLabOrdersSheet } from '@/components/blue-dome/create-lab-orders-sheet';
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
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
import labOrders from '@/routes/lab-orders';

type LabStatus =
    | 'pending'
    | 'sample_collected'
    | 'in_progress'
    | 'partially_completed'
    | 'completed'
    | 'cancelled';
type Urgency = 'routine' | 'urgent' | 'stat';

type Person = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code?: string | null;
} | null;

type LabOrderRow = {
    id: string;
    lab_order_number: string | null;
    order_date: string | null;
    status: LabStatus;
    urgency: Urgency;
    items_count: number;
    abnormal_count: number;
    patient?: Person;
    external_lab?: { id: string; lab_name: string | null } | null;
};

type CriticalResult = {
    id: string;
    test_name: string | null;
    result: string | null;
    unit: string | null;
    normal_range: string | null;
    is_critical: boolean;
    is_abnormal: boolean;
    lab_order?: { id: string; patient?: Person } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type PatientOption = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code: string | null;
};

const STATUS: Record<LabStatus, { tone: StatusTone; label: string }> = {
    pending: { tone: 'neutral', label: 'Pending' },
    sample_collected: { tone: 'warning', label: 'Collected' },
    in_progress: { tone: 'info', label: 'In progress' },
    partially_completed: { tone: 'info', label: 'Partial' },
    completed: { tone: 'success', label: 'Completed' },
    cancelled: { tone: 'danger', label: 'Cancelled' },
};

function personName(p?: Person): string {
    return p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';
}

export default function LabOrdersIndex({
    lab_orders,
    patients,
    kpis,
    critical_results,
}: {
    lab_orders: Paginated<LabOrderRow>;
    patients: PatientOption[];
    kpis: {
        pending: number;
        in_progress: number;
        completed: number;
        critical: number;
    };
    critical_results: CriticalResult[];
    filters: { patient_id: string | null; status: string | null };
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={t.lab_orders} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.lab_orders}
                    description={`${lab_orders.total} orders · ${kpis.critical} critical results`}
                    actions={
                        <CreateLabOrdersSheet patients={patients}>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                {t.new_lab_order}
                            </Button>
                        </CreateLabOrdersSheet>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <KpiCard
                        label={t.in_progress}
                        value={String(kpis.in_progress)}
                        icon={FlaskConical}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.pending}
                        value={String(kpis.pending)}
                        icon={Clock}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.completed}
                        value={String(kpis.completed)}
                        icon={FlaskConical}
                        tone="success"
                    />
                    <KpiCard
                        label={t.critical_results}
                        value={String(kpis.critical)}
                        icon={AlertTriangle}
                        tone="warn"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <SectionCard
                        title={t.recent_orders}
                        titleIcon={<FlaskConical className="size-4" />}
                        bodyClassName="p-0"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        {t.order_col}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.col_patient}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.tests_col}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.lab_col}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.urgency_col}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.col_status}
                                    </TableHead>
                                    <TableHead className="w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lab_orders.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-12 text-center text-sm text-muted-foreground"
                                        >
                                            {t.no_lab_orders}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {lab_orders.data.map((o) => {
                                    const s =
                                        STATUS[o.status] ?? STATUS.pending;

                                    return (
                                        <TableRow
                                            key={o.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3">
                                                <Link
                                                    href={labOrders.show.url({
                                                        locale,
                                                        lab_order: o.id,
                                                    })}
                                                    className="block"
                                                >
                                                    <div className="text-[12px] font-medium tabular-nums">
                                                        {o.lab_order_number ??
                                                            '—'}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {o.order_date?.slice(
                                                            0,
                                                            10,
                                                        ) ?? '—'}
                                                    </div>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-[13px]">
                                                {personName(o.patient)}
                                            </TableCell>
                                            <TableCell className="text-[13px] tabular-nums">
                                                {o.items_count}
                                                {o.abnormal_count > 0 && (
                                                    <StatusPill
                                                        tone="danger"
                                                        className="ms-1.5 text-[10px]"
                                                    >
                                                        {o.abnormal_count}{' '}
                                                        {t.abnormal_short}
                                                    </StatusPill>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-[12px] text-muted-foreground">
                                                {o.external_lab?.lab_name ??
                                                    t.in_house}
                                            </TableCell>
                                            <TableCell>
                                                {o.urgency === 'stat' && (
                                                    <StatusPill tone="danger">
                                                        {enumLabel(
                                                            t.urgency_opts,
                                                            o.urgency,
                                                        )}
                                                    </StatusPill>
                                                )}
                                                {o.urgency === 'urgent' && (
                                                    <StatusPill tone="warning">
                                                        {enumLabel(
                                                            t.urgency_opts,
                                                            o.urgency,
                                                        )}
                                                    </StatusPill>
                                                )}
                                                {o.urgency === 'routine' && (
                                                    <StatusPill>
                                                        {enumLabel(
                                                            t.urgency_opts,
                                                            o.urgency,
                                                        )}
                                                    </StatusPill>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill tone={s.tone}>
                                                    {enumLabel(
                                                        t.lab_status_opts,
                                                        o.status,
                                                    )}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={labOrders.pdf.url(
                                                            {
                                                                locale,
                                                                lab_order: o.id,
                                                            },
                                                        )}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title={t.export_pdf}
                                                        aria-label={
                                                            t.export_pdf
                                                        }
                                                    >
                                                        <FileDown className="size-3.5 text-muted-foreground hover:text-foreground" />
                                                    </a>
                                                    <Link
                                                        href={labOrders.show.url(
                                                            {
                                                                locale,
                                                                lab_order: o.id,
                                                            },
                                                        )}
                                                    >
                                                        <ChevronRight className="size-3.5 text-muted-foreground" />
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        <Pagination paginated={lab_orders} t={t} />
                    </SectionCard>

                    <SectionCard
                        title={t.critical_results}
                        titleIcon={<AlertTriangle className="size-4" />}
                        bodyClassName="space-y-2 p-4"
                    >
                        {critical_results.length === 0 && (
                            <p className="py-6 text-center text-[12px] text-muted-foreground">
                                {t.no_critical_results}
                            </p>
                        )}
                        {critical_results.map((r) => (
                            <div
                                key={r.id}
                                className={`rounded-lg border border-border p-3 ${r.is_critical ? 'bg-danger-soft/40' : 'bg-card'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <div className="text-[13px] font-semibold">
                                            {r.test_name ?? '—'}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {personName(r.lab_order?.patient)}
                                        </div>
                                    </div>
                                    <StatusPill
                                        tone={
                                            r.is_critical ? 'danger' : 'warning'
                                        }
                                    >
                                        {r.is_critical
                                            ? t.result_critical
                                            : t.result_high}
                                    </StatusPill>
                                </div>
                                <div className="mt-2 flex items-center gap-3 text-[12px]">
                                    <span
                                        className={`font-semibold tabular-nums ${r.is_critical ? 'text-danger' : 'text-warning'}`}
                                    >
                                        {r.result ?? '—'}
                                        {r.unit ? ` ${r.unit}` : ''}
                                    </span>
                                    {r.normal_range && (
                                        <span className="text-muted-foreground">
                                            Normal: {r.normal_range}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </SectionCard>
                </div>
            </div>
        </>
    );
}
