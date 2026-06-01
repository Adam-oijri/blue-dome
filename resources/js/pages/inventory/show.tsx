import { Deferred, Head, Link, router, usePage } from '@inertiajs/react';
import {
    Boxes,
    ChevronLeft,
    Edit3,
    History,
    Package,
    Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { EditInventorySheet } from '@/components/blue-dome/edit-inventory-sheet';
import type { InventoryEditable } from '@/components/blue-dome/edit-inventory-sheet';
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
import inventoryRoutes from '@/routes/inventory';

type InventoryItem = {
    id: string;
    item_code: string | null;
    item_name: string;
    category: string;
    batch_number: string | null;
    serial_number: string | null;
    expiration_date: string | null;
    quantity_in_stock: string | number | null;
    min_stock_level: string | number | null;
    max_stock_level: string | number | null;
    reorder_point: string | number | null;
    unit: string | null;
    purchase_price: string | number | null;
    selling_price: string | number | null;
    currency: string | null;
    location_in_clinic: string | null;
    requires_refrigeration: boolean;
    is_active: boolean;
    notes: string | null;
    supplier: { id: string; vendor_name: string | null } | null;
    medication: {
        id: string;
        trade_name: string | null;
        strength: string | null;
    } | null;
};

type Transaction = {
    id: string;
    transaction_type: string;
    quantity: string | number | null;
    unit_price: string | number | null;
    total_amount: string | number | null;
    transaction_date: string | null;
    notes: string | null;
};

interface Props {
    inventory: InventoryItem;
    transactions?: Transaction[];
}

const EDIT_ROLES = ['super_admin', 'secretary'];

const TRANSACTION_TONE: Record<string, StatusTone> = {
    purchase: 'success',
    return: 'success',
    adjustment: 'info',
    transfer: 'navy',
    sale: 'olive',
    consumption: 'warning',
    expired: 'danger',
    damaged: 'danger',
    reversal: 'neutral',
};

/** Transaction types that remove stock — shown with a leading minus sign. */
const OUTGOING_TYPES = new Set([
    'sale',
    'consumption',
    'expired',
    'damaged',
    'transfer',
]);

function toNumber(value: string | number | null | undefined): number {
    return Number(value ?? 0);
}

function formatMoney(
    value: string | number | null | undefined,
    currency: string | null,
): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return `${toNumber(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${currency ?? 'MAD'}`;
}

function StatCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: ReactNode;
    sub?: ReactNode;
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {label}
            </div>
            <div className="mt-1 text-[18px] font-semibold tabular-nums">
                {value}
            </div>
            {sub ? (
                <div className="mt-0.5 text-[12px] text-muted-foreground">
                    {sub}
                </div>
            ) : null}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
            <span className="text-[12px] text-muted-foreground">{label}</span>
            <span className="text-end text-[13px] font-medium">{value}</span>
        </div>
    );
}

