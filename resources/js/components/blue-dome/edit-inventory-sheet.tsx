import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import inventory from '@/routes/inventory';

export type InventoryEditable = {
    id: string;
    item_name: string;
    category: string;
    item_code: string | null;
    min_stock_level: string | number | null;
    expiration_date: string | null;
    is_active: boolean;
    notes: string | null;
};

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

/**
 * Inline "edit inventory item" Sheet. Edits only the fields the update endpoint
 * accepts (UpdateInventoryRequest); stock levels are adjusted via transactions,
 * not here. Prefilled from the row; posts via PATCH and stays on the page.
 */
export function EditInventorySheet({
    children,
    item,
}: {
    children: ReactNode;
    item: InventoryEditable;
}) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();
    const [open, setOpen] = useState(false);

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
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Sheet
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (!next) {
                    form.reset();
                    form.clearErrors();
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.edit_inventory_item}</SheetTitle>
                    <SheetDescription>
                        {t.edit_inventory_item_desc}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="space-y-4 px-4 pb-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit_item_name">
                            {t.item_name_label}
                        </Label>
                        <input
                            id="edit_item_name"
                            value={form.data.item_name}
                            onChange={(e) =>
                                form.setData('item_name', e.target.value)
                            }
                            className={FIELD_CLASS}
                        />
                        <InputError message={form.errors.item_name} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_category">
                                {t.col_category}
                            </Label>
                            <select
                                id="edit_category"
                                value={form.data.category}
                                onChange={(e) =>
                                    form.setData('category', e.target.value)
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
                            <InputError message={form.errors.category} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_item_code">
                                {t.item_code_label}
                            </Label>
                            <input
                                id="edit_item_code"
                                value={form.data.item_code}
                                onChange={(e) =>
                                    form.setData('item_code', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.item_code} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_min_stock_level">
                                {t.min_level_value}
                            </Label>
                            <input
                                id="edit_min_stock_level"
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
                            <InputError message={form.errors.min_stock_level} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_expiration_date">
                                {t.expiration_date_label}
                            </Label>
                            <input
                                id="edit_expiration_date"
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
                            <InputError message={form.errors.expiration_date} />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(e) =>
                                form.setData('is_active', e.target.checked)
                            }
                            className="size-4 rounded border-input"
                        />
                        {t.active_label}
                    </label>
                    <InputError message={form.errors.is_active} />

                    <div className="grid gap-2">
                        <Label htmlFor="edit_notes">{t.notes_label}</Label>
                        <textarea
                            id="edit_notes"
                            rows={3}
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData('notes', e.target.value)
                            }
                            className={TEXTAREA_CLASS}
                        />
                        <InputError message={form.errors.notes} />
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="w-full bg-olive-600 text-white hover:bg-olive-700"
                    >
                        {t.save_changes}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
