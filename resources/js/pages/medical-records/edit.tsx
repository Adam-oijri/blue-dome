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
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import medicalRecords from '@/routes/medical-records';

type Record = {
    id: string;
    record_date: string | null;
    record_type: string;
    title: string | null;
    is_confidential: boolean;
};

type Clinical = {
    content: string | null;
    subjective: string | null;
    objective: string | null;
    assessment: string | null;
    plan: string | null;
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

export default function MedicalRecordEdit({
    record,
    clinical,
}: {
    record: Record;
    clinical: Clinical;
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const heading =
        record.title || enumLabel(t.record_type_opts, record.record_type);

    return (
        <>
            <Head title={`${t.edit_record} · ${heading}`} />

            <div className="px-8 py-6 lg:px-10">
                <div className="mb-4 flex items-center gap-3 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1.5"
                    >
                        <Link
                            href={medicalRecords.show.url({
                                locale,
                                medical_record: record.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            {heading}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-medium">{t.edit}</span>
                </div>

                <PageHeader
                    title={t.edit_record}
                    description={t.consultations}
                />

                <SectionCard className="mt-6">
                    <Form
                        {...MedicalRecordController.update.form({
                            locale,
                            medical_record: record.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="space-y-6 p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">
                                            {t.title_label}
                                        </Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            defaultValue={record.title ?? ''}
                                        />
                                        <InputError message={errors.title} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="record_type">
                                            {t.type_label}
                                        </Label>
                                        <select
                                            id="record_type"
                                            name="record_type"
                                            defaultValue={record.record_type}
                                            className={selectClass}
                                        >
                                            {RECORD_TYPES.map((rt) => (
                                                <option key={rt} value={rt}>
                                                    {enumLabel(
                                                        t.record_type_opts,
                                                        rt,
                                                    )}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.record_type}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="record_date">
                                            {t.date_label}
                                        </Label>
                                        <Input
                                            id="record_date"
                                            name="record_date"
                                            type="datetime-local"
                                            defaultValue={
                                                record.record_date?.slice(
                                                    0,
                                                    16,
                                                ) ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.record_date}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="is_confidential">
                                            {t.confidential_field}
                                        </Label>
                                        <select
                                            id="is_confidential"
                                            name="is_confidential"
                                            defaultValue={
                                                record.is_confidential
                                                    ? '1'
                                                    : '0'
                                            }
                                            className={selectClass}
                                        >
                                            <option value="0">
                                                {t.no_label}
                                            </option>
                                            <option value="1">{t.yes}</option>
                                        </select>
                                        <InputError
                                            message={errors.is_confidential}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="subjective">
                                        {t.subjective_label}
                                    </Label>
                                    <textarea
                                        id="subjective"
                                        name="subjective"
                                        rows={3}
                                        defaultValue={clinical.subjective ?? ''}
                                        className={textareaClass}
                                    />
                                    <InputError message={errors.subjective} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="objective">
                                        {t.objective_label}
                                    </Label>
                                    <textarea
                                        id="objective"
                                        name="objective"
                                        rows={3}
                                        defaultValue={clinical.objective ?? ''}
                                        className={textareaClass}
                                    />
                                    <InputError message={errors.objective} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="assessment">
                                        {t.assessment_label}
                                    </Label>
                                    <textarea
                                        id="assessment"
                                        name="assessment"
                                        rows={3}
                                        defaultValue={clinical.assessment ?? ''}
                                        className={textareaClass}
                                    />
                                    <InputError message={errors.assessment} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="plan">{t.plan_label}</Label>
                                    <textarea
                                        id="plan"
                                        name="plan"
                                        rows={3}
                                        defaultValue={clinical.plan ?? ''}
                                        className={textareaClass}
                                    />
                                    <InputError message={errors.plan} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="content">
                                        {t.notes_field}
                                    </Label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        rows={3}
                                        defaultValue={clinical.content ?? ''}
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
