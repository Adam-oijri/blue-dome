import { Head, Link, router } from '@inertiajs/react';
import { ChevronRight, FileDown, FileText, Plus, X } from 'lucide-react';

import { CreateMedicalRecordsSheet } from '@/components/blue-dome/create-medical-records-sheet';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
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
import medicalRecords from '@/routes/medical-records';

type Person = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code?: string | null;
} | null;

type Row = {
    id: string;
    record_date: string | null;
    record_type: string;
    title: string | null;
    is_signed: boolean;
    is_confidential: boolean;
    patient?: Person;
    author?: Person;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

const RECORD_TYPES = [
    'note',
    'progress',
    'lab_result',
    'imaging',
    'procedure',
    'vaccination',
    'surgery',
    'discharge_summary',
    'referral',
    'other',
];

function personName(p?: Person): string {
    return p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';
}

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

type PatientOption = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code: string | null;
};

export default function MedicalRecordsIndex({
    records,
    patients,
    filters,
}: {
    records: Paginated<Row>;
    patients: PatientOption[];
    filters: { patient_id: string | null; record_type: string | null };
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const setType = (record_type: string): void => {
        router.get(
            medicalRecords.index.url({ locale }),
            {
                record_type: record_type || undefined,
                patient_id: filters.patient_id || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t.consultations} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.consultations}
                    description={`${records.total} ${t.consultations.toLowerCase()}`}
                    actions={
                        <CreateMedicalRecordsSheet patients={patients}>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                {t.new_record}
                            </Button>
                        </CreateMedicalRecordsSheet>
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
                                router.get(medicalRecords.index.url({ locale }))
                            }
                        >
                            <X className="size-3.5" />
                            {t.clear_label}
                        </Button>
                    </div>
                )}

                <SectionCard
                    titleIcon={<FileText className="size-4" />}
                    title={t.consultations}
                    actions={
                        <select
                            value={filters.record_type ?? ''}
                            onChange={(e) => setType(e.target.value)}
                            className={selectClass}
                        >
                            <option value="">{t.all_types}</option>
                            {RECORD_TYPES.map((rt) => (
                                <option key={rt} value={rt}>
                                    {enumLabel(t.record_type_opts, rt)}
                                </option>
                            ))}
                        </select>
                    }
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.record_title_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.patients}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.type_label}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_date}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.record_author}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_status}
                                </TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_records}
                                    </TableCell>
                                </TableRow>
                            )}
                            {records.data.map((r) => (
                                <TableRow
                                    key={r.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <Link
                                            href={medicalRecords.show.url({
                                                locale,
                                                medical_record: r.id,
                                            })}
                                            className="text-[13px] font-medium"
                                        >
                                            {r.title ||
                                                enumLabel(
                                                    t.record_type_opts,
                                                    r.record_type,
                                                )}
                                            {r.is_confidential && (
                                                <StatusPill
                                                    tone="danger"
                                                    className="ms-2 text-[10px]"
                                                >
                                                    {t.confidential_label}
                                                </StatusPill>
                                            )}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {personName(r.patient)}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {enumLabel(
                                            t.record_type_opts,
                                            r.record_type,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {r.record_date
                                            ?.slice(0, 16)
                                            .replace('T', ' ') ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {personName(r.author)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                r.is_signed
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                            withDot
                                        >
                                            {r.is_signed
                                                ? t.signed_label
                                                : t.unsigned_label}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={medicalRecords.pdf.url({
                                                    locale,
                                                    medical_record: r.id,
                                                })}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={t.export_pdf}
                                                aria-label={t.export_pdf}
                                            >
                                                <FileDown className="size-3.5 text-muted-foreground hover:text-foreground" />
                                            </a>
                                            <Link
                                                href={medicalRecords.show.url({
                                                    locale,
                                                    medical_record: r.id,
                                                })}
                                            >
                                                <ChevronRight className="size-3.5 text-muted-foreground" />
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={records} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
