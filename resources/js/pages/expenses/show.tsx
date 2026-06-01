import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit3, FileText, Receipt, Repeat, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import expenses from '@/routes/expenses';

type Money = string | number;

type Vendor = {
    id: string;
    vendor_name: string | null;
} | null;

type CreatedBy = {
    id: string;
    first_name: string | null;
    last_name: string | null;
} | null;

type Expense = {
    id: string;
    expense_number: string | null;
    expense_date: string | null;
    category: string | null;
    amount: Money;
    currency: string | null;
    payment_method: string | null;
    payment_status: string;
    paid_date: string | null;
    paid_to: string | null;
    description: string | null;
    is_recurring: boolean | null;
    recurring_frequency: string | null;
    vendor?: Vendor;
    created_by?: CreatedBy;
};

const STATUS_TONE: Record<string, StatusTone> = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger',
    refunded: 'info',
    partially_refunded: 'info',
};

function num(value: Money | null): number {
    const n = typeof value === 'string' ? parseFloat(value) : (value ?? 0);

    return Number.isFinite(n) ? n : 0;
}

function money(value: Money | null, currency: string | null): string {
    return `${num(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency ?? 'MAD'}`;
}

function personName(person?: CreatedBy): string {
    return person
        ? `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim() || '—'
        : '—';
}

export default function ExpenseShow({ expense }: { expense: Expense }) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const statusTone = STATUS_TONE[expense.payment_status] ?? 'neutral';

    function handleDelete() {
        if (!window.confirm(t.delete_expense_confirm)) {
            return;
        }

        router.delete(
            expenses.destroy.url({ locale, expense: expense.id }),
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head title={expense.expense_number ?? t.expense_label} />

            <div className="px-8 py-6 lg:px-10">
                <Link
                    href={expenses.index.url({ locale })}
                    className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    {t.expenses}
                </Link>

                <PageHeader
                    title={expense.expense_number ?? t.expense_label}
                    description={`${enumLabel(t.expense_category_opts, expense.category)} · ${expense.expense_date?.slice(0, 10) ?? '—'}`}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusPill tone={statusTone} withDot>
                                {enumLabel(t.payment_status_opts, expense.payment_status)}
                            </StatusPill>
                            {expense.is_recurring && (
                                <StatusPill tone="info">
                                    <Repeat className="size-3" />
                                    {enumLabel(t.recurring_frequency_opts, expense.recurring_frequency)}
                                </StatusPill>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="gap-2"
                            >
                                <Link
                                    href={expenses.edit.url({
                                        locale,
                                        expense: expense.id,
                                    })}
                                >
                                    <Edit3 className="size-3.5" />
                                    {t.edit}
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="gap-2 text-danger hover:text-danger"
                            >
                                <Trash2 className="size-3.5" />
                                {t.delete_action}
                            </Button>
                        </div>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <SummaryStat
                        label={t.col_amount}
                        value={money(expense.amount, expense.currency)}
                        emphasize
                    />
                    <SummaryStat
                        label={t.col_category}
                        value={enumLabel(t.expense_category_opts, expense.category)}
                    />
                    <SummaryStat
                        label={t.col_vendor}
                        value={expense.vendor?.vendor_name ?? expense.paid_to ?? '—'}
                    />
                    <SummaryStat
                        label={t.col_method}
                        value={enumLabel(t.payment_method_opts, expense.payment_method)}
                    />
                </div>

                <SectionCard
                    title={t.details_label}
                    titleIcon={<Receipt className="size-4" />}
                    className="mb-5"
                >
                    <dl className="grid gap-x-8 gap-y-4 text-[13px] sm:grid-cols-2 lg:grid-cols-3">
                        <DetailRow
                            label={t.col_date}
                            value={expense.expense_date?.slice(0, 10) ?? '—'}
                        />
                        <DetailRow
                            label={t.paid_label}
                            value={expense.paid_date?.slice(0, 10) ?? '—'}
                        />
                        <DetailRow
                            label={t.col_status}
                            value={enumLabel(t.payment_status_opts, expense.payment_status)}
                        />
                        <DetailRow
                            label={t.paid_to}
                            value={
                                expense.vendor?.vendor_name ??
                                expense.paid_to ??
                                '—'
                            }
                        />
                        <DetailRow
                            label={t.recurring_label}
                            value={
                                expense.is_recurring
                                    ? enumLabel(t.recurring_frequency_opts, expense.recurring_frequency)
                                    : t.no_label
                            }
                        />
                        <DetailRow
                            label={t.recorded_by}
                            value={personName(expense.created_by)}
                        />
                    </dl>
                </SectionCard>

                {expense.description && (
                    <SectionCard
                        title={t.col_description}
                        titleIcon={<FileText className="size-4" />}
                    >
                        <p className="text-[13px] leading-relaxed whitespace-pre-line text-foreground">
                            {expense.description}
                        </p>
                    </SectionCard>
                )}
            </div>
        </>
    );
}

function SummaryStat({
    label,
    value,
    emphasize = false,
}: {
    label: string;
    value: string;
    emphasize?: boolean;
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-[11px] tracking-wider text-muted-foreground uppercase">
                {label}
            </div>
            <div
                className={`mt-1 text-[18px] font-semibold tabular-nums ${emphasize ? 'text-foreground' : ''}`}
            >
                {value}
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-[11px] tracking-wider text-muted-foreground uppercase">
                {label}
            </dt>
            <dd className="mt-1 font-medium text-foreground">{value}</dd>
        </div>
    );
}
