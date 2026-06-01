import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CircleDollarSign,
    Plus,
    Receipt,
    Wallet,
} from 'lucide-react';

import { CreateInvoicesSheet } from '@/components/blue-dome/create-invoices-sheet';
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
import { fmtNumber } from '@/lib/format';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { Pagination } from '@/pages/panels/super-admin/users';
import { billing as billingRoute } from '@/routes/secretary';

type InvStatus =
    | 'draft'
    | 'pending'
    | 'paid'
    | 'partially_paid'
    | 'overdue'
    | 'cancelled'
    | 'refunded'
    | 'collections';

type StatusFilter = 'all' | 'pending' | 'overdue' | 'paid' | 'partially_paid';

type Patient = {
    first_name: string | null;
    last_name: string | null;
    gender: string | null;
    insurance_company: string | null;
};

type InvoiceRow = {
    id: string;
    invoice_number: string | null;
    invoice_date: string | null;
    due_date: string | null;
    total: string | number;
    paid_amount: string | number;
    balance_due: string | number;
    status: InvStatus;
    currency: string | null;
    patient?: Patient | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

interface Props {
    invoices: Paginated<InvoiceRow>;
    kpis: {
        open: number;
        overdue: number;
        collected: number;
        outstanding: number;
    };
    aging: { label: string; amount: number }[];
    patients: { id: string; first_name: string | null; last_name: string | null }[];
    filters: {
        status: StatusFilter;
    };
}

const STATUS_TONE: Record<InvStatus, StatusTone> = {
    draft: 'neutral',
    pending: 'warning',
    paid: 'success',
    partially_paid: 'info',
    overdue: 'danger',
    cancelled: 'neutral',
    refunded: 'navy',
    collections: 'danger',
};

const STATUS_KEY: Record<InvStatus, string> = {
    draft: 'bl_status_draft',
    pending: 'bl_status_pending',
    paid: 'bl_status_paid',
    partially_paid: 'bl_status_partial',
    overdue: 'bl_status_overdue',
    cancelled: 'bl_status_cancelled',
    refunded: 'bl_status_refunded',
    collections: 'bl_status_collections',
};

const AGING_COLORS = ['bg-olive-500', 'bg-warning', 'bg-orange-500', 'bg-danger'];

/**
 * The aging buckets arrive from the controller with fixed English labels;
 * map them to localized dictionary keys so the chart respects the UI language.
 */
const AGING_KEY: Record<string, string> = {
    Current: 'bl_aging_current',
    '1-30 days': 'bl_aging_1_30',
    '31-60 days': 'bl_aging_31_60',
    '61+ days': 'bl_aging_61_plus',
};

const fullName = (p: Patient | null | undefined, fallback: string): string =>
    p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || fallback : fallback;

const initials = (p: Patient | null | undefined): string => {
    if (!p) {
        return '—';
    }

    return (
        `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() ||
        '—'
    );
};

export default function SecretaryBilling({
    invoices,
    kpis,
    aging,
    patients,
    filters,
}: Props) {
    const { t } = useSecretaryLang();
    const { slug: locale } = useLocale();

    const tr = (key: string): string => t[key] ?? key;

    const money = (n: number): string => `${fmtNumber(Number(n))} ${t.mad}`;

    const setStatus = (status: StatusFilter): void => {
        router.get(
            billingRoute.url({ locale }),
            status === 'all' ? {} : { status },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const agingTotal = aging.reduce((s, b) => s + Number(b.amount), 0);
    const agingMax = aging.reduce((m, b) => Math.max(m, Number(b.amount)), 0);

    const STATUS_FILTERS: ReadonlyArray<readonly [StatusFilter, string]> = [
        ['all', t.all_label],
        ['pending', tr('bl_status_pending')],
        ['overdue', tr('bl_status_overdue')],
        ['paid', tr('bl_status_paid')],
        ['partially_paid', tr('bl_status_partial')],
    ];

    return (
        <>
            <Head title={t.nav_billing} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_billing}
                    description={`${kpis.open} ${tr('bl_open')} · ${kpis.overdue} ${tr('bl_overdue')} · ${money(kpis.collected)} ${tr('bl_collected')}`}
                    actions={
                        <CreateInvoicesSheet patients={patients}>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                {tr('bl_new')}
                            </Button>
                        </CreateInvoicesSheet>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={tr('bl_kpi_open')}
                        value={String(kpis.open)}
                        icon={Receipt}
                        tone="navy"
                    />
                    <KpiCard
                        label={tr('bl_kpi_overdue')}
                        value={String(kpis.overdue)}
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label={tr('bl_kpi_collected')}
                        value={money(kpis.collected)}
                        icon={CircleDollarSign}
                        tone="olive"
                    />
                    <KpiCard
                        label={tr('bl_kpi_outstanding')}
                        value={money(kpis.outstanding)}
                        icon={Wallet}
                        tone="warn"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                    <SectionCard bodyClassName="p-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                            <div className="flex flex-wrap gap-1.5">
                                {STATUS_FILTERS.map(([id, label]) => (
                                    <Button
                                        key={id}
                                        variant={
                                            filters.status === id
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        size="sm"
                                        onClick={() => setStatus(id)}
                                        className={cn(
                                            'gap-1.5',
                                            filters.status === id
                                                ? 'bg-navy-900 text-white hover:bg-navy-800'
                                                : '',
                                        )}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        {tr('col_invoice')}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {tr('col_patient')}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {tr('bl_col_issued')}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {tr('bl_col_due')}
                                    </TableHead>
                                    <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                        {tr('bl_col_total')}
                                    </TableHead>
                                    <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                        {tr('bl_col_balance')}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {tr('col_status')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center text-sm text-muted-foreground"
                                        >
                                            {tr('empty_none')}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {invoices.data.map((r) => {
                                    const p = r.patient;
                                    const balance = Number(r.balance_due);
                                    const tone =
                                        STATUS_TONE[r.status] ?? 'neutral';
                                    const statusLabel = tr(
                                        STATUS_KEY[r.status] ?? r.status,
                                    );
                                    const isOverdue = r.status === 'overdue';

                                    return (
                                        <TableRow
                                            key={r.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3 font-mono text-[11px] font-semibold">
                                                {r.invoice_number ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={cn(
                                                            'grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white',
                                                            p?.gender === 'male'
                                                                ? 'bg-navy-700'
                                                                : 'bg-olive-600',
                                                        )}
                                                    >
                                                        {initials(p)}
                                                    </div>
                                                    <div>
                                                        <div className="text-[12px] font-semibold">
                                                            {fullName(
                                                                p,
                                                                tr('unassigned'),
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {p?.insurance_company ??
                                                                ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                                {r.invoice_date?.slice(0, 10) ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-[12px] tabular-nums',
                                                    isOverdue
                                                        ? 'font-semibold text-danger'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {r.due_date?.slice(0, 10) ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] font-semibold tabular-nums">
                                                {fmtNumber(Number(r.total))}{' '}
                                                <span className="text-[11px] font-normal text-muted-foreground">
                                                    {r.currency ?? t.mad}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] tabular-nums">
                                                {balance > 0 ? (
                                                    <span className="font-semibold text-navy-900">
                                                        {fmtNumber(balance)}{' '}
                                                        <span className="text-[11px] font-normal text-muted-foreground">
                                                            {r.currency ?? t.mad}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/60">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill
                                                    tone={tone}
                                                    withDot
                                                >
                                                    {statusLabel}
                                                </StatusPill>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <Pagination paginated={invoices} t={t} />
                    </SectionCard>

                    <SectionCard
                        title={tr('bl_aging_title')}
                        bodyClassName="space-y-3 p-4"
                    >
                        <div className="text-[11px] text-muted-foreground">
                            {tr('bl_aging_subtitle')}
                        </div>
                        {aging.map((b, i) => {
                            const amount = Number(b.amount);
                            const pct =
                                agingMax > 0
                                    ? Math.round((amount / agingMax) * 100)
                                    : 0;
                            const sharePct =
                                agingTotal > 0
                                    ? Math.round((amount / agingTotal) * 100)
                                    : 0;
                            const label = tr(AGING_KEY[b.label] ?? b.label);

                            return (
                                <div key={b.label}>
                                    <div className="flex items-center justify-between text-[12px]">
                                        <span>{label}</span>
                                        <span className="font-semibold tabular-nums">
                                            {sharePct}%
                                        </span>
                                    </div>
                                    <div className="relative mt-1 h-5 overflow-hidden rounded bg-muted">
                                        <div
                                            className={cn(
                                                'absolute inset-y-0 start-0 flex items-center px-2 text-[11px] font-semibold text-white',
                                                AGING_COLORS[i] ?? 'bg-navy-700',
                                            )}
                                            style={{ width: `${pct}%` }}
                                        >
                                            {fmtNumber(amount)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                            <span className="text-[12px] text-muted-foreground">
                                {tr('bl_total_outstanding')}
                            </span>
                            <span className="text-[15px] font-semibold text-navy-900 tabular-nums">
                                {money(kpis.outstanding)}
                            </span>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}
