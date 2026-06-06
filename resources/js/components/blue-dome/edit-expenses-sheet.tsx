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

export type ExpenseEditable = {
    id: string;
    expense_date: string | null;
    category: string | null;
    amount: string | number | null;
    payment_status: string;
    paid_date: string | null;
    paid_to: string | null;
    description: string | null;
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

/**
 * Inline "edit expense" Sheet. Mirrors the recorded clinic expense onto the
 * fields the update endpoint accepts (no payment_method or recurring fields);
 * prefilled from the row, posts via PATCH and stays on the page.
 */
export function EditExpensesSheet({
    children,
    expense,
}: {
    children: ReactNode;
    expense: ExpenseEditable;
}) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();
    const [open, setOpen] = useState(false);

    const form = useForm({
        expense_date: expense.expense_date
            ? String(expense.expense_date).slice(0, 10)
            : '',
        category: expense.category ?? 'supplies',
        amount:
            expense.amount === null || expense.amount === undefined
                ? ''
                : String(expense.amount),
        payment_status: expense.payment_status ?? 'pending',
        paid_date: expense.paid_date
            ? String(expense.paid_date).slice(0, 10)
            : '',
        paid_to: expense.paid_to ?? '',
        description: expense.description ?? '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.patch(expenses.update.url({ locale, expense: expense.id }), {
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
                    <SheetTitle>{t.edit_expense}</SheetTitle>
                    <SheetDescription>{t.update_expense_desc}</SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="space-y-4 px-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_expense_date">
                                {t.col_date}
                            </Label>
                            <input
                                id="edit_expense_date"
                                type="date"
                                value={form.data.expense_date}
                                onChange={(e) =>
                                    form.setData('expense_date', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.expense_date} />
                        </div>
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
                                            t.expense_category_opts,
                                            value,
                                        )}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.category} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_amount">{t.col_amount}</Label>
                            <input
                                id="edit_amount"
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
                        <div className="grid gap-2">
                            <Label htmlFor="edit_payment_status">
                                {t.payment_status_label}
                            </Label>
                            <select
                                id="edit_payment_status"
                                value={form.data.payment_status}
                                onChange={(e) =>
                                    form.setData(
                                        'payment_status',
                                        e.target.value,
                                    )
                                }
                                className={FIELD_CLASS}
                            >
                                {PAYMENT_STATUS_OPTIONS.map(([value]) => (
                                    <option key={value} value={value}>
                                        {enumLabel(
                                            t.payment_status_opts,
                                            value,
                                        )}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.payment_status} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_paid_date">
                                {t.paid_date}
                            </Label>
                            <input
                                id="edit_paid_date"
                                type="date"
                                value={form.data.paid_date}
                                onChange={(e) =>
                                    form.setData('paid_date', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.paid_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_paid_to">{t.paid_to}</Label>
                            <input
                                id="edit_paid_to"
                                type="text"
                                value={form.data.paid_to}
                                onChange={(e) =>
                                    form.setData('paid_to', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.paid_to} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit_description">
                            {t.col_description}
                        </Label>
                        <textarea
                            id="edit_description"
                            rows={3}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            className={TEXTAREA_CLASS}
                        />
                        <InputError message={form.errors.description} />
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
