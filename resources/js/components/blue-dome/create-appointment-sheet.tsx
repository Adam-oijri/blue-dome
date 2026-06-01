import { useForm, usePage } from '@inertiajs/react';
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
import appointments from '@/routes/appointments';

type PatientOption = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone?: string | null;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TYPE_OPTIONS: ReadonlyArray<readonly [string, string]> = [
    ['consultation', 'Consultation'],
    ['follow_up', 'Follow-up'],
    ['emergency', 'Emergency'],
    ['routine_checkup', 'Routine checkup'],
    ['vaccination', 'Vaccination'],
];

const PRIORITY_OPTIONS: ReadonlyArray<readonly [string, string]> = [
    ['normal', 'Normal'],
    ['low', 'Low'],
    ['high', 'High'],
    ['emergency', 'Emergency'],
];

function patientName(patient: PatientOption): string {
    return (
        `${patient.first_name ?? ''} ${patient.last_name ?? ''}`.trim() ||
        patient.id
    );
}

/** datetime-local compatible string (local time, no timezone suffix). */
function toDateTimeLocal(date: Date): string {
    const pad = (n: number): string => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Inline "schedule appointment" Sheet for the doctor panel. The doctor is the
 * authenticated user, so only the patient is chosen. Drop it anywhere and pass
 * the trigger as `children`; on a patient's own page pass `lockedPatient` to
 * pre-select and lock that patient.
 */
export function CreateAppointmentSheet({
    children,
    lockedPatient,
}: {
    children: ReactNode;
    lockedPatient?: { id: string; name: string };
}) {
    const { slug: locale } = useLocale();
    const userId = usePage().props.auth.user.id;
    const [open, setOpen] = useState(false);
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(false);

    const form = useForm({
        patient_id: lockedPatient?.id ?? '',
        doctor_id: userId,
        scheduled_start: '',
        scheduled_end: '',
        type: 'consultation',
        priority: 'normal',
        chief_complaint: '',
    });

    // Load the clinic's patients the first time the Sheet opens — unless the
    // patient is already fixed by the host page (e.g. the patient detail page).
    const loadPatients = (): void => {
        if (lockedPatient || patients.length > 0 || loadingPatients) {
            return;
        }

        setLoadingPatients(true);
        fetch(appointments.formOptions.url({ locale }), {
            headers: { Accept: 'application/json' },
        })
            .then((res) => (res.ok ? res.json() : { patients: [] }))
            .then((data: { patients?: PatientOption[] }) => {
                setPatients(data.patients ?? []);
            })
            .catch(() => setPatients([]))
            .finally(() => setLoadingPatients(false));
    };

    const onStartChange = (value: string): void => {
        form.setData('scheduled_start', value);

        if (value && !form.data.scheduled_end) {
            const start = new Date(value);

            if (!Number.isNaN(start.getTime())) {
                start.setMinutes(start.getMinutes() + 30);
                form.setData('scheduled_end', toDateTimeLocal(start));
            }
        }
    };

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(appointments.store.url({ locale }), {
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

                if (next) {
                    loadPatients();
                } else {
                    form.reset();
                    form.clearErrors();
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Schedule appointment</SheetTitle>
                    <SheetDescription>
                        Pick a patient and a time slot. The appointment is
                        created under your name.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="space-y-4 px-4 pb-4">
                    <div className="grid gap-2">
                        <Label htmlFor="patient_id">Patient</Label>
                        {lockedPatient ? (
                            <input
                                readOnly
                                value={lockedPatient.name}
                                className={FIELD_CLASS}
                            />
                        ) : (
                            <select
                                id="patient_id"
                                value={form.data.patient_id}
                                onChange={(e) =>
                                    form.setData('patient_id', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                <option value="">
                                    {loadingPatients
                                        ? 'Loading…'
                                        : 'Select a patient…'}
                                </option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patientName(patient)}
                                        {patient.phone
                                            ? ` · ${patient.phone}`
                                            : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                        <InputError message={form.errors.patient_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="scheduled_start">Start</Label>
                        <input
                            id="scheduled_start"
                            type="datetime-local"
                            value={form.data.scheduled_start}
                            onChange={(e) => onStartChange(e.target.value)}
                            className={FIELD_CLASS}
                        />
                        <InputError message={form.errors.scheduled_start} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="scheduled_end">End</Label>
                        <input
                            id="scheduled_end"
                            type="datetime-local"
                            value={form.data.scheduled_end}
                            onChange={(e) =>
                                form.setData('scheduled_end', e.target.value)
                            }
                            className={FIELD_CLASS}
                        />
                        <InputError message={form.errors.scheduled_end} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <select
                                id="type"
                                value={form.data.type}
                                onChange={(e) =>
                                    form.setData('type', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                {TYPE_OPTIONS.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <select
                                id="priority"
                                value={form.data.priority}
                                onChange={(e) =>
                                    form.setData('priority', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                {PRIORITY_OPTIONS.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="chief_complaint">
                            Reason / chief complaint
                        </Label>
                        <textarea
                            id="chief_complaint"
                            rows={3}
                            value={form.data.chief_complaint}
                            onChange={(e) =>
                                form.setData('chief_complaint', e.target.value)
                            }
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                        />
                        <InputError message={form.errors.chief_complaint} />
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="w-full bg-olive-600 text-white hover:bg-olive-700"
                    >
                        Schedule
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
