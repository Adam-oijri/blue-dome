import { Head } from '@inertiajs/react';
import { Plus, Wallet } from 'lucide-react';

import { CreateExpensesSheet } from '@/components/blue-dome/create-expenses-sheet';
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
import { Pagination } from '@/pages/panels/super-admin/users';

type VendorOption = {
    id: string;
    vendor_name?: string | null;
    [key: string]: unknown;
};

type ExpenseRow = {
    id: string;
    expense_number: string | null;
    expense_date: string | null;
    category: string | null;
    amount: string | number;
    currency: string | null;
    payment_status: string | null;
    vendor?: { id: string; vendor_name: string | null } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

const STATUS: Record<string, StatusTone> = {
    paid: 'success',
    pending: 'warning',
    overdue: 'danger',
    cancelled: 'neutral',
};

function money(value: string | number, currency: string | null): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;

    return `${(Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    })} ${currency ?? 'MAD'}`;
}

function humanize(value: string | null): string {
    return value ? value.replace(/_/g, ' ') : '—';
}

export default function ExpensesIndex({
    expenses,
    vendors,
}: {
    expenses: Paginated<ExpenseRow>;
    vendors: VendorOption[];
    filters: { category: string | null };
}) {
    const { t } = useDoctorLang();

    return (
        <>
            <Head title={t.expenses} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.expenses}
                    description={`${expenses.total} ${t.expenses}`}
                    actions={
                        <CreateExpensesSheet vendors={vendors}>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                {t.new_expense}
                            </Button>
                        </CreateExpensesSheet>
                    }
                />

                <SectionCard
                    title={t.all_expenses}
                    titleIcon={<Wallet className="size-4" />}
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.expense_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_date}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_category}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_vendor}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_amount}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_status}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_expenses}
                                    </TableCell>
                                </TableRow>
                            )}
                            {expenses.data.map((e) => (
                                <TableRow key={e.id} className="hover:bg-muted/50">
                                    <TableCell className="px-5 py-3 text-[12px] font-medium tabular-nums">
                                        {e.expense_number ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {e.expense_date?.slice(0, 10) ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {humanize(e.category)}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {e.vendor?.vendor_name ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[13px] font-semibold tabular-nums">
                                        {money(e.amount, e.currency)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                STATUS[e.payment_status ?? ''] ??
                                                'neutral'
                                            }
                                        >
                                            {enumLabel(
                                                t.payment_status_opts,
                                                e.payment_status,
                                            )}
                                        </StatusPill>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={expenses} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
