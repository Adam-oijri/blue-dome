import { Head, Link, router } from '@inertiajs/react';
import { ChevronRight, Pill, Plus, X } from 'lucide-react';

import { CreatePrescriptionsSheet } from '@/components/blue-dome/create-prescriptions-sheet';
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
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
import prescriptions from '@/routes/prescriptions';

type Person = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code?: string | null;
} | null;

type Row = {
    id: string;
    prescription_number: string | null;
    prescription_date: string | null;
    expiry_date: string | null;
    status: string;
    patient?: Person;
    doctor?: Person;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Option = { id: string; [k: string]: unknown };

const STATUS_TONE: Record<string, StatusTone> = {
    draft: 'neutral',
    active: 'success',
    completed: 'info',
    discontinued: 'warning',
    cancelled: 'danger',
    expired: 'neutral',
};

function personName(p?: Person): string {
    return p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';
}

export default function PrescriptionsIndex({
    prescriptions: paginated,
    filters,
    patients,
    medicationSuggestions,
}: {
    prescriptions: Paginated<Row>;
    filters: { patient_id: string | null };
    patients: Option[];
    medicationSuggestions: string[];
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={t.prescriptions} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.prescriptions}
                    description={`${paginated.total} ${t.prescriptions.toLowerCase()}`}
                    actions={
                        <CreatePrescriptionsSheet
                            patients={patients}
                            medicationSuggestions={medicationSuggestions}
                        >
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                {t.new_rx}
                            </Button>
                        </CreatePrescriptionsSheet>
                    }
                />

                {filters.patient_id && (
                    <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-[13px]">
                        <span className="text-muted-foreground">
                            {t.filtered_by_patient}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ms-auto h-7 gap-1.5"
                            onClick={() =>
                                router.get(prescriptions.index.url({ locale }))
                            }
                        >
                            <X className="size-3.5" />
                            {t.clear_label}
                        </Button>
                    </div>
                )}

                <SectionCard
                    titleIcon={<Pill className="size-4" />}
                    title={t.prescriptions}
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.prescription_label}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.patients}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.doctor_label}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.issued}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.expires_label}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_status}
                                </TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_prescriptions}
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginated.data.map((rx) => (
                                <TableRow
                                    key={rx.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <Link
                                            href={prescriptions.show.url({
                                                locale,
                                                prescription: rx.id,
                                            })}
                                        >
                                            <div className="text-[12px] font-medium tabular-nums">
                                                {rx.prescription_number ?? '—'}
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        <div className="font-medium">
                                            {personName(rx.patient)}
                                        </div>
                                        {rx.patient?.patient_code && (
                                            <div className="font-mono text-[11px] text-muted-foreground">
                                                {rx.patient.patient_code}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {personName(rx.doctor)}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {rx.prescription_date?.slice(0, 10) ??
                                            '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {rx.expiry_date?.slice(0, 10) ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                STATUS_TONE[rx.status] ??
                                                'neutral'
                                            }
                                            withDot
                                        >
                                            {enumLabel(
                                                t.prescription_status_opts,
                                                rx.status,
                                            )}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={prescriptions.show.url({
                                                locale,
                                                prescription: rx.id,
                                            })}
                                        >
                                            <ChevronRight className="size-3.5 text-muted-foreground" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={paginated} t={{}} />
                </SectionCard>
            </div>
        </>
    );
}
