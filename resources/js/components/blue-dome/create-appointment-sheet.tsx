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
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import appointments from '@/routes/appointments';

type PatientOption = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone?: string | null;
};

type DoctorOption = {
    id: string;
    first_name: string | null;
    last_name: string | null;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TYPE_OPTIONS: ReadonlyArray<string> = [
    'consultation',
    'follow_up',
    'emergency',
    'routine_checkup',
    'vaccination',
];

const PRIORITY_OPTIONS: ReadonlyArray<string> = [
    'normal',
    'low',
    'high',
    'emergency',
];

function patientName(patient: PatientOption): string {
    return (
        `${patient.first_name ?? ''} ${patient.last_name ?? ''}`.trim() ||
        patient.id
    );
}

function doctorName(doctor: DoctorOption): string {
    const name = `${doctor.first_name ?? ''} ${doctor.last_name ?? ''}`.trim();

    return name ? `Dr. ${name}` : doctor.id;
}

/** datetime-local compatible string (local time, no timezone suffix). */
function toDateTimeLocal(date: Date): string {
    const pad = (n: number): string => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Inline "schedule appointment" Sheet shared by the doctor and secretary
 * panels. A doctor books under their own name (no doctor picker). A secretary
 * (clinic manager) must choose which clinic doctor the visit is with. Drop it
 * anywhere and pass the trigger as `children`; on a patient's own page pass
 * `lockedPatient` to pre-select and lock that patient.
 */
export function CreateAppointmentSheet({
    children,
    lockedPatient,
}: {
    children: ReactNode;
    lockedPatient?: { id: string; name: string };
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const user = usePage().props.auth.user;
    const isDoctor = user.role === 'doctor';
    const [open, setOpen] = useState(false);
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [doctors, setDoctors] = useState<DoctorOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [optionsLoaded, setOptionsLoaded] = useState(false);

    const form = useForm({
        patient_id: lockedPatient?.id ?? '',
        // A doctor books under their own name; a secretary picks a clinic
        // doctor (the backend requires a real `doctor_id`).
        doctor_id: isDoctor ? user.id : '',
        scheduled_start: '',
        scheduled_end: '',
        type: 'consultation',
        priority: 'normal',
        chief_complaint: '',
    });

    // Load the clinic's patients + doctors the first time the Sheet opens. The
    // patient list goes unused when the host page locks a patient, but a
    // secretary still needs the doctor list to pick who the visit is with.
    const loadOptions = (): void => {
        if (optionsLoaded || loadingOptions) {
            return;
        }

        setLoadingOptions(true);
        fetch(appointments.formOptions.url({ locale }), {
            headers: { Accept: 'application/json' },
        })
            .then((res) =>
                res.ok ? res.json() : { patients: [], doctors: [] },
            )
            .then(
                (data: {
                    patients?: PatientOption[];
                    doctors?: DoctorOption[];
                }) => {
                    setPatients(data.patients ?? []);
                    setDoctors(data.doctors ?? []);
                    setOptionsLoaded(true);
                },
            )
            .catch(() => {
                setPatients([]);
                setDoctors([]);
            })
            .finally(() => setLoadingOptions(false));
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
                    loadOptions();
                } else {
                    form.reset();
                    form.clearErrors();
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.new_appointment}</SheetTitle>
                    <SheetDescription>
                        {isDoctor
                            ? t.new_appt_doctor_desc
                            : t.new_appt_secretary_desc}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="space-y-4 px-4 pb-4">
                    <div className="grid gap-2">
                        <Label htmlFor="patient_id">{t.col_patient}</Label>
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
                                    {loadingOptions
                                        ? t.loading_ph
                                        : t.select_patient_ph}
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

                    {!isDoctor && (
                        <div className="grid gap-2">
                            <Label htmlFor="doctor_id">{t.doctor_label}</Label>
                            <select
                                id="doctor_id"
                                value={form.data.doctor_id}
                                onChange={(e) =>
                                    form.setData('doctor_id', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                <option value="">
                                    {loadingOptions
                                        ? t.loading_ph
                                        : t.select_doctor_ph}
                                </option>
                                {doctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctorName(doctor)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.doctor_id} />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="scheduled_start">
                            {t.start_label}
                        </Label>
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
                        <Label htmlFor="scheduled_end">{t.end_label}</Label>
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
                            <Label htmlFor="type">{t.type_label}</Label>
                            <select
                                id="type"
                                value={form.data.type}
                                onChange={(e) =>
                                    form.setData('type', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                {TYPE_OPTIONS.map((value) => (
                                    <option key={value} value={value}>
                                        {enumLabel(t.appt_type_opts, value)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">
                                {t.priority_label}
                            </Label>
                            <select
                                id="priority"
                                value={form.data.priority}
                                onChange={(e) =>
                                    form.setData('priority', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                {PRIORITY_OPTIONS.map((value) => (
                                    <option key={value} value={value}>
                                        {enumLabel(t.appt_priority_opts, value)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="chief_complaint">
                            {t.chief_complaint}
                        </Label>
                        <textarea
                            id="chief_complaint"
                            rows={3}
                            value={form.data.chief_complaint}
                            onChange={(e) =>
                                form.setData('chief_complaint', e.target.value)
                            }
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                        <InputError message={form.errors.chief_complaint} />
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="w-full bg-olive-600 text-white hover:bg-olive-700"
                    >
                        {t.new_appointment}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
