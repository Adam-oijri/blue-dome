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
import expenses from '@/routes/expenses';

type VendorOption = {
    id: string;
    [key: string]: unknown;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const CATEGORY_OPTIONS: ReadonlyArray<readonly [string, string]> = [
    ['rent', 'Rent'],
    ['utilities', 'Utilities'],
    ['salaries', 'Salaries'],
    ['supplies', 'Supplies'],
    ['equipment', 'Equipment'],
    ['maintenance', 'Maintenance'],
    ['marketing', 'Marketing'],
    ['insurance', 'Insurance'],
    ['taxes', 'Taxes'],
    ['licenses', 'Licenses'],
    ['training', 'Training'],
    ['travel', 'Travel'],
    ['miscellaneous', 'Miscellaneous'],
];

const PAYMENT_STATUS_OPTIONS: ReadonlyArray<readonly [string, string]> = [
    ['pending', 'Pending'],
    ['paid', 'Paid'],
    ['cancelled', 'Cancelled'],
];

const RECURRING_FREQUENCY_OPTIONS: ReadonlyArray<readonly [string, string]> = [
    ['daily', 'Daily'],
    ['weekly', 'Weekly'],
    ['monthly', 'Monthly'],
    ['quarterly', 'Quarterly'],
    ['yearly', 'Yearly'],
];

function vendorLabel(vendor: VendorOption): string {
    const name = vendor.vendor_name ?? vendor.name;

    return typeof name === 'string' && name.trim() !== '' ? name : vendor.id;
}

/**
 * Inline "record expense" Sheet. The host page supplies the clinic's vendors as
 * the `vendors` option prop. Drop it anywhere and pass the trigger as
 * `children`.
 */
export function CreateExpensesSheet({
    children,
    vendors,
}: {
    children: ReactNode;
    vendors: Array<{ id: string; [key: string]: unknown }>;
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm({
        expense_date: '',
        category: 'supplies',
        amount: '',
        payment_method: '',
        payment_status: 'pending',
        paid_to: '',
        vendor_id: '',
        is_recurring: false,
        recurring_frequency: 'monthly',
        recurring_end_date: '',
        description: '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(expenses.store.url({ locale }), {
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
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.new_expense}</SheetTitle>
                    <SheetDescription>
                        Log a clinic expense. Categorize it and optionally link
                        a vendor.
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="expense_date">{t.col_date}</Label>
                            <input
                                id="expense_date"
                                type="date"
                                value={form.data.expense_date}
                                onChange={(e) =>
                                    form.setData('expense_date', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.expense_date} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="category">
                                    {t.col_category}
                                </Label>
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
                                <Label htmlFor="amount">{t.col_amount}</Label>
                                <input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.data.amount}
                                    onChange={(e) =>
                                        form.setData('amount', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.amount} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="payment_method">
                                    {t.col_method}
                                </Label>
                                <input
                                    id="payment_method"
                                    type="text"
                                    value={form.data.payment_method}
                                    onChange={(e) =>
                                        form.setData(
                                            'payment_method',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.payment_method}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="payment_status">
                                    Payment status
                                </Label>
                                <select
                                    id="payment_status"
                                    value={form.data.payment_status}
                                    onChange={(e) =>
                                        form.setData(
                                            'payment_status',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                >
                                    {PAYMENT_STATUS_OPTIONS.map(
                                        ([value]) => (
                                            <option key={value} value={value}>
                                                {enumLabel(
                                                    t.payment_status_opts,
                                                    value,
                                                )}
                                            </option>
                                        ),
                                    )}
                                </select>
                                <InputError
                                    message={form.errors.payment_status}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paid_to">Paid to</Label>
                            <input
                                id="paid_to"
                                type="text"
                                value={form.data.paid_to}
                                onChange={(e) =>
                                    form.setData('paid_to', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.paid_to} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="vendor_id">{t.col_vendor}</Label>
                            <select
                                id="vendor_id"
                                value={form.data.vendor_id}
                                onChange={(e) =>
                                    form.setData('vendor_id', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                <option value="">No vendor</option>
                                {vendors.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>
                                        {vendorLabel(vendor)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.vendor_id} />
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="is_recurring"
                                className="flex items-center gap-2 text-sm"
                            >
                                <input
                                    id="is_recurring"
                                    type="checkbox"
                                    checked={form.data.is_recurring}
                                    onChange={(e) =>
                                        form.setData(
                                            'is_recurring',
                                            e.target.checked,
                                        )
                                    }
                                    className="size-4 rounded border-input"
                                />
                                Recurring expense
                            </label>
                            <InputError message={form.errors.is_recurring} />
                        </div>

                        {form.data.is_recurring && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="recurring_frequency">
                                        {t.frequency}
                                    </Label>
                                    <select
                                        id="recurring_frequency"
                                        value={form.data.recurring_frequency}
                                        onChange={(e) =>
                                            form.setData(
                                                'recurring_frequency',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    >
                                        {RECURRING_FREQUENCY_OPTIONS.map(
                                            ([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <InputError
                                        message={
                                            form.errors.recurring_frequency
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="recurring_end_date">
                                        End date
                                    </Label>
                                    <input
                                        id="recurring_end_date"
                                        type="date"
                                        value={form.data.recurring_end_date}
                                        onChange={(e) =>
                                            form.setData(
                                                'recurring_end_date',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <InputError
                                        message={form.errors.recurring_end_date}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                {t.col_description}
                            </Label>
                            <textarea
                                id="description"
                                rows={3}
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.description} />
                        </div>
                    </div>

                    <div className="border-t px-4 py-4">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                        >
                            {t.new_expense}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
