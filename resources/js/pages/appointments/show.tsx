import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft, Edit3 } from 'lucide-react';

import { EditAppointmentsSheet } from '@/components/blue-dome/edit-appointments-sheet';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import type { FieldChangeEntry } from '@/components/provenance-panel';
import { ProvenancePanel } from '@/components/provenance-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocaleSlug } from '@/lib/i18n/use-locale';
import appointments from '@/routes/appointments';
import patients from '@/routes/patients';

interface Appointment {
    id: string;
    appointment_number: string | null;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
    priority: string | null;
    confirmation_status: string;
    confirmation_at: string | null;
    chief_complaint: string | null;
    notes: string | null;
    clinic_id: string;
    patient?: {
        id: string;
        first_name: string;
        last_name: string;
        phone: string | null;
    };
    doctor?: { id: string; first_name: string; last_name: string };
    secretary?: { id: string; first_name: string; last_name: string } | null;
    clinic?: { id: string; name: string };
}

interface Props {
    appointment: Appointment;
    provenance?: FieldChangeEntry[];
}

const STATUS_TONE: Record<string, StatusTone> = {
    scheduled: 'neutral',
    confirmed: 'info',
    arrived: 'olive',
    in_progress: 'olive',
    completed: 'success',
    cancelled: 'danger',
    no_show: 'warning',
};

function personName(person?: { first_name: string; last_name: string } | null): string {
    return `${person?.first_name ?? ''} ${person?.last_name ?? ''}`.trim() || '—';
}

export default function AppointmentShow({ appointment, provenance }: Props) {
    const { t } = useDoctorLang();
    const locale = useLocaleSlug();

    const number = appointment.appointment_number ?? appointment.id.slice(0, 8);

    return (
        <>
            <Head title={number} />

            <div className="px-8 py-6 lg:px-10">
                <div className="mb-4 flex items-center gap-3 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1.5"
                    >
                        <Link href={appointments.index.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            {t.appointments}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-medium tabular-nums">
                        {number}
                    </span>
                </div>

                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-[20px] font-semibold tabular-nums">
                                {number}
                            </h1>
                            <StatusPill
                                tone={STATUS_TONE[appointment.status] ?? 'neutral'}
                                withDot
                            >
                                {enumLabel(t.appt_status_opts, appointment.status)}
                            </StatusPill>
                        </div>
                        <div className="mt-2 grid gap-1 text-[13px] text-muted-foreground">
                            <span>
                                {t.col_patient}:{' '}
                                {appointment.patient ? (
                                    <Link
                                        href={patients.show.url({
                                            locale,
                                            patient: appointment.patient.id,
                                        })}
                                        className="font-medium text-foreground hover:underline"
                                    >
                                        {personName(appointment.patient)}
                                    </Link>
                                ) : (
                                    '—'
                                )}
                            </span>
                            <span>
                                {t.doctor_label}: {personName(appointment.doctor)}
                            </span>
                            <span>
                                {appointment.scheduled_start} →{' '}
                                {appointment.scheduled_end}
                            </span>
                            <span>
                                {t.confirmation_label}:{' '}
                                {appointment.confirmation_status}
                                {appointment.confirmation_at
                                    ? ` · ${appointment.confirmation_at}`
                                    : ''}
                            </span>
                        </div>
                    </div>
                    <EditAppointmentsSheet appointment={appointment}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Edit3 className="size-3.5" />
                            {t.edit}
                        </Button>
                    </EditAppointmentsSheet>
                </div>

                {appointment.chief_complaint && (
                    <div className="mb-5 rounded-lg border border-border bg-card p-4 text-[13px]">
                        <div className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            {t.chief_complaint}
                        </div>
                        {appointment.chief_complaint}
                    </div>
                )}

                {appointment.status !== 'cancelled' && (
                    <SectionCard
                        title={t.cancel_appointment}
                        className="mb-5"
                        bodyClassName="p-5"
                    >
                        <Form
                            action={appointments.cancel.url({
                                locale,
                                appointment: appointment.id,
                            })}
                            method="post"
                            className="flex flex-wrap items-start gap-2"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid flex-1 gap-1.5">
                                        <Input
                                            name="cancelled_reason"
                                            required
                                            placeholder={t.cancel_reason_ph}
                                        />
                                        {errors.cancelled_reason && (
                                            <span className="text-[12px] text-danger">
                                                {errors.cancelled_reason}
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        variant="outline"
                                        className="border-danger text-danger hover:bg-danger-soft"
                                    >
                                        {t.cancel_label}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </SectionCard>
                )}

                <ProvenancePanel deferredKey="provenance" entries={provenance} />
            </div>
        </>
    );
}
