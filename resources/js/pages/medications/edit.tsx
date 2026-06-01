import { Head, Link, router, useForm } from '@inertiajs/react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import medications from '@/routes/medications';

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

type MedicationData = {
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
    medication: MedicationData;
}

export default function MedicationEdit({ medication }: Props) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();

    const form = useForm({
        trade_name: medication.trade_name ?? '',
        generic_name: medication.generic_name ?? '',
        form: medication.form ?? '',
        strength: medication.strength ?? '',
        manufacturer: medication.manufacturer ?? '',
        category: medication.category ?? '',
        atc_code: medication.atc_code ?? '',
        requires_prescription: medication.requires_prescription ? '1' : '0',
        is_active: medication.is_active ? '1' : '0',
        side_effects: medication.side_effects ?? '',
        contraindications: medication.contraindications ?? '',
        storage_instructions: medication.storage_instructions ?? '',
    });

    const yesNoOptions: ReadonlyArray<readonly [string, string]> = [
        ['1', t.yes],
        ['0', t.no_label],
    ];

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.patch(
            medications.update.url({ locale, medication: medication.id }),
            { preserveScroll: true },
        );
    };

    const handleDelete = (): void => {
        if (!window.confirm(t.delete_medication_confirm)) {
            return;
        }

        router.delete(
            medications.destroy.url({ locale, medication: medication.id }),
            { preserveScroll: true },
        );
    };

    const headerTitle = medication.trade_name || t.edit_medication;

    return (
        <>
            <Head title={t.edit_medication} />

            <div className="mx-auto w-full max-w-3xl p-6">
                <PageHeader
                    title={headerTitle}
                    description={
                        <span className="flex flex-wrap items-center gap-2">
                            <span>{t.edit_medication}</span>
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
                            {medication.requires_prescription && (
                                <StatusPill tone="info">
                                    {t.requires_prescription}
                                </StatusPill>
                            )}
                        </span>
                    }
                    actions={
                        <Button variant="outline" asChild>
                            <Link
                                href={medications.index.url({ locale })}
                                prefetch
                            >
                                {t.back}
                            </Link>
                        </Button>
                    }
                />

                <form onSubmit={submit} className="space-y-6">
                    <SectionCard title={t.edit_medication}>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="trade_name">
                                    {t.trade_name}
                                </Label>
                                <input
                                    id="trade_name"
                                    value={form.data.trade_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'trade_name',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.trade_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="generic_name">
                                    {t.generic_name}
                                </Label>
                                <input
                                    id="generic_name"
                                    value={form.data.generic_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'generic_name',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.generic_name}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="form">{t.form_label}</Label>
                                    <input
                                        id="form"
                                        value={form.data.form}
                                        onChange={(e) =>
                                            form.setData('form', e.target.value)
                                        }
                                        placeholder={t.eg_tablet}
                                        className={FIELD_CLASS}
                                    />
                                    <InputError message={form.errors.form} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="strength">
                                        {t.strength}
                                    </Label>
                                    <input
                                        id="strength"
                                        value={form.data.strength}
                                        onChange={(e) =>
                                            form.setData(
                                                'strength',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <InputError message={form.errors.strength} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="manufacturer">
                                        {t.manufacturer}
                                    </Label>
                                    <input
                                        id="manufacturer"
                                        value={form.data.manufacturer}
                                        onChange={(e) =>
                                            form.setData(
                                                'manufacturer',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <InputError
                                        message={form.errors.manufacturer}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">
                                        {t.col_category}
                                    </Label>
                                    <input
                                        id="category"
                                        value={form.data.category}
                                        onChange={(e) =>
                                            form.setData(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <InputError message={form.errors.category} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="atc_code">{t.atc_code}</Label>
                                    <input
                                        id="atc_code"
                                        value={form.data.atc_code}
                                        onChange={(e) =>
                                            form.setData(
                                                'atc_code',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <InputError message={form.errors.atc_code} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="requires_prescription">
                                        {t.requires_prescription}
                                    </Label>
                                    <select
                                        id="requires_prescription"
                                        value={form.data.requires_prescription}
                                        onChange={(e) =>
                                            form.setData(
                                                'requires_prescription',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    >
                                        {yesNoOptions.map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={
                                            form.errors.requires_prescription
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="is_active">
                                    {t.active_label}
                                </Label>
                                <select
                                    id="is_active"
                                    value={form.data.is_active}
                                    onChange={(e) =>
                                        form.setData('is_active', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                >
                                    {yesNoOptions.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.is_active} />
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title={t.clinical_details}>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="side_effects">
                                    {t.side_effects}
                                </Label>
                                <textarea
                                    id="side_effects"
                                    rows={3}
                                    value={form.data.side_effects}
                                    onChange={(e) =>
                                        form.setData(
                                            'side_effects',
                                            e.target.value,
                                        )
                                    }
                                    className={TEXTAREA_CLASS}
                                />
                                <InputError
                                    message={form.errors.side_effects}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contraindications">
                                    {t.contraindications}
                                </Label>
                                <textarea
                                    id="contraindications"
                                    rows={3}
                                    value={form.data.contraindications}
                                    onChange={(e) =>
                                        form.setData(
                                            'contraindications',
                                            e.target.value,
                                        )
                                    }
                                    className={TEXTAREA_CLASS}
                                />
                                <InputError
                                    message={form.errors.contraindications}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="storage_instructions">
                                    {t.storage_instructions}
                                </Label>
                                <textarea
                                    id="storage_instructions"
                                    rows={3}
                                    value={form.data.storage_instructions}
                                    onChange={(e) =>
                                        form.setData(
                                            'storage_instructions',
                                            e.target.value,
                                        )
                                    }
                                    className={TEXTAREA_CLASS}
                                />
                                <InputError
                                    message={form.errors.storage_instructions}
                                />
                            </div>
                        </div>
                    </SectionCard>

                    <div className="flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDelete}
                            className="border-danger/40 text-danger hover:bg-danger-soft"
                        >
                            {t.delete_action}
                        </Button>

                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-olive-600 text-white hover:bg-olive-700"
                        >
                            {t.save_changes}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
