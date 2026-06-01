import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import MedicalRecordController from '@/actions/App/Http/Controllers/MedicalRecordController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import medicalRecords from '@/routes/medical-records';

type PatientOption = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code: string | null;
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

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';
const textareaClass =
    'min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

function patientLabel(p: PatientOption): string {
    const name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—';

    return p.patient_code ? `${name} · ${p.patient_code}` : name;
}

export default function MedicalRecordCreate({
    patients,
}: {
    patients: PatientOption[];
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title="New record" />

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
                    <span className="text-[13px] font-medium">New record</span>
                </div>

                <PageHeader
                    title="New medical record"
                    description={t.consultations}
                />

                <SectionCard className="mt-6">
                    <Form
                        {...MedicalRecordController.store.form({ locale })}
                        options={{ preserveScroll: true }}
                        className="space-y-6 p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="patient_id">
                                            {t.patients}
                                        </Label>
                                        <select
                                            id="patient_id"
                                            name="patient_id"
                                            defaultValue=""
                                            required
                                            className={selectClass}
                                        >
                                            <option value="" disabled>
                                                Select a patient…
                                            </option>
                                            {patients.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {patientLabel(p)}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.patient_id}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="record_type">
                                            Type
                                        </Label>
                                        <select
                                            id="record_type"
                                            name="record_type"
                                            defaultValue="note"
                                            className={selectClass}
                                        >
                                            {RECORD_TYPES.map((rt) => (
                                                <option key={rt} value={rt}>
                                                    {rt.replace(/_/g, ' ')}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.record_type}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input id="title" name="title" />
                                        <InputError message={errors.title} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="record_date">
                                            Date
                                        </Label>
                                        <Input
                                            id="record_date"
                                            name="record_date"
                                            type="datetime-local"
                                        />
                                        <InputError
                                            message={errors.record_date}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="is_confidential">
                                            Confidential
                                        </Label>
                                        <select
                                            id="is_confidential"
                                            name="is_confidential"
                                            defaultValue="0"
                                            className={selectClass}
                                        >
                                            <option value="0">No</option>
                                            <option value="1">Yes</option>
                                        </select>
                                        <InputError
                                            message={errors.is_confidential}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="subjective">
                                        Subjective
                                    </Label>
                                    <textarea
                                        id="subjective"
                                        name="subjective"
                                        rows={3}
                                        className={textareaClass}
                                    />
                                    <InputError message={errors.subjective} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="objective">Objective</Label>
                                    <textarea
                                        id="objective"
                                        name="objective"
                                        rows={3}
                                        className={textareaClass}
                                    />
                                    <InputError message={errors.objective} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="assessment">
                                        Assessment
                                    </Label>
                                    <textarea
                                        id="assessment"
                                        name="assessment"
                                        rows={3}
                                        className={textareaClass}
                                    />
                                    <InputError message={errors.assessment} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="plan">Plan</Label>
                                    <textarea
                                        id="plan"
                                        name="plan"
                                        rows={3}
                                        className={textareaClass}
                                    />
                                    <InputError message={errors.plan} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="content">Notes</Label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        rows={3}
                                        className={textareaClass}
                                    />
                                    <InputError message={errors.content} />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-olive-600 text-white hover:bg-olive-700"
                                >
                                    {processing && <Spinner />}
                                    Create record
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
