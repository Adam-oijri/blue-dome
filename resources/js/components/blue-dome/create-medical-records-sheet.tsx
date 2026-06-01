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
import { useLocale } from '@/lib/i18n/use-locale';
import medicalRecords from '@/routes/medical-records';

type PatientOption = {
    id: string;
    [k: string]: unknown;
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

function patientLabel(patient: PatientOption): string {
    const first = (patient.first_name as string | null) ?? '';
    const last = (patient.last_name as string | null) ?? '';
    const name = `${first} ${last}`.trim();
    const code = patient.patient_code as string | null | undefined;

    if (!name) {
        return patient.id;
    }

    return code ? `${name} · ${code}` : name;
}

/**
 * Inline "new medical record" Sheet. Drop it anywhere and pass the trigger as
 * `children`; the host page supplies the clinic's `patients` for the patient
 * dropdown.
 */
export function CreateMedicalRecordsSheet({
    children,
    patients,
}: {
    children: ReactNode;
    patients: Array<{ id: string; [k: string]: unknown }>;
}) {
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm({
        patient_id: '',
        record_type: 'note',
        title: '',
        record_date: '',
        is_confidential: false,
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        content: '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(medicalRecords.store.url({ locale }), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
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
                    <SheetTitle>New medical record</SheetTitle>
                    <SheetDescription>
                        Pick a patient and document the visit. SOAP notes are
                        optional.
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="patient_id">Patient</Label>
                            <select
                                id="patient_id"
                                value={form.data.patient_id}
                                onChange={(e) =>
                                    form.setData('patient_id', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                <option value="">Select a patient…</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patientLabel(patient)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.patient_id} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="record_type">Type</Label>
                                <select
                                    id="record_type"
                                    value={form.data.record_type}
                                    onChange={(e) =>
                                        form.setData(
                                            'record_type',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                >
                                    {RECORD_TYPE_OPTIONS.map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>
                                <InputError
                                    message={form.errors.record_type}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="is_confidential">
                                    Confidential
                                </Label>
                                <select
                                    id="is_confidential"
                                    value={form.data.is_confidential ? '1' : '0'}
                                    onChange={(e) =>
                                        form.setData(
                                            'is_confidential',
                                            e.target.value === '1',
                                        )
                                    }
                                    className={FIELD_CLASS}
                                >
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                                <InputError
                                    message={form.errors.is_confidential}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <input
                                id="title"
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="record_date">Date</Label>
                            <input
                                id="record_date"
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
                            <Label htmlFor="subjective">Subjective</Label>
                            <textarea
                                id="subjective"
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
                            <Label htmlFor="objective">Objective</Label>
                            <textarea
                                id="objective"
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
                            <Label htmlFor="assessment">Assessment</Label>
                            <textarea
                                id="assessment"
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
                            <Label htmlFor="plan">Plan</Label>
                            <textarea
                                id="plan"
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
                            <Label htmlFor="content">Notes</Label>
                            <textarea
                                id="content"
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
                            Create record
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
