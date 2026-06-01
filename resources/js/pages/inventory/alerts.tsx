import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronRight,
    Clock,
    PackageX,
    TimerOff,
} from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
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
import inventoryRoutes from '@/routes/inventory';

type AlertType = 'out_of_stock' | 'low_stock' | 'expired' | 'expiring_soon';

type AlertRow = {
    id: string;
    item_code: string | null;
    item_name: string;
    category: string | null;
    quantity_in_stock: string | number | null;
    min_stock_level: string | number | null;
    expiration_date: string | null;
    alert_type: AlertType;
};

interface Props {
    alerts: AlertRow[];
}

const STOCK_ALERTS: ReadonlyArray<AlertType> = ['out_of_stock', 'low_stock'];
const EXPIRY_ALERTS: ReadonlyArray<AlertType> = ['expired', 'expiring_soon'];

const SEVERITY_TONE: Record<AlertType, StatusTone> = {
    out_of_stock: 'danger',
    low_stock: 'warning',
    expired: 'danger',
    expiring_soon: 'warning',
};

function toNumber(value: string | number | null): number {
    return Number(value ?? 0);
}

function formatDate(value: string | null): string {
    return value ? String(value).slice(0, 10) : '—';
}

function daysUntil(value: string | null): number | null {
    if (!value) {
        return null;
    }

    return Math.round(
        (new Date(value).getTime() - Date.now()) / 86_400_000,
    );
}

export default function InventoryAlerts({ alerts }: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const stockRows = alerts.filter((row) =>
        STOCK_ALERTS.includes(row.alert_type),
    );
    const expiryRows = alerts.filter((row) =>
        EXPIRY_ALERTS.includes(row.alert_type),
    );

    const count = (type: AlertType): number =>
        alerts.filter((row) => row.alert_type === type).length;

    const SEVERITY_LABEL: Record<AlertType, string> = {
        out_of_stock: t.out_of_stock_label,
        low_stock: t.low_stock,
        expired: t.expired_label,
        expiring_soon: t.expiring_soon,
    };

    return (
        <>
            <Head title={t.inventory_alerts} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.inventory_alerts}
                    description={`${alerts.length} ${t.items_need_attention}`}
                    actions={
                        <Link
                            href={inventoryRoutes.index.url({ locale })}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-[13px] font-medium hover:bg-muted"
                        >
                            <ChevronRight className="size-3.5 rotate-180 text-muted-foreground rtl:rotate-0" />
                            {t.inventory}
                        </Link>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <KpiCard
                        label={t.out_of_stock_label}
                        value={count('out_of_stock')}
                        icon={PackageX}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.low_stock}
                        value={count('low_stock')}
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.expired_label}
                        value={count('expired')}
                        icon={TimerOff}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.expiring_soon}
                        value={count('expiring_soon')}
                        icon={Clock}
                        tone="warn"
                    />
                </div>

                <SectionCard
                    title={t.at_below_reorder}
                    titleIcon={<AlertTriangle className="size-4" />}
                    actions={
                        <StatusPill tone="neutral">
                            {stockRows.length}
                        </StatusPill>
                    }
                    bodyClassName="p-0"
                    className="mb-6"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.item_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_category}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.stock_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.min_level_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_status}
                                </TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockRows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="px-5 py-10 text-center text-sm text-muted-foreground"
                                    >
                                        {t.all_above_reorder}
                                    </TableCell>
                                </TableRow>
                            )}
                            {stockRows.map((row) => {
                                const severityTone =
                                    SEVERITY_TONE[row.alert_type];
                                const severityLabel =
                                    SEVERITY_LABEL[row.alert_type];
                                const qty = toNumber(row.quantity_in_stock);

                                return (
                                    <TableRow
                                        key={row.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <Link
                                                href={inventoryRoutes.show.url({
                                                    locale,
                                                    inventory: row.id,
                                                })}
                                                className="text-[13px] font-medium"
                                            >
                                                {row.item_name}
                                            </Link>
                                            {row.item_code && (
                                                <div className="text-[11px] text-muted-foreground tabular-nums">
                                                    {row.item_code}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {row.category ? (
                                                <StatusPill>
                                                    {enumLabel(
                                                        t.inventory_category_opts,
                                                        row.category,
                                                    )}
                                                </StatusPill>
                                            ) : (
                                                <span className="text-[12px] text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell
                                            className={`text-[13px] font-semibold tabular-nums ${
                                                qty <= 0
                                                    ? 'text-danger'
                                                    : 'text-warning'
                                            }`}
                                        >
                                            {qty}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {toNumber(row.min_stock_level)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={severityTone}
                                                withDot
                                            >
                                                {severityLabel}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={inventoryRoutes.show.url({
                                                    locale,
                                                    inventory: row.id,
                                                })}
                                                aria-label={t.view_details}
                                            >
                                                <ChevronRight className="size-3.5 text-muted-foreground rtl:rotate-180" />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </SectionCard>

                <SectionCard
                    title={t.expiring_or_expired}
                    titleIcon={<Clock className="size-4" />}
                    actions={
                        <StatusPill tone="neutral">
                            {expiryRows.length}
                        </StatusPill>
                    }
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.item_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_category}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.stock_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.expiry_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_status}
                                </TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expiryRows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="px-5 py-10 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_items_expiring}
                                    </TableCell>
                                </TableRow>
                            )}
                            {expiryRows.map((row) => {
                                const severityTone =
                                    SEVERITY_TONE[row.alert_type];
                                const severityLabel =
                                    SEVERITY_LABEL[row.alert_type];
                                const days = daysUntil(row.expiration_date);

                                return (
                                    <TableRow
                                        key={row.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <Link
                                                href={inventoryRoutes.show.url({
                                                    locale,
                                                    inventory: row.id,
                                                })}
                                                className="text-[13px] font-medium"
                                            >
                                                {row.item_name}
                                            </Link>
                                            {row.item_code && (
                                                <div className="text-[11px] text-muted-foreground tabular-nums">
                                                    {row.item_code}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {row.category ? (
                                                <StatusPill>
                                                    {enumLabel(
                                                        t.inventory_category_opts,
                                                        row.category,
                                                    )}
                                                </StatusPill>
                                            ) : (
                                                <span className="text-[12px] text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-[13px] tabular-nums">
                                            {toNumber(row.quantity_in_stock)}
                                        </TableCell>
                                        <TableCell className="text-[12px] tabular-nums">
                                            <span className="text-muted-foreground">
                                                {formatDate(
                                                    row.expiration_date,
                                                )}
                                            </span>
                                            {days !== null && (
                                                <span
                                                    className={`ms-2 text-[11px] font-medium ${
                                                        days < 0
                                                            ? 'text-danger'
                                                            : 'text-warning'
                                                    }`}
                                                >
                                                    {days < 0
                                                        ? `${Math.abs(days)}${t.days_ago}`
                                                        : `${t.in_days} ${days} ${t.days_label}`}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={severityTone}
                                                withDot
                                            >
                                                {severityLabel}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={inventoryRoutes.show.url({
                                                    locale,
                                                    inventory: row.id,
                                                })}
                                                aria-label={t.view_details}
                                            >
                                                <ChevronRight className="size-3.5 text-muted-foreground rtl:rotate-180" />
                                            </Link>
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
