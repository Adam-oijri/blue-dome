import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react';

import { CreateClinicInvoicesSheet } from '@/components/blue-dome/create-clinic-invoices-sheet';
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
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
import superAdmin from '@/routes/super-admin';

type Invoice = {
    id: string;
    invoice_number: string | null;
    patient?: { first_name: string | null; last_name: string | null } | null;
    invoice_date: string | null;
    currency: string | null;
    total: number | string;
    paid_amount: number | string;
    status: string;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

const STATUS_TONE: Record<string, StatusTone> = {
    paid: 'success',
    partially_paid: 'olive',
    pending: 'warning',
    overdue: 'danger',
    cancelled: 'neutral',
    refunded: 'neutral',
    draft: 'neutral',
};

export default function SuperAdminClinicInvoices({
    clinic,
    invoices,
    patients,
}: {
    clinic: { id: string; name: string };
    invoices: Paginated<Invoice>;
    patients: Array<{ id: string; [k: string]: unknown }>;
}) {
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={`Invoices — ${clinic.name}`} />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link
                            href={superAdmin.clinics.show.url({
                                locale,
                                clinic: clinic.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            {clinic.name}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">Invoices</span>
                </div>

                <PageHeader
                    title="Invoices"
                    description={`${invoices.total} invoices at ${clinic.name}`}
                    actions={
                        <CreateClinicInvoicesSheet
                            clinicId={clinic.id}
                            patients={patients}
                        >
                            <Button
                                size="sm"
                                className="gap-2 bg-navy-900 text-white hover:bg-navy-800"
                            >
                                <Plus className="size-3.5" />
                                New invoice
                            </Button>
                        </CreateClinicInvoicesSheet>
                    }
                />

                <SectionCard bodyClassName="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    Invoice
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Patient
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    Total
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    Paid
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Status
                                </TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        No invoices.
                                    </TableCell>
                                </TableRow>
                            )}
                            {invoices.data.map((inv) => (
                                <TableRow
                                    key={inv.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <Link
                                            href={superAdmin.clinics.invoices.show.url(
                                                {
                                                    locale,
                                                    clinic: clinic.id,
                                                    invoice: inv.id,
                                                },
                                            )}
                                            className="font-mono text-[12px] font-semibold hover:underline"
                                        >
                                            {inv.invoice_number ??
                                                inv.id.slice(0, 8)}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {inv.patient
                                            ? `${inv.patient.first_name ?? ''} ${inv.patient.last_name ?? ''}`.trim()
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-end text-[13px] tabular-nums">
                                        {inv.total} {inv.currency ?? ''}
                                    </TableCell>
                                    <TableCell className="text-end text-[13px] tabular-nums">
                                        {inv.paid_amount}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                STATUS_TONE[inv.status] ??
                                                'neutral'
                                            }
                                            withDot
                                        >
                                            {inv.status.replace('_', ' ')}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="size-7 p-0"
                                                title="Edit"
                                            >
                                                <Link
                                                    href={superAdmin.clinics.invoices.edit.url(
                                                        {
                                                            locale,
                                                            clinic: clinic.id,
                                                            invoice: inv.id,
                                                        },
                                                    )}
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="size-7 p-0 text-danger"
                                                title="Delete"
                                            >
                                                <Link
                                                    href={superAdmin.clinics.invoices.destroy.url(
                                                        {
                                                            locale,
                                                            clinic: clinic.id,
                                                            invoice: inv.id,
                                                        },
                                                    )}
                                                    method="delete"
                                                    as="button"
                                                    onBefore={() =>
                                                        confirm(
                                                            'Delete this invoice?',
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={invoices} t={{}} />
                </SectionCard>
            </div>
        </>
    );
}
