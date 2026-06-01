import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Box, Clock, Pencil, Plus } from 'lucide-react';

import { CreateInventorySheet } from '@/components/blue-dome/create-inventory-sheet';
import { EditInventorySheet } from '@/components/blue-dome/edit-inventory-sheet';
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
import { cn } from '@/lib/utils';
import inventoryRoutes from '@/routes/inventory';

type ItemStatus = 'ok' | 'low' | 'critical' | 'expiring';

type InventoryRow = {
    id: string;
    item_code: string | null;
    item_name: string;
    category: string;
    quantity_in_stock: string | number | null;
    min_stock_level: string | number | null;
    expiration_date: string | null;
    unit: string | null;
    is_active: boolean;
    notes: string | null;
    supplier: { vendor_name: string | null } | null;
};

type Option = { id: string; name: string };

interface Props {
    inventory: { data: InventoryRow[]; total: number };
    medications: Option[];
    vendors: Option[];
    branches: Option[];
    filters?: { category: string | null; branch: string | null };
}

const STATUS: Record<ItemStatus, { tone: StatusTone; label: string }> = {
    ok: { tone: 'success', label: 'In stock' },
    low: { tone: 'warning', label: 'Low' },
    critical: { tone: 'danger', label: 'Critical' },
    expiring: { tone: 'warning', label: 'Expiring soon' },
};

const BAR_COLOR: Record<ItemStatus, string> = {
    ok: 'bg-olive-500',
    low: 'bg-warning',
    critical: 'bg-danger',
    expiring: 'bg-warning',
};

const EDIT_ROLES = ['super_admin', 'secretary'];

const CATEGORY_OPTIONS: ReadonlyArray<readonly [string, string]> = [
    ['medication', 'Medication'],
    ['supplies', 'Supplies'],
    ['equipment', 'Equipment'],
    ['office_supplies', 'Office supplies'],
];

const SELECT_CLASS =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

function deriveStatus(row: InventoryRow): ItemStatus {
    const qty = Number(row.quantity_in_stock ?? 0);
    const min = Number(row.min_stock_level ?? 0);

    if (qty <= 0) {
        return 'critical';
    }

    if (min > 0 && qty < min) {
        return 'low';
    }

    if (row.expiration_date) {
        const days =
            (new Date(row.expiration_date).getTime() - Date.now()) / 86_400_000;

        if (days >= 0 && days <= 60) {
            return 'expiring';
        }
    }

    return 'ok';
}

export default function InventoryIndex({
    inventory,
    medications,
    vendors,
    branches,
    filters,
}: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const role = usePage().props.auth.user.role;
    const canEdit = EDIT_ROLES.includes(role);

    const applyFilters = (next: {
        category?: string;
        branch?: string;
    }): void => {
        router.get(
            inventoryRoutes.index.url({ locale }),
            {
                category:
                    (next.category ?? filters?.category ?? '') || undefined,
                branch: (next.branch ?? filters?.branch ?? '') || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const rows = inventory.data;
    const count = (status: ItemStatus): number =>
        rows.filter((r) => deriveStatus(r) === status).length;

    const STATUS_LABEL: Record<ItemStatus, string> = {
        ok: t.in_stock_label,
        low: t.low_stock,
        critical: t.critical_label,
        expiring: t.expiring_soon,
    };

    return (
        <>
            <Head title={t.inventory} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.inventory}
                    description={`${inventory.total} ${t.items_tracked}`}
                    actions={
                        <>
                            <Button variant="outline" size="sm" className="gap-2">
                                <AlertTriangle className="size-3.5" />
                                {t.reorder_list}
                            </Button>
                            {canEdit && (
                                <CreateInventorySheet
                                    medications={medications}
                                    vendors={vendors}
                                >
                                    <Button
                                        size="sm"
                                        className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                                    >
                                        <Plus className="size-3.5" />
                                        {t.add_item}
                                    </Button>
                                </CreateInventorySheet>
                            )}
                        </>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <KpiCard
                        label={t.total_items}
                        value={String(inventory.total)}
                        icon={Box}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.low_stock}
                        value={String(count('low'))}
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.critical_label}
                        value={String(count('critical'))}
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.expiring_soon}
                        value={String(count('expiring'))}
                        icon={Clock}
                        tone="warn"
                    />
                </div>

                <SectionCard
                    title={t.stock_levels}
                    titleIcon={<Box className="size-4" />}
                    actions={
                        <>
                            <select
                                value={filters?.category ?? ''}
                                onChange={(e) =>
                                    applyFilters({ category: e.target.value })
                                }
                                className={SELECT_CLASS}
                                aria-label={t.filter_by_category}
                            >
                                <option value="">{t.all_categories}</option>
                                {CATEGORY_OPTIONS.map(([value]) => (
                                    <option key={value} value={value}>
                                        {enumLabel(
                                            t.inventory_category_opts,
                                            value,
                                        )}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters?.branch ?? ''}
                                onChange={(e) =>
                                    applyFilters({ branch: e.target.value })
                                }
                                className={SELECT_CLASS}
                                aria-label={t.filter_by_branch}
                            >
                                <option value="">{t.all_branches}</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </>
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
                                    {t.min_level_col}
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
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="px-5 py-10 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_inventory_items}
                                    </TableCell>
                                </TableRow>
                            )}
                            {rows.map((it) => {
                                const status = deriveStatus(it);
                                const s = STATUS[status];
                                const qty = Number(it.quantity_in_stock ?? 0);
                                const min = Number(it.min_stock_level ?? 0);
                                const pct = Math.min(
                                    100,
                                    (qty / Math.max(min * 3, 1)) * 100,
                                );

                                return (
                                    <TableRow
                                        key={it.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3 text-[13px] font-medium">
                                            {it.item_name}
                                            {it.unit ? (
                                                <span className="ms-1 text-[11px] text-muted-foreground">
                                                    / {it.unit}
                                                </span>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill>
                                                {enumLabel(
                                                    t.inventory_category_opts,
                                                    it.category,
                                                )}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <span className="min-w-[32px] text-[13px] font-semibold tabular-nums">
                                                    {qty}
                                                </span>
                                                <div className="relative h-1.5 max-w-[80px] flex-1 overflow-hidden rounded bg-muted">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded',
                                                            BAR_COLOR[status],
                                                        )}
                                                        style={{
                                                            width: `${pct}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {min}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {it.expiration_date
                                                ? String(
                                                      it.expiration_date,
                                                  ).slice(0, 10)
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill tone={s.tone}>
                                                {STATUS_LABEL[status]}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            {canEdit && (
                                                <EditInventorySheet item={it}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7"
                                                        aria-label={t.edit}
                                                    >
                                                        <Pencil className="size-3.5 text-muted-foreground" />
                                                    </Button>
                                                </EditInventorySheet>
                                            )}
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
