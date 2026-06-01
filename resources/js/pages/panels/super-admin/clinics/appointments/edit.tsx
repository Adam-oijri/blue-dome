import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import ClinicAppointmentController from '@/actions/App/Http/Controllers/SuperAdmin/ClinicAppointmentController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    scheduled_start: string | null;
    scheduled_end: string | null;
    status: string;
    type: string | null;
    priority: string | null;
    reason: string | null;
}

type PatientOpt = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code: string | null;
};
type DoctorOpt = {
    id: string;
    first_name: string | null;
    last_name: string | null;
};

const TYPES = [
    'consultation',
    'follow_up',
    'emergency',
    'routine_checkup',
    'vaccination',
    'procedure',
    'lab_test',
    'tele_consultation',
    'home_visit',
];
const PRIORITIES = ['low', 'normal', 'high', 'emergency'];
const STATUSES = [
    'scheduled',
    'confirmed',
    'arrived',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
    'rescheduled',
];

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

const dtLocal = (iso: string | null): string =>
    iso ? iso.replace('T', ' ').slice(0, 16).replace(' ', 'T') : '';

export default function SuperAdminClinicAppointmentEdit({
    clinic,
    appointment,
    doctors,
    patients,
}: {
    clinic: { id: string; name: string };
    appointment: Appointment | null;
    doctors: DoctorOpt[];
    patients: PatientOpt[];
}) {
    const { slug: locale } = useLocale();
    const isEdit = appointment !== null;

    const formProps = isEdit
        ? ClinicAppointmentController.update.form({
              locale,
              clinic: clinic.id,
              appointment: appointment.id,
          })
        : ClinicAppointmentController.store.form({ locale, clinic: clinic.id });

    return (
        <>
            <Head
                title={`${isEdit ? 'Edit' : 'New'} appointment — ${clinic.name}`}
            />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link
                            href={superAdmin.clinics.appointments.index.url({
                                locale,
                                clinic: clinic.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            Appointments
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">
                        {isEdit ? 'Edit' : 'New appointment'}
                    </span>
                </div>

                <PageHeader
                    title={isEdit ? 'Edit appointment' : 'New appointment'}
                    description={clinic.name}
                />

                <SectionCard className="mt-6">
                    <Form
                        {...formProps}
                        options={{ preserveScroll: true }}
                        className="space-y-6 p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="patient_id">
                                            Patient
                                        </Label>
                                        <select
                                            id="patient_id"
                                            name="patient_id"
                                            defaultValue={
                                                appointment?.patient_id ?? ''
                                            }
                                            className={selectClass}
                                            required
                                        >
                                            <option value="">
                                                Select a patient…
                                            </option>
                                            {patients.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {`${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()}
                                                    {p.patient_code
                                                        ? ` (${p.patient_code})`
                                                        : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.patient_id}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="doctor_id">
                                            Doctor
                                        </Label>
                                        <select
                                            id="doctor_id"
                                            name="doctor_id"
                                            defaultValue={
                                                appointment?.doctor_id ?? ''
                                            }
                                            className={selectClass}
                                            required
                                        >
                                            <option value="">
                                                Select a doctor…
                                            </option>
                                            {doctors.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {`${d.first_name ?? ''} ${d.last_name ?? ''}`.trim()}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.doctor_id}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="scheduled_start">
                                            Start
                                        </Label>
                                        <Input
                                            id="scheduled_start"
                                            name="scheduled_start"
                                            type="datetime-local"
                                            defaultValue={dtLocal(
                                                appointment?.scheduled_start ??
                                                    null,
                                            )}
                                            required
                                        />
                                        <InputError
                                            message={errors.scheduled_start}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="scheduled_end">
                                            End
                                        </Label>
                                        <Input
                                            id="scheduled_end"
                                            name="scheduled_end"
                                            type="datetime-local"
                                            defaultValue={dtLocal(
                                                appointment?.scheduled_end ??
                                                    null,
                                            )}
                                            required
                                        />
                                        <InputError
                                            message={errors.scheduled_end}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Type</Label>
                                        <select
                                            id="type"
                                            name="type"
                                            defaultValue={
                                                appointment?.type ??
                                                'consultation'
                                            }
                                            className={selectClass}
                                        >
                                            {TYPES.map((t) => (
                                                <option key={t} value={t}>
                                                    {t.replace('_', ' ')}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.type} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="priority">
                                            Priority
                                        </Label>
                                        <select
                                            id="priority"
                                            name="priority"
                                            defaultValue={
                                                appointment?.priority ??
                                                'normal'
                                            }
                                            className={selectClass}
                                        >
                                            {PRIORITIES.map((p) => (
                                                <option key={p} value={p}>
                                                    {p}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.priority} />
                                    </div>
                                    {isEdit && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="status">
                                                Status
                                            </Label>
                                            <select
                                                id="status"
                                                name="status"
                                                defaultValue={
                                                    appointment.status
                                                }
                                                className={selectClass}
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s.replace('_', ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.status}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <textarea
                                        id="reason"
                                        name="reason"
                                        rows={2}
                                        defaultValue={appointment?.reason ?? ''}
                                        className="min-h-12 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                    <InputError message={errors.reason} />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-navy-900 text-white hover:bg-navy-800"
                                >
                                    {processing && <Spinner />}
                                    {isEdit
                                        ? 'Save changes'
                                        : 'Schedule appointment'}
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
