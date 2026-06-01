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
import { useLocale } from '@/lib/i18n/use-locale';
import inventory from '@/routes/inventory';

type MedicationOption = { id: string; [k: string]: unknown };
type VendorOption = { id: string; [k: string]: unknown };

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

/** Best-effort human label for an option, falling back to the id. */
function optionLabel(option: { id: string; [k: string]: unknown }): string {
    const named = option.name ?? option.brand_name ?? option.generic_name;

    return typeof named === 'string' && named.trim() !== '' ? named : option.id;
}

/**
 * Inline "add inventory item" Sheet. The widest single form in the suite, so
 * the body scrolls while the submit button stays pinned at the bottom. Drop it
 * anywhere and pass the trigger as `children`; the host page supplies the
 * `medications` and `vendors` option lists.
 */
export function CreateInventorySheet({
    children,
    medications,
    vendors,
}: {
    children: ReactNode;
    medications: MedicationOption[];
    vendors: VendorOption[];
}) {
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm({
        item_name: '',
        category: 'medication',
        item_code: '',
        medication_id: '',
        supplier_id: '',
        batch_number: '',
        serial_number: '',
        expiration_date: '',
        quantity_in_stock: '',
        min_stock_level: '',
        reorder_point: '',
        unit: '',
        purchase_price: '',
        selling_price: '',
        location_in_clinic: '',
        requires_refrigeration: false,
        is_active: true,
        notes: '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(inventory.store.url({ locale }), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
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
            <SheetContent className="flex w-full flex-col sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Add inventory item</SheetTitle>
                    <SheetDescription>
                        Track stock, pricing, and storage for a clinic item.
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="item_name">Item name</Label>
                            <input
                                id="item_name"
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
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    value={form.data.category}
                                    onChange={(e) =>
                                        form.setData('category', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                >
                                    {CATEGORY_OPTIONS.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.category} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="item_code">Item code</Label>
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
                                <InputError message={form.errors.item_code} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="medication_id">
                                    Medication
                                </Label>
                                <select
                                    id="medication_id"
                                    value={form.data.medication_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'medication_id',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                >
                                    <option value="">None</option>
                                    {medications.map((medication) => (
                                        <option
                                            key={medication.id}
                                            value={medication.id}
                                        >
                                            {optionLabel(medication)}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={form.errors.medication_id}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="supplier_id">Supplier</Label>
                                <select
                                    id="supplier_id"
                                    value={form.data.supplier_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'supplier_id',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                >
                                    <option value="">None</option>
                                    {vendors.map((vendor) => (
                                        <option
                                            key={vendor.id}
                                            value={vendor.id}
                                        >
                                            {optionLabel(vendor)}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.supplier_id} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="batch_number">
                                    Batch number
                                </Label>
                                <input
                                    id="batch_number"
                                    value={form.data.batch_number}
                                    onChange={(e) =>
                                        form.setData(
                                            'batch_number',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.batch_number}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="serial_number">
                                    Serial number
                                </Label>
                                <input
                                    id="serial_number"
                                    value={form.data.serial_number}
                                    onChange={(e) =>
                                        form.setData(
                                            'serial_number',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.serial_number}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="expiration_date">
                                Expiration date
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
                            <InputError message={form.errors.expiration_date} />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="quantity_in_stock">
                                    Qty in stock
                                </Label>
                                <input
                                    id="quantity_in_stock"
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={form.data.quantity_in_stock}
                                    onChange={(e) =>
                                        form.setData(
                                            'quantity_in_stock',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.quantity_in_stock}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="min_stock_level">
                                    Min level
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
                                <Label htmlFor="reorder_point">
                                    Reorder pt
                                </Label>
                                <input
                                    id="reorder_point"
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={form.data.reorder_point}
                                    onChange={(e) =>
                                        form.setData(
                                            'reorder_point',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.reorder_point}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="unit">Unit</Label>
                                <input
                                    id="unit"
                                    value={form.data.unit}
                                    onChange={(e) =>
                                        form.setData('unit', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.unit} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="purchase_price">
                                    Purchase price
                                </Label>
                                <input
                                    id="purchase_price"
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={form.data.purchase_price}
                                    onChange={(e) =>
                                        form.setData(
                                            'purchase_price',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.purchase_price}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="selling_price">
                                    Selling price
                                </Label>
                                <input
                                    id="selling_price"
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={form.data.selling_price}
                                    onChange={(e) =>
                                        form.setData(
                                            'selling_price',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.selling_price}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location_in_clinic">
                                Location in clinic
                            </Label>
                            <input
                                id="location_in_clinic"
                                value={form.data.location_in_clinic}
                                onChange={(e) =>
                                    form.setData(
                                        'location_in_clinic',
                                        e.target.value,
                                    )
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError
                                message={form.errors.location_in_clinic}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.requires_refrigeration}
                                    onChange={(e) =>
                                        form.setData(
                                            'requires_refrigeration',
                                            e.target.checked,
                                        )
                                    }
                                    className="size-4 rounded border-input"
                                />
                                Requires refrigeration
                            </label>
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
                                Active
                            </label>
                        </div>
                        <InputError
                            message={form.errors.requires_refrigeration}
                        />
                        <InputError message={form.errors.is_active} />

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
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
                    </div>

                    <div className="border-t px-4 py-4">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                        >
                            Add item
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
