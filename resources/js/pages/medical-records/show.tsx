import { Head, Link } from '@inertiajs/react';
import { Check, ChevronLeft, Edit3, FileText, ShieldAlert } from 'lucide-react';

import { EditMedicalRecordsSheet } from '@/components/blue-dome/edit-medical-records-sheet';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { FieldChangeEntry } from '@/components/provenance-panel';
import { ProvenancePanel } from '@/components/provenance-panel';
import { Button } from '@/components/ui/button';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import medicalRecords from '@/routes/medical-records';

type Person = {
    first_name: string | null;
    last_name: string | null;
} | null;

type Record = {
    id: string;
    record_date: string | null;
    record_type: string;
    title: string | null;
    is_signed: boolean;
    is_confidential: boolean;
    signed_at: string | null;
    patient?: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        patient_code: string | null;
    } | null;
    author?: Person;
    signer?: Person;
    clinic?: { id: string; name: string } | null;
};

type Clinical = {
    content: string | null;
    subjective: string | null;
    objective: string | null;
    assessment: string | null;
    plan: string | null;
};

function personName(p?: Person): string {
    return p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';
}

function ClinicalBlock({
    label,
    value,
}: {
    label: string;
    value: string | null;
}) {
    if (!value) {
        return null;
    }

    return (
        <div>
            <h3 className="mb-1 text-sm font-semibold">{label}</h3>
            <p className="text-[13px] whitespace-pre-wrap text-muted-foreground">
                {value}
            </p>
        </div>
    );
}

export default function MedicalRecordShow({
    record,
    clinical,
    provenance,
}: {
    record: Record;
    clinical: Clinical;
    provenance?: FieldChangeEntry[];
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const heading =
        record.title || enumLabel(t.record_type_opts, record.record_type);
    const hasClinical =
        clinical.content ||
        clinical.subjective ||
        clinical.objective ||
        clinical.assessment ||
        clinical.plan;

    return (
        <>
            <Head title={heading} />

            <div className="px-8 py-6 lg:px-10">
                <div className="mb-4 flex items-center gap-3 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1.5"
                    >
                        <Link href={medicalRecords.index.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            {t.consultations}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-medium">{heading}</span>
                </div>

                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-[20px] font-semibold">
                                {heading}
                            </h1>
                            <StatusPill
                                tone={record.is_signed ? 'success' : 'warning'}
                                withDot
                            >
                                {record.is_signed
                                    ? t.signed_label
                                    : t.unsigned_label}
                            </StatusPill>
                            {record.is_confidential && (
                                <StatusPill tone="danger">
                                    <ShieldAlert className="size-3" />
                                    {t.confidential_label}
                                </StatusPill>
                            )}
                        </div>
                        <div className="mt-2 grid gap-1 text-[13px] text-muted-foreground">
                            <span className="capitalize">
                                {enumLabel(
                                    t.record_type_opts,
                                    record.record_type,
                                )}{' '}
                                ·{' '}
                                {record.record_date
                                    ?.slice(0, 16)
                                    .replace('T', ' ') ?? '—'}
                            </span>
                            <span>
                                {t.patients}: {personName(record.patient)}
                                {record.patient?.patient_code
                                    ? ` · ${record.patient.patient_code}`
                                    : ''}
                            </span>
                            <span>
                                {t.record_author}: {personName(record.author)}
                                {record.is_signed && record.signer
                                    ? ` · ${t.signed_by} ${personName(record.signer)}`
                                    : ''}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!record.is_signed && (
                            <EditMedicalRecordsSheet
                                record={record}
                                clinical={clinical}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Edit3 className="size-3.5" />
                                    {t.edit}
                                </Button>
                            </EditMedicalRecordsSheet>
                        )}
                        {!record.is_signed && (
                            <Button
                                size="sm"
                                asChild
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Link
                                    href={medicalRecords.sign.url({
                                        locale,
                                        medical_record: record.id,
                                    })}
                                    method="post"
                                    as="button"
                                    onBefore={() => confirm(t.sign_confirm)}
                                >
                                    <Check className="size-3.5" />
                                    {t.sign_label}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <SectionCard
                    titleIcon={<FileText className="size-4" />}
                    title={t.clinical_notes}
                    bodyClassName="space-y-4 p-5"
                >
                    {hasClinical ? (
                        <>
                            <ClinicalBlock
                                label={t.subjective_label}
                                value={clinical.subjective}
                            />
                            <ClinicalBlock
                                label={t.objective_label}
                                value={clinical.objective}
                            />
                            <ClinicalBlock
                                label={t.assessment_label}
                                value={clinical.assessment}
                            />
                            <ClinicalBlock
                                label={t.plan_label}
                                value={clinical.plan}
                            />
                            <ClinicalBlock
                                label={t.notes_field}
                                value={clinical.content}
                            />
                        </>
                    ) : (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            {t.no_clinical_content}
                        </p>
                    )}
                </SectionCard>

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
