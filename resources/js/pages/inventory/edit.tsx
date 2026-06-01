import { Head, Link, router, useForm } from '@inertiajs/react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill  } from '@/components/blue-dome/status-pill';
import type {StatusTone} from '@/components/blue-dome/status-pill';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import inventory from '@/routes/inventory';

type InventoryItem = {
    id: string;
    item_code: string | null;
    item_name: string;
    category: string;
    quantity_in_stock: string | number | null;
    min_stock_level: string | number | null;
    max_stock_level: string | number | null;
    unit: string | null;
    expiration_date: string | null;
    is_active: boolean;
    notes: string | null;
};

interface Props {
    inventory: InventoryItem;
}

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const CATEGORY_OPTIONS: ReadonlyArray<readonly [string, string]> = [
    ['medication', 'Medication'],
    ['supplies', 'Supplies'],
    ['equipment', 'Equipment'],
    ['office_supplies', 'Office supplies'],
];

function toNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed) ? null : parsed;
}

type StockStatus = 'out_of_stock' | 'low_stock' | 'in_stock';

function stockTone(item: InventoryItem): {
    tone: StatusTone;
    status: StockStatus;
} {
    const quantity = toNumber(item.quantity_in_stock) ?? 0;
    const minLevel = toNumber(item.min_stock_level);

    if (quantity <= 0) {
        return { tone: 'danger', status: 'out_of_stock' };
    }

    if (minLevel !== null && quantity <= minLevel) {
        return { tone: 'warning', status: 'low_stock' };
    }

    return { tone: 'success', status: 'in_stock' };
}

export default function InventoryEdit({ inventory: item }: Props) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();

    const form = useForm({
        item_name: item.item_name ?? '',
        category: item.category ?? 'medication',
        item_code: item.item_code ?? '',
        min_stock_level:
            item.min_stock_level === null || item.min_stock_level === undefined
                ? ''
                : String(item.min_stock_level),
        expiration_date: item.expiration_date
            ? String(item.expiration_date).slice(0, 10)
            : '',
        is_active: item.is_active,
        notes: item.notes ?? '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.put(inventory.update.url({ locale, inventory: item.id }), {
            preserveScroll: true,
        });
    };

    const handleDelete = (): void => {
        if (!window.confirm(t.delete_inventory_confirm)) {
            return;
        }

        router.delete(inventory.destroy.url({ locale, inventory: item.id }));
    };

    const stock = stockTone(item);
    const quantity = toNumber(item.quantity_in_stock);

    const STOCK_LABEL: Record<StockStatus, string> = {
        out_of_stock: t.out_of_stock_label,
        low_stock: t.low_stock,
        in_stock: t.in_stock_label,
    };

    return (
        <>
            <Head title={`${t.edit} · ${item.item_name}`} />

            <div className="mx-auto w-full max-w-3xl p-6">
                <PageHeader
                    title={t.edit}
                    description={
                        <span className="flex flex-wrap items-center gap-2">
                            <span className="truncate">{item.item_name}</span>
                            {item.item_code && (
                                <span className="text-muted-foreground/70">
                                    · {item.item_code}
                                </span>
                            )}
                        </span>
                    }
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={inventory.show.url({
                                    locale,
                                    inventory: item.id,
                                })}
                            >
                                {t.view_details}
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-6">
                    <SectionCard title={t.current_stock}>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                            <div>
                                <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                    {t.col_status}
                                </dt>
                                <dd className="mt-1">
                                    <StatusPill tone={stock.tone} withDot>
                                        {STOCK_LABEL[stock.status]}
                                    </StatusPill>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                    {t.quantity_in_stock}
                                </dt>
                                <dd className="mt-1 text-sm text-foreground">
                                    {quantity === null ? '—' : quantity}
                                    {item.unit ? (
                                        <span className="ms-1 text-muted-foreground">
                                            {item.unit}
                                        </span>
                                    ) : null}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                    {t.col_category}
                                </dt>
                                <dd className="mt-1 text-sm text-foreground">
                                    {enumLabel(
                                        t.inventory_category_opts,
                                        item.category,
                                    )}
                                </dd>
                            </div>
                        </dl>
                        <p className="mt-4 text-[13px] text-muted-foreground">
                            {t.stock_adjust_note}
                        </p>
                    </SectionCard>

                    <SectionCard title={t.item_details}>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="item_name">
                                    {t.item_name_label}
                                </Label>
                                <input
                                    id="item_name"
                                    value={form.data.item_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'item_name',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.item_name} />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">
                                        {t.col_category}
                                    </Label>
                                    <select
                                        id="category"
                                        value={form.data.category}
                                        onChange={(e) =>
                                            form.setData(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    >
                                        {CATEGORY_OPTIONS.map(([value]) => (
                                            <option key={value} value={value}>
                                                {enumLabel(
                                                    t.inventory_category_opts,
                                                    value,
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={form.errors.category}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="item_code">
                                        {t.item_code_label}
                                    </Label>
                                    <input
                                        id="item_code"
                                        value={form.data.item_code}
                                        onChange={(e) =>
                                            form.setData(
                                                'item_code',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <InputError
                                        message={form.errors.item_code}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="min_stock_level">
                                        {t.min_level_value}
                                    </Label>
                                    <input
                                        id="min_stock_level"
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={form.data.min_stock_level}
                                        onChange={(e) =>
                                            form.setData(
                                                'min_stock_level',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <InputError
                                        message={form.errors.min_stock_level}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expiration_date">
                                        {t.expiration_date_label}
                                    </Label>
                                    <input
                                        id="expiration_date"
                                        type="date"
                                        value={form.data.expiration_date}
                                        onChange={(e) =>
                                            form.setData(
                                                'expiration_date',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <InputError
                                        message={form.errors.expiration_date}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(e) =>
                                            form.setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        className="size-4 rounded border-input"
                                    />
                                    {t.active_label}
                                </label>
                                <InputError message={form.errors.is_active} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">{t.notes_label}</Label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    value={form.data.notes}
                                    onChange={(e) =>
                                        form.setData('notes', e.target.value)
                                    }
                                    className={TEXTAREA_CLASS}
                                />
                                <InputError message={form.errors.notes} />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleDelete}
                                    className="text-danger hover:bg-danger-soft hover:text-danger"
                                >
                                    {t.delete_action}
                                </Button>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={inventory.index.url({
                                                locale,
                                            })}
                                        >
                                            {t.cancel_label}
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="bg-olive-600 text-white hover:bg-olive-700"
                                    >
                                        {t.save_changes}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}
