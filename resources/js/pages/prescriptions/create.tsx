import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Plus, X } from 'lucide-react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import prescriptions from '@/routes/prescriptions';

type PatientOption = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code: string | null;
};

type MedicationOption = {
    id: string;
    trade_name: string | null;
    generic_name: string | null;
    strength: string | null;
    form: string | null;
};

type ItemForm = {
    medication_id: string;
    dosage: string;
    frequency_text: string;
    duration_days: string;
    route: string;
    quantity: string;
};

const ROUTES = [
    'oral',
    'topical',
    'intravenous',
    'intramuscular',
    'subcutaneous',
    'sublingual',
    'rectal',
    'inhalation',
    'ophthalmic',
    'otic',
];

const STATUSES = ['draft', 'active', 'completed', 'discontinued', 'cancelled'];

const inputClass =
    'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';
const selectClass = inputClass;

function emptyItem(): ItemForm {
    return {
        medication_id: '',
        dosage: '',
        frequency_text: '',
        duration_days: '',
        route: 'oral',
        quantity: '',
    };
}

function patientLabel(p: PatientOption): string {
    const name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—';

    return p.patient_code ? `${name} · ${p.patient_code}` : name;
}

function medicationLabel(m: MedicationOption): string {
    return [m.trade_name, m.strength].filter(Boolean).join(' ') || '—';
}

export default function PrescriptionCreate({
    patients,
    medications,
}: {
    patients: PatientOption[];
    medications: MedicationOption[];
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const { data, setData, post, processing, errors } = useForm<{
        patient_id: string;
        prescription_date: string;
        expiry_date: string;
        status: string;
        diagnosis_related: string;
        notes: string;
        items: ItemForm[];
    }>({
        patient_id: '',
        prescription_date: '',
        expiry_date: '',
        status: 'active',
        diagnosis_related: '',
        notes: '',
        items: [emptyItem()],
    });

    const err = errors as Record<string, string | undefined>;

    const updateItem = (i: number, patch: Partial<ItemForm>): void => {
        setData(
            'items',
            data.items.map((item, idx) =>
                idx === i ? { ...item, ...patch } : item,
            ),
        );
    };

    const addItem = (): void => setData('items', [...data.items, emptyItem()]);

    const removeItem = (i: number): void =>
        setData(
            'items',
            data.items.filter((_, idx) => idx !== i),
        );

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        post(prescriptions.store.url({ locale }));
    };

    return (
        <>
            <Head title={t.new_rx} />

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
                    <span className="text-[13px] font-medium">{t.new_rx}</span>
                </div>

                <PageHeader title={t.new_rx} description={t.prescriptions} />

                <form onSubmit={submit} className="mt-6 space-y-5">
                    <SectionCard bodyClassName="grid gap-5 p-6 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="patient_id">{t.patients}</Label>
                            <select
                                id="patient_id"
                                value={data.patient_id}
                                onChange={(e) =>
                                    setData('patient_id', e.target.value)
                                }
                                required
                                className={selectClass}
                            >
                                <option value="" disabled>
                                    {t.select_patient_ph}
                                </option>
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {patientLabel(p)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={err.patient_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">{t.col_status}</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) =>
                                    setData('status', e.target.value)
                                }
                                className={selectClass}
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {enumLabel(
                                            t.prescription_status_opts,
                                            s,
                                        )}
                                    </option>
                                ))}
                            </select>
                            <InputError message={err.status} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prescription_date">
                                {t.issued}
                            </Label>
                            <Input
                                id="prescription_date"
                                type="date"
                                value={data.prescription_date}
                                onChange={(e) =>
                                    setData('prescription_date', e.target.value)
                                }
                            />
                            <InputError message={err.prescription_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="expiry_date">
                                {t.expires_label}
                            </Label>
                            <Input
                                id="expiry_date"
                                type="date"
                                value={data.expiry_date}
                                onChange={(e) =>
                                    setData('expiry_date', e.target.value)
                                }
                            />
                            <InputError message={err.expiry_date} />
                        </div>
                    </SectionCard>

                    <SectionCard
                        title={t.medication}
                        bodyClassName="space-y-3 p-5"
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={addItem}
                            >
                                <Plus className="size-3.5" />
                                {t.add_label}
                            </Button>
                        }
                    >
                        {err.items && (
                            <p className="text-[13px] text-danger">
                                {err.items}
                            </p>
                        )}
                        {data.items.map((item, i) => (
                            <div
                                key={i}
                                className="rounded-lg border border-border p-3"
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-1.5 sm:col-span-2">
                                        <Label htmlFor={`med-${i}`}>
                                            {t.medication}
                                        </Label>
                                        <select
                                            id={`med-${i}`}
                                            value={item.medication_id}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    medication_id:
                                                        e.target.value,
                                                })
                                            }
                                            required
                                            className={selectClass}
                                        >
                                            <option value="" disabled>
                                                {t.select_medication_ph}
                                            </option>
                                            {medications.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {medicationLabel(m)}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={
                                                err[`items.${i}.medication_id`]
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`dose-${i}`}>
                                            {t.dosage}
                                        </Label>
                                        <Input
                                            id={`dose-${i}`}
                                            value={item.dosage}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    dosage: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        <InputError
                                            message={err[`items.${i}.dosage`]}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`freq-${i}`}>
                                            {t.frequency}
                                        </Label>
                                        <Input
                                            id={`freq-${i}`}
                                            value={item.frequency_text}
                                            placeholder={t.freq_twice_daily_ph}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    frequency_text:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`dur-${i}`}>
                                            {t.duration} ({t.days_label})
                                        </Label>
                                        <Input
                                            id={`dur-${i}`}
                                            type="number"
                                            min={1}
                                            value={item.duration_days}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    duration_days:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`route-${i}`}>
                                            {t.route_label}
                                        </Label>
                                        <select
                                            id={`route-${i}`}
                                            value={item.route}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    route: e.target.value,
                                                })
                                            }
                                            className={selectClass}
                                        >
                                            {ROUTES.map((r) => (
                                                <option key={r} value={r}>
                                                    {enumLabel(t.route_opts, r)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {data.items.length > 1 && (
                                    <div className="mt-2 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1.5 text-danger"
                                            onClick={() => removeItem(i)}
                                        >
                                            <X className="size-3.5" />
                                            {t.remove_label}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </SectionCard>

                    <SectionCard bodyClassName="space-y-4 p-5">
                        <div className="grid gap-2">
                            <Label htmlFor="diagnosis_related">
                                {t.diagnosis_label}
                            </Label>
                            <Input
                                id="diagnosis_related"
                                value={data.diagnosis_related}
                                onChange={(e) =>
                                    setData('diagnosis_related', e.target.value)
                                }
                            />
                            <InputError message={err.diagnosis_related} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">{t.notes_label}</Label>
                            <textarea
                                id="notes"
                                rows={3}
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                className="min-h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                            <InputError message={err.notes} />
                        </div>
                    </SectionCard>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-olive-600 text-white hover:bg-olive-700"
                    >
                        {processing && <Spinner />}
                        {t.issue_prescription}
                    </Button>
                </form>
            </div>
        </>
    );
}