export default function InventoryShow({ inventory, transactions }: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const role = usePage().props.auth.user.role;
    const canEdit = EDIT_ROLES.includes(role);

    const qty = toNumber(inventory.quantity_in_stock);
    const min = toNumber(inventory.min_stock_level);
    const reorder = toNumber(inventory.reorder_point);

    const stockTone: StatusTone =
        qty <= 0 ? 'danger' : min > 0 && qty < min ? 'warning' : 'success';
    const stockLabel =
        qty <= 0
            ? t.out_of_stock_label
            : min > 0 && qty < min
              ? t.low_stock
              : t.in_stock_label;

    const editable: InventoryEditable = {
        id: inventory.id,
        item_name: inventory.item_name,
        category: inventory.category,
        item_code: inventory.item_code,
        min_stock_level: inventory.min_stock_level,
        expiration_date: inventory.expiration_date,
        is_active: inventory.is_active,
        notes: inventory.notes,
    };

    const destroy = (): void => {
        if (!window.confirm(t.delete_inventory_confirm)) {
            return;
        }

        router.delete(
            inventoryRoutes.destroy.url({ locale, inventory: inventory.id }),
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={inventory.item_name} />

            <div className="px-8 py-6 lg:px-10">
                <div className="mb-4 flex items-center gap-3 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1.5"
                    >
                        <Link href={inventoryRoutes.index.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            {t.inventory}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-medium">
                        {inventory.item_name}
                    </span>
                </div>

                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-[20px] font-semibold">
                                {inventory.item_name}
                            </h1>
                            <StatusPill tone={stockTone} withDot>
                                {stockLabel}
                            </StatusPill>
                            {!inventory.is_active && (
                                <StatusPill tone="neutral">
                                    {t.inactive_label}
                                </StatusPill>
                            )}
                            {inventory.requires_refrigeration && (
                                <StatusPill tone="info">
                                    {t.refrigerated_label}
                                </StatusPill>
                            )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
                            <StatusPill tone="navy">
                                {enumLabel(
                                    t.inventory_category_opts,
                                    inventory.category,
                                )}
                            </StatusPill>
                            {inventory.item_code ? (
                                <span className="tabular-nums">
                                    {inventory.item_code}
                                </span>
                            ) : null}
                            {inventory.location_in_clinic ? (
                                <span>· {inventory.location_in_clinic}</span>
                            ) : null}
                        </div>
                    </div>
                    {canEdit && (
                        <div className="flex items-center gap-2">
                            <EditInventorySheet item={editable}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Edit3 className="size-3.5" />
                                    {t.edit}
                                </Button>
                            </EditInventorySheet>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={destroy}
                                className="gap-2 text-danger hover:text-danger"
                            >
                                <Trash2 className="size-3.5" />
                                {t.delete_action}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label={t.in_stock_label}
                        value={
                            <span className="flex items-baseline gap-1">
                                {qty.toLocaleString()}
                                {inventory.unit ? (
                                    <span className="text-[12px] font-normal text-muted-foreground">
                                        {inventory.unit}
                                    </span>
                                ) : null}
                            </span>
                        }
                        sub={
                            min > 0
                                ? `${t.min_level_value} ${min.toLocaleString()}`
                                : undefined
                        }
                    />
                    <StatCard
                        label={t.reorder_point_label}
                        value={reorder > 0 ? reorder.toLocaleString() : '—'}
                        sub={
                            inventory.max_stock_level
                                ? `${t.max_value} ${toNumber(inventory.max_stock_level).toLocaleString()}`
                                : undefined
                        }
                    />
                    <StatCard
                        label={t.purchase_price_label}
                        value={formatMoney(
                            inventory.purchase_price,
                            inventory.currency,
                        )}
                    />
                    <StatCard
                        label={t.selling_price_label}
                        value={formatMoney(
                            inventory.selling_price,
                            inventory.currency,
                        )}
                    />
                </div>

                <div className="mb-5 grid gap-5 lg:grid-cols-2">
                    <SectionCard
                        title={t.item_details}
                        titleIcon={<Package className="size-4" />}
                        bodyClassName="px-5 py-2"
                    >
                        <DetailRow
                            label={t.col_category}
                            value={enumLabel(
                                t.inventory_category_opts,
                                inventory.category,
                            )}
                        />
                        <DetailRow
                            label={t.unit_label}
                            value={inventory.unit ?? '—'}
                        />
                        <DetailRow
                            label={t.batch_number}
                            value={inventory.batch_number ?? '—'}
                        />
                        <DetailRow
                            label={t.serial_number}
                            value={inventory.serial_number ?? '—'}
                        />
                        <DetailRow
                            label={t.expiration_label}
                            value={
                                inventory.expiration_date
                                    ? String(inventory.expiration_date).slice(
                                          0,
                                          10,
                                      )
                                    : '—'
                            }
                        />
                        <DetailRow
                            label={t.location_label}
                            value={inventory.location_in_clinic ?? '—'}
                        />
                    </SectionCard>

                    <SectionCard
                        title={t.sourcing_label}
                        titleIcon={<Boxes className="size-4" />}
                        bodyClassName="px-5 py-2"
                    >
                        <DetailRow
                            label={t.col_vendor}
                            value={inventory.supplier?.vendor_name ?? '—'}
                        />
                        <DetailRow
                            label={t.linked_medication}
                            value={
                                inventory.medication?.trade_name
                                    ? `${inventory.medication.trade_name}${
                                          inventory.medication.strength
                                              ? ` · ${inventory.medication.strength}`
                                              : ''
                                      }`
                                    : '—'
                            }
                        />
                        <DetailRow
                            label={t.refrigeration_label}
                            value={
                                inventory.requires_refrigeration
                                    ? t.required_label
                                    : t.not_required_label
                            }
                        />
                        <DetailRow
                            label={t.col_status}
                            value={
                                <StatusPill
                                    tone={
                                        inventory.is_active
                                            ? 'success'
                                            : 'neutral'
                                    }
                                >
                                    {inventory.is_active
                                        ? t.active_label
                                        : t.inactive_label}
                                </StatusPill>
                            }
                        />
                        {inventory.notes ? (
                            <DetailRow
                                label={t.notes_label}
                                value={
                                    <span className="font-normal text-muted-foreground">
                                        {inventory.notes}
                                    </span>
                                }
                            />
                        ) : null}
                    </SectionCard>
                </div>

                <SectionCard
                    title={t.stock_movements}
                    titleIcon={<History className="size-4" />}
                    bodyClassName="p-0"
                >
                    <Deferred
                        data="transactions"
                        fallback={
                            <div className="space-y-2 p-5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-9 animate-pulse rounded-md bg-muted"
                                    />
                                ))}
                            </div>
                        }
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        {t.col_date}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.type_label}
                                    </TableHead>
                                    <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                        {t.col_qty}
                                    </TableHead>
                                    <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                        {t.col_unit_price}
                                    </TableHead>
                                    <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                        {t.col_total}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.notes_label}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(!transactions ||
                                    transactions.length === 0) && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="px-5 py-10 text-center text-sm text-muted-foreground"
                                        >
                                            {t.no_stock_movements}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {transactions?.map((tx) => {
                                    const outgoing = OUTGOING_TYPES.has(
                                        tx.transaction_type,
                                    );
                                    const txQty = toNumber(tx.quantity);

                                    return (
                                        <TableRow key={tx.id}>
                                            <TableCell className="px-5 py-3 text-[12px] text-muted-foreground tabular-nums">
                                                {tx.transaction_date
                                                    ? String(
                                                          tx.transaction_date,
                                                      ).slice(0, 10)
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill
                                                    tone={
                                                        TRANSACTION_TONE[
                                                            tx.transaction_type
                                                        ] ?? 'neutral'
                                                    }
                                                >
                                                    {enumLabel(
                                                        t.inventory_txn_opts,
                                                        tx.transaction_type,
                                                    )}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] font-medium tabular-nums">
                                                {outgoing && txQty > 0
                                                    ? `-${txQty.toLocaleString()}`
                                                    : txQty.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-end text-[12px] text-muted-foreground tabular-nums">
                                                {formatMoney(
                                                    tx.unit_price,
                                                    inventory.currency,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] tabular-nums">
                                                {formatMoney(
                                                    tx.total_amount,
                                                    inventory.currency,
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[220px] truncate text-[12px] text-muted-foreground">
                                                {tx.notes ?? '—'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Deferred>
                </SectionCard>
            </div>
        </>
    );
}
