import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import PrescriptionController from '@/actions/App/Http/Controllers/PrescriptionController';
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

type Item = {
    id: string;
    dosage: string | null;
    medication?: {
        trade_name: string | null;
        strength: string | null;
    } | null;
};

type Prescription = {
    id: string;
    prescription_number: string | null;
    prescription_date: string | null;
    expiry_date: string | null;
    status: string;
    diagnosis_related: string | null;
    notes: string | null;
    items: Item[];
};

const STATUSES = [
    'draft',
    'active',
    'completed',
    'discontinued',
    'cancelled',
    'expired',
];

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function PrescriptionEdit({
    prescription,
}: {
    prescription: Prescription;
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head
                title={`${t.edit} ${prescription.prescription_number ?? t.prescriptions}`}
            />

            <div className="px-8 py-6 lg:px-10">
                <div className="mb-4 flex items-center gap-3 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1.5"
                    >
                        <Link
                            href={prescriptions.show.url({
                                locale,
                                prescription: prescription.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            {prescription.prescription_number ??
                                t.prescriptions}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-medium">{t.edit}</span>
                </div>

                <PageHeader
                    title={t.edit_prescription}
                    description={t.edit_prescription_desc}
                />

                <SectionCard className="mt-6">
                    <Form
                        {...PrescriptionController.update.form({
                            locale,
                            prescription: prescription.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="space-y-6 p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">
                                            {t.col_status}
                                        </Label>
                                        <select
                                            id="status"
                                            name="status"
                                            defaultValue={prescription.status}
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
                                        <InputError message={errors.status} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="prescription_date">
                                            {t.issued}
                                        </Label>
                                        <Input
                                            id="prescription_date"
                                            name="prescription_date"
                                            type="date"
                                            defaultValue={
                                                prescription.prescription_date?.slice(
                                                    0,
                                                    10,
                                                ) ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.prescription_date}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="expiry_date">
                                            {t.expires_label}
                                        </Label>
                                        <Input
                                            id="expiry_date"
                                            name="expiry_date"
                                            type="date"
                                            defaultValue={
                                                prescription.expiry_date?.slice(
                                                    0,
                                                    10,
                                                ) ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.expiry_date}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="diagnosis_related">
                                        {t.diagnosis_label}
                                    </Label>
                                    <Input
                                        id="diagnosis_related"
                                        name="diagnosis_related"
                                        defaultValue={
                                            prescription.diagnosis_related ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.diagnosis_related}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">
                                        {t.notes_label}
                                    </Label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        defaultValue={prescription.notes ?? ''}
                                        className="min-h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                {prescription.items.length > 0 && (
                                    <div className="rounded-lg border border-border bg-muted/40 p-4">
                                        <div className="mb-2 text-[11px] tracking-wider text-muted-foreground uppercase">
                                            {t.rx_meds_locked} {t.read_only}
                                        </div>
                                        <ul className="space-y-1 text-[13px]">
                                            {prescription.items.map((item) => (
                                                <li key={item.id}>
                                                    {[
                                                        item.medication
                                                            ?.trade_name,
                                                        item.medication
                                                            ?.strength,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ') || '—'}
                                                    {item.dosage
                                                        ? ` · ${item.dosage}`
                                                        : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-olive-600 text-white hover:bg-olive-700"
                                >
                                    {processing && <Spinner />}
                                    {t.save_changes}
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
