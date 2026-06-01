import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Edit3, Pill } from 'lucide-react';

import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import type { FieldChangeEntry } from '@/components/provenance-panel';
import { ProvenancePanel } from '@/components/provenance-panel';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import prescriptions from '@/routes/prescriptions';

type Medication = {
    id: string;
    trade_name: string | null;
    generic_name: string | null;
    strength: string | null;
    form: string | null;
} | null;

type Item = {
    id: string;
    medication?: Medication;
    medication_name?: string | null;
    dosage: string | null;
    frequency_per_day: number | null;
    interval_hours: number | null;
    frequency_text: string | null;
    duration_days: number | null;
    route: string | null;
    instructions: string | null;
    quantity: number | null;
    unit: string | null;
    refills: number | null;
};

type Prescription = {
    id: string;
    prescription_number: string | null;
    prescription_date: string | null;
    expiry_date: string | null;
    status: string;
    diagnosis_related: string | null;
    notes: string | null;
    patient?: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        patient_code: string | null;
    } | null;
    doctor?: {
        id: string;
        first_name: string | null;
        last_name: string | null;
    } | null;
    clinic?: { id: string; name: string } | null;
    items: Item[];
};

const STATUS_TONE: Record<string, StatusTone> = {
    draft: 'neutral',
    active: 'success',
    completed: 'info',
    discontinued: 'warning',
    cancelled: 'danger',
    expired: 'neutral',
};

function frequencyLabel(item: Item): string {
    if (item.frequency_text) {
        return item.frequency_text;
    }

    if (item.frequency_per_day) {
        return `${item.frequency_per_day}×/day`;
    }

    if (item.interval_hours) {
        return `every ${item.interval_hours}h`;
    }

    return '—';
}

function medicationLabel(m?: Medication): string {
    if (!m) {
        return '—';
    }

    return [m.trade_name, m.strength].filter(Boolean).join(' ') || '—';
}

export default function PrescriptionShow({
    prescription,
    provenance,
}: {
    prescription: Prescription;
    provenance?: FieldChangeEntry[];
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const patientName =
        `${prescription.patient?.first_name ?? ''} ${prescription.patient?.last_name ?? ''}`.trim() ||
        '—';
    const doctorName =
        `${prescription.doctor?.first_name ?? ''} ${prescription.doctor?.last_name ?? ''}`.trim() ||
        '—';

    return (
        <>
            <Head title={prescription.prescription_number ?? t.prescriptions} />

            <div className="px-8 py-6 lg:px-10">
                <div className="mb-4 flex items-center gap-3 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1.5"
                    >
                        <Link href={prescriptions.index.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            {t.prescriptions}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-medium tabular-nums">
                        {prescription.prescription_number ?? '—'}
                    </span>
                </div>

                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-[20px] font-semibold tabular-nums">
                                {prescription.prescription_number ?? '—'}
                            </h1>
                            <StatusPill
                                tone={
                                    STATUS_TONE[prescription.status] ??
                                    'neutral'
                                }
                                withDot
                            >
                                {prescription.status}
                            </StatusPill>
                        </div>
                        <div className="mt-2 grid gap-1 text-[13px] text-muted-foreground">
                            <span>
                                {t.patients}: {patientName}
                                {prescription.patient?.patient_code
                                    ? ` · ${prescription.patient.patient_code}`
                                    : ''}
                            </span>
                            <span>Doctor: {doctorName}</span>
                            <span>
                                Issued{' '}
                                {prescription.prescription_date?.slice(0, 10) ??
                                    '—'}
                                {prescription.expiry_date
                                    ? ` · Expires ${prescription.expiry_date.slice(0, 10)}`
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
                            href={prescriptions.edit.url({
                                locale,
                                prescription: prescription.id,
                            })}
                        >
                            <Edit3 className="size-3.5" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <SectionCard
                    titleIcon={<Pill className="size-4" />}
                    title="Medications"
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.medication}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.dosage}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.frequency}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.duration}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Route
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Qty
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prescription.items.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center text-sm text-muted-foreground"
                                    >
                                        No medications on this prescription.
                                    </TableCell>
                                </TableRow>
                            )}
                            {prescription.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="px-5 py-3">
                                        <div className="text-[13px] font-medium">
                                            {item.medication
                                                ? medicationLabel(
                                                      item.medication,
                                                  )
                                                : (item.medication_name ?? '—')}
                                        </div>
                                        {item.medication?.generic_name && (
                                            <div className="text-[11px] text-muted-foreground">
                                                {item.medication.generic_name}
                                                {item.medication.form
                                                    ? ` · ${item.medication.form}`
                                                    : ''}
                                            </div>
                                        )}
                                        {item.instructions && (
                                            <div className="mt-0.5 text-[11px] text-muted-foreground italic">
                                                {item.instructions}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {item.dosage ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {frequencyLabel(item)}
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {item.duration_days
                                            ? `${item.duration_days} days`
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {item.route ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[13px] tabular-nums">
                                        {item.quantity != null
                                            ? `${item.quantity}${item.unit ? ` ${item.unit}` : ''}`
                                            : '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </SectionCard>

                {(prescription.diagnosis_related || prescription.notes) && (
                    <SectionCard className="mt-5" bodyClassName="space-y-4 p-5">
                        {prescription.diagnosis_related && (
                            <div>
                                <h3 className="mb-1 text-sm font-semibold">
                                    Diagnosis
                                </h3>
                                <p className="text-[13px] text-muted-foreground">
                                    {prescription.diagnosis_related}
                                </p>
                            </div>
                        )}
                        {prescription.notes && (
                            <div>
                                <h3 className="mb-1 text-sm font-semibold">
                                    Notes
                                </h3>
                                <p className="text-[13px] text-muted-foreground">
                                    {prescription.notes}
                                </p>
                            </div>
                        )}
                    </SectionCard>
                )}

                <div className="mt-5">
                    <ProvenancePanel
                        deferredKey="provenance"
                        entries={provenance}
                    />
                </div>
            </div>
        </>
    );
}
