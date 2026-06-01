import { Form, Head, Link, router } from '@inertiajs/react';

import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import {
    StatusPill
    
} from '@/components/blue-dome/status-pill';
import type {StatusTone} from '@/components/blue-dome/status-pill';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import expenses from '@/routes/expenses';

type ExpenseData = {
    id: string;
    expense_number: string | null;
    expense_date: string | null;
    category: string;
    description: string | null;
    amount: string | number | null;
    currency: string | null;
    payment_method: string | null;
    payment_status: string;
    paid_date: string | null;
    paid_to: string | null;
    vendor_id: string | null;
};

interface Props {
    expense: ExpenseData;
}

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

const PAYMENT_STATUS_TONES: Record<string, StatusTone> = {
    paid: 'success',
    pending: 'warning',
    cancelled: 'danger',
};

function toDateInputValue(value: string | null): string {
    return value ? value.slice(0, 10) : '';
}

export default function ExpenseEdit({ expense }: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const handleDelete = (): void => {
        if (!window.confirm(t.delete_expense_confirm)) {
            return;
        }

        router.delete(
            expenses.destroy.url({ locale, expense: expense.id }),
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={`${t.edit_expense}${expense.expense_number ? ` · ${expense.expense_number}` : ''}`} />

            <div className="mx-auto w-full max-w-3xl p-6">
                <PageHeader
                    title={t.edit_expense}
                    description={
                        expense.expense_number
                            ? expense.expense_number
                            : t.update_expense_desc
                    }
                    actions={
                        <>
                            <StatusPill
                                tone={
                                    PAYMENT_STATUS_TONES[
                                        expense.payment_status
                                    ] ?? 'neutral'
                                }
                                withDot
                            >
                                {enumLabel(t.payment_status_opts, expense.payment_status)}
                            </StatusPill>
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={expenses.show.url({
                                        locale,
                                        expense: expense.id,
                                    })}
                                >
                                    {t.back}
                                </Link>
                            </Button>
                        </>
                    }
                />

                <SectionCard title={t.expense_details}>
                    <Form
                        {...ExpenseController.update.form({
                            locale,
                            expense: expense.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="space-y-5"
                    >
                        {({
                            processing,
                            errors,
                        }: {
                            processing: boolean;
                            errors: Record<string, string>;
                        }) => (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="expense_date">
                                            {t.col_date}
                                        </Label>
                                        <input
                                            id="expense_date"
                                            name="expense_date"
                                            type="date"
                                            defaultValue={toDateInputValue(
                                                expense.expense_date,
                                            )}
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={errors.expense_date}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="category">
                                            {t.col_category}
                                        </Label>
                                        <select
                                            id="category"
                                            name="category"
                                            defaultValue={expense.category}
                                            className={FIELD_CLASS}
                                        >
                                            {CATEGORY_OPTIONS.map(
                                                ([value]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {enumLabel(t.expense_category_opts, value)}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <InputError
                                            message={errors.category}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">
                                            {t.col_amount}
                                            {expense.currency
                                                ? ` (${expense.currency})`
                                                : ''}
                                        </Label>
                                        <input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            defaultValue={
                                                expense.amount != null
                                                    ? String(expense.amount)
                                                    : ''
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError message={errors.amount} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="payment_status">
                                            {t.payment_status_label}
                                        </Label>
                                        <select
                                            id="payment_status"
                                            name="payment_status"
                                            defaultValue={
                                                expense.payment_status
                                            }
                                            className={FIELD_CLASS}
                                        >
                                            {PAYMENT_STATUS_OPTIONS.map(
                                                ([value]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {enumLabel(t.payment_status_opts, value)}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <InputError
                                            message={errors.payment_status}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="paid_date">
                                            {t.paid_date}
                                        </Label>
                                        <input
                                            id="paid_date"
                                            name="paid_date"
                                            type="date"
                                            defaultValue={toDateInputValue(
                                                expense.paid_date,
                                            )}
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={errors.paid_date}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="paid_to">{t.paid_to}</Label>
                                        <input
                                            id="paid_to"
                                            name="paid_to"
                                            type="text"
                                            defaultValue={expense.paid_to ?? ''}
                                            className={FIELD_CLASS}
                                        />
                                        <InputError message={errors.paid_to} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        {t.col_description}
                                    </Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        defaultValue={expense.description ?? ''}
                                        className={TEXTAREA_CLASS}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete}
                                        className="text-danger hover:text-danger"
                                    >
                                        {t.delete_action}
                                    </Button>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={expenses.show.url({
                                                    locale,
                                                    expense: expense.id,
                                                })}
                                            >
                                                {t.back}
                                            </Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-olive-600 text-white hover:bg-olive-700"
                                        >
                                            {t.save_changes}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
