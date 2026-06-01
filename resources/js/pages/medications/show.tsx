import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Edit3, Pill, Trash2 } from 'lucide-react';

import { EditMedicationsSheet } from '@/components/blue-dome/edit-medications-sheet';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import medications from '@/routes/medications';

type Medication = {
    id: string;
    trade_name: string | null;
    generic_name: string | null;
    form: string | null;
    strength: string | null;
    manufacturer: string | null;
    category: string | null;
    atc_code: string | null;
    is_active: boolean;
    requires_prescription: boolean;
    side_effects: string | null;
    contraindications: string | null;
    storage_instructions: string | null;
};

interface Props {
    medication: Medication;
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: string | null;
}) {
    return (
        <div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase sm:w-1/3">
                {label}
            </dt>
            <dd className="text-[13px] sm:flex-1 sm:text-end">
                {value && value.trim() !== '' ? (
                    value
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </dd>
        </div>
    );
}

function ProseCard({ title, body }: { title: string; body: string | null }) {
    return (
        <SectionCard title={title}>
            {body && body.trim() !== '' ? (
                <p className="text-[13px] leading-relaxed whitespace-pre-line text-foreground">
                    {body}
                </p>
            ) : (
                <p className="text-[13px] text-muted-foreground">—</p>
            )}
        </SectionCard>
    );
}

export default function MedicationShow({ medication }: Props) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();

    const destroy = (): void => {
        if (
            !window.confirm(
                `Delete "${medication.trade_name ?? 'this medication'}"? It can be restored from the recycle bin.`,
            )
        ) {
            return;
        }

        router.delete(
            medications.destroy.url({ locale, medication: medication.id }),
            { preserveScroll: true },
        );
    };

    const heading = medication.trade_name ?? medication.generic_name ?? '—';

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
                        <Link href={medications.index.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            {t.formulary}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-medium">{heading}</span>
                </div>

                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-olive-100 text-olive-700">
                                <Pill className="size-4.5" />
                            </span>
                            <h1 className="text-[20px] font-semibold">
                                {heading}
                            </h1>
                            <StatusPill
                                tone={
                                    medication.is_active ? 'success' : 'neutral'
                                }
                                withDot
                            >
                                {medication.is_active
                                    ? t.active_label
                                    : t.inactive_label}
                            </StatusPill>
                            <StatusPill
                                tone={
                                    medication.requires_prescription
                                        ? 'warning'
                                        : 'info'
                                }
                            >
                                {medication.requires_prescription
                                    ? 'Rx'
                                    : 'OTC'}
                            </StatusPill>
                        </div>
                        {medication.generic_name && (
                            <p className="mt-2 ms-12 text-[13px] text-muted-foreground">
                                {medication.generic_name}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <EditMedicationsSheet medication={medication}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Edit3 className="size-3.5" />
                                {t.edit_medication}
                            </Button>
                        </EditMedicationsSheet>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={destroy}
                            className="gap-2 text-danger hover:text-danger"
                        >
                            <Trash2 className="size-3.5" />
                            {t.delete_action}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <SectionCard title={t.details_label} bodyClassName="px-5 py-2">
                        <dl>
                            <DetailRow
                                label={t.strength}
                                value={medication.strength}
                            />
                            <DetailRow
                                label={t.form_label}
                                value={medication.form}
                            />
                            <DetailRow
                                label={t.manufacturer}
                                value={medication.manufacturer}
                            />
                            <DetailRow
                                label={t.col_category}
                                value={medication.category}
                            />
                            <DetailRow
                                label={t.atc_code}
                                value={medication.atc_code}
                            />
                            <DetailRow
                                label={t.requires_prescription}
                                value={
                                    medication.requires_prescription
                                        ? t.yes
                                        : t.no_label
                                }
                            />
                            <DetailRow
                                label={t.col_status}
                                value={
                                    medication.is_active
                                        ? t.active_label
                                        : t.inactive_label
                                }
                            />
                        </dl>
                    </SectionCard>

                    <div className="grid gap-5">
                        <ProseCard
                            title={t.side_effects}
                            body={medication.side_effects}
                        />
                        <ProseCard
                            title={t.contraindications}
                            body={medication.contraindications}
                        />
                        <ProseCard
                            title={t.storage_instructions}
                            body={medication.storage_instructions}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
