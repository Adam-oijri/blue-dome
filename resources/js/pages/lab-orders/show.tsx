import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Edit3, FlaskConical } from 'lucide-react';

import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { ProvenancePanel } from '@/components/provenance-panel';
import type { FieldChangeEntry } from '@/components/provenance-panel';
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
import documents from '@/routes/documents';
import labOrders from '@/routes/lab-orders';

type LabImage = {
    id: string;
    document_name: string | null;
    file_name: string | null;
    mime_type: string | null;
    file_size: number | null;
    uploaded_at: string | null;
};

type LabItem = {
    id: string;
    test_name: string | null;
    test_code: string | null;
    test_category: string | null;
    specimen_type: string | null;
    normal_range: string | null;
    unit: string | null;
    result: string | null;
    result_status: string | null;
};

type Person = {
    first_name: string | null;
    last_name: string | null;
    patient_code?: string | null;
} | null;

type LabOrder = {
    id: string;
    lab_order_number: string | null;
    order_date: string | null;
    status: string;
    urgency: string | null;
    fasting_required: boolean | null;
    clinical_diagnosis: string | null;
    notes: string | null;
    patient?: Person;
    doctor?: Person;
    external_lab?: { lab_name: string | null } | null;
    items: LabItem[];
};

interface Props {
    lab_order: LabOrder;
    images: LabImage[];
    provenance?: FieldChangeEntry[];
}

const STATUS_TONE: Record<string, StatusTone> = {
    draft: 'neutral',
    pending: 'warning',
    sample_collected: 'info',
    in_progress: 'olive',
    completed: 'success',
    partially_completed: 'warning',
    cancelled: 'danger',
    rejected: 'danger',
};

function personName(person: Person): string {
    return (
        `${person?.first_name ?? ''} ${person?.last_name ?? ''}`.trim() || '—'
    );
}

export default function LabOrderShow({ lab_order, images, provenance }: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={lab_order.lab_order_number ?? t.lab_order_label} />

            <div className="px-8 py-6 lg:px-10">
                <div className="mb-4 flex items-center gap-3 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1.5"
                    >
                        <Link href={labOrders.index.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            {t.lab_orders}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-medium tabular-nums">
                        {lab_order.lab_order_number ?? '—'}
                    </span>
                </div>

                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-[20px] font-semibold tabular-nums">
                                {lab_order.lab_order_number ?? '—'}
                            </h1>
                            <StatusPill
                                tone={STATUS_TONE[lab_order.status] ?? 'neutral'}
                                withDot
                            >
                                {enumLabel(t.lab_status_opts, lab_order.status)}
                            </StatusPill>
                            {lab_order.urgency && lab_order.urgency !== 'routine' && (
                                <StatusPill tone="warning">
                                    {enumLabel(
                                        t.urgency_opts,
                                        lab_order.urgency,
                                    )}
                                </StatusPill>
                            )}
                        </div>
                        <div className="mt-2 grid gap-1 text-[13px] text-muted-foreground">
                            <span>
                                {t.col_patient}:{' '}
                                {personName(lab_order.patient ?? null)}
                                {lab_order.patient?.patient_code
                                    ? ` · ${lab_order.patient.patient_code}`
                                    : ''}
                            </span>
                            <span>
                                {t.doctor_label}:{' '}
                                {personName(lab_order.doctor ?? null)}
                            </span>
                            <span>
                                {t.ordered_label}{' '}
                                {lab_order.order_date?.slice(0, 10) ?? '—'}
                                {lab_order.fasting_required
                                    ? ` · ${t.fasting_required}`
                                    : ''}
                                {lab_order.external_lab?.lab_name
                                    ? ` · ${lab_order.external_lab.lab_name}`
                                    : ''}
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                    >
                        <Link
                            href={labOrders.edit.url({
                                locale,
                                lab_order: lab_order.id,
                            })}
                        >
                            <Edit3 className="size-3.5" />
                            {t.edit}
                        </Link>
                    </Button>
                </div>

                {(lab_order.clinical_diagnosis || lab_order.notes) && (
                    <div className="mb-5 grid gap-3 text-[13px] sm:grid-cols-2">
                        {lab_order.clinical_diagnosis && (
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                    {t.clinical_diagnosis}
                                </div>
                                {lab_order.clinical_diagnosis}
                            </div>
                        )}
                        {lab_order.notes && (
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                    {t.notes_label}
                                </div>
                                {lab_order.notes}
                            </div>
                        )}
                    </div>
                )}

                <SectionCard
                    titleIcon={<FlaskConical className="size-4" />}
                    title="Tests"
                    bodyClassName="p-0"
                    className="mb-5"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.test_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_category}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.specimen_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.normal_range_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.result_col}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lab_order.items.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_tests_on_order}
                                    </TableCell>
                                </TableRow>
                            )}
                            {lab_order.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="px-5 py-3 text-[13px] font-medium">
                                        {item.test_name ?? '—'}
                                        {item.test_code ? (
                                            <span className="ms-1 text-[11px] text-muted-foreground">
                                                {item.test_code}
                                            </span>
                                        ) : null}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {item.test_category ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {item.specimen_type ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {item.normal_range ?? '—'}
                                        {item.unit ? ` ${item.unit}` : ''}
                                    </TableCell>
                                    <TableCell className="text-[12px]">
                                        {item.result ?? (
                                            <span className="text-muted-foreground">
                                                {t.pending}
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </SectionCard>

                <SectionCard
                    title={`${t.images_label} (${images.length})`}
                    className="mb-5"
                >
                    {images.length === 0 ? (
                        <p className="text-[13px] text-muted-foreground">
                            {t.no_images}
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {images.map((image) => {
                                const href = documents.download.url({
                                    locale,
                                    document: image.id,
                                });

                                return (
                                    <a
                                        key={image.id}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group block overflow-hidden rounded-lg border border-border"
                                        title={
                                            image.file_name ??
                                            image.document_name ??
                                            'Lab image'
                                        }
                                    >
                                        <img
                                            src={href}
                                            alt={
                                                image.document_name ??
                                                'Lab image'
                                            }
                                            className="aspect-square w-full object-cover transition group-hover:opacity-90"
                                        />
                                        <span className="block truncate px-2 py-1 text-[11px] text-muted-foreground">
                                            {image.file_name ??
                                                image.document_name}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </SectionCard>

                <ProvenancePanel deferredKey="provenance" entries={provenance} />
            </div>
        </>
    );
}
