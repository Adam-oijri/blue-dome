import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import medicalRecords from '@/routes/medical-records';

export type MedicalRecordEditable = {
    id: string;
    title: string | null;
    record_type: string;
    record_date: string | null;
    is_confidential: boolean;
};

export type MedicalRecordClinical = {
    subjective: string | null;
    objective: string | null;
    assessment: string | null;
    plan: string | null;
    content: string | null;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const RECORD_TYPE_OPTIONS: ReadonlyArray<readonly [string, string]> = [
    ['note', 'Note'],
    ['progress', 'Progress'],
    ['lab_result', 'Lab result'],
    ['imaging', 'Imaging'],
    ['procedure', 'Procedure'],
    ['vaccination', 'Vaccination'],
    ['surgery', 'Surgery'],
    ['discharge_summary', 'Discharge summary'],
    ['referral', 'Referral'],
    ['other', 'Other'],
];

/**
 * Inline "edit medical record" Sheet. Prefilled from the row's identity fields
 * (`record`) and the decrypted clinical SOAP/content fields (`clinical`), which
 * the host page splits exactly like the dedicated edit page. Posts via PATCH and
 * stays on the page.
 */
export function EditMedicalRecordsSheet({
    children,
    record,
    clinical,
}: {
    children: ReactNode;
    record: MedicalRecordEditable;
    clinical: MedicalRecordClinical;
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm({
        title: record.title ?? '',
        record_type: record.record_type ?? 'note',
        record_date: record.record_date
            ? String(record.record_date).slice(0, 16)
            : '',
        is_confidential: record.is_confidential,
        subjective: clinical.subjective ?? '',
        objective: clinical.objective ?? '',
        assessment: clinical.assessment ?? '',
        plan: clinical.plan ?? '',
        content: clinical.content ?? '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.patch(
            medicalRecords.update.url({ locale, medical_record: record.id }),
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            },
        );
    };

    return (
        <Sheet
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (!next) {
                    form.reset();
                    form.clearErrors();
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>{t.edit_record}</SheetTitle>
                    <SheetDescription>{t.consultations}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_title">{t.title_label}</Label>
                            <input
                                id="edit_title"
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.title} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_record_type">
                                    {t.type_label}
                                </Label>
                                <select
                                    id="edit_record_type"
                                    value={form.data.record_type}
                                    onChange={(e) =>
                                        form.setData(
                                            'record_type',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                >
                                    {RECORD_TYPE_OPTIONS.map(([value]) => (
                                        <option key={value} value={value}>
                                            {enumLabel(
                                                t.record_type_opts,
                                                value,
                                            )}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={form.errors.record_type}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_is_confidential">
                                    {t.confidential_field}
                                </Label>
                                <select
                                    id="edit_is_confidential"
                                    value={form.data.is_confidential ? '1' : '0'}
                                    onChange={(e) =>
                                        form.setData(
                                            'is_confidential',
                                            e.target.value === '1',
                                        )
                                    }
                                    className={FIELD_CLASS}
                                >
                                    <option value="0">{t.no_label}</option>
                                    <option value="1">{t.yes}</option>
                                </select>
                                <InputError
                                    message={form.errors.is_confidential}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_record_date">
                                {t.date_label}
                            </Label>
                            <input
                                id="edit_record_date"
                                type="datetime-local"
                                value={form.data.record_date}
                                onChange={(e) =>
                                    form.setData('record_date', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.record_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_subjective">
                                {t.subjective_label}
                            </Label>
                            <textarea
                                id="edit_subjective"
                                rows={3}
                                value={form.data.subjective}
                                onChange={(e) =>
                                    form.setData('subjective', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.subjective} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_objective">
                                {t.objective_label}
                            </Label>
                            <textarea
                                id="edit_objective"
                                rows={3}
                                value={form.data.objective}
                                onChange={(e) =>
                                    form.setData('objective', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.objective} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_assessment">
                                {t.assessment_label}
                            </Label>
                            <textarea
                                id="edit_assessment"
                                rows={3}
                                value={form.data.assessment}
                                onChange={(e) =>
                                    form.setData('assessment', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.assessment} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_plan">{t.plan_label}</Label>
                            <textarea
                                id="edit_plan"
                                rows={3}
                                value={form.data.plan}
                                onChange={(e) =>
                                    form.setData('plan', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.plan} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_content">{t.notes_field}</Label>
                            <textarea
                                id="edit_content"
                                rows={3}
                                value={form.data.content}
                                onChange={(e) =>
                                    form.setData('content', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.content} />
                        </div>
                    </div>

                    <div className="border-t px-4 py-4">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                        >
                            {t.save_changes}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
