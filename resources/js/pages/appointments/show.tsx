import { Form, Head, Link } from '@inertiajs/react';

import type { FieldChangeEntry } from '@/components/provenance-panel';
import { ProvenancePanel } from '@/components/provenance-panel';

interface Appointment {
    id: string;
    appointment_number: string | null;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
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

export default function AppointmentShow({ appointment, provenance }: Props) {
    return (
        <>
            <Head
                title={`Appointment ${appointment.appointment_number ?? appointment.id.slice(0, 8)}`}
            />
            <div className="flex h-full flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {appointment.appointment_number ?? 'pending'}
                        </h1>
                        <p className="font-mono text-xs text-neutral-500">
                            {appointment.scheduled_start} →{' '}
                            {appointment.scheduled_end}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/appointments/${appointment.id}/edit`}
                            className="rounded border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
                        >
                            Edit
                        </Link>
                    </div>
                </div>

                <section className="mb-6 grid grid-cols-2 gap-4 rounded border border-neutral-200 p-4 text-sm">
                    <div>
                        <dt className="text-xs text-neutral-500 uppercase">
                            Patient
                        </dt>
                        <dd>
                            {appointment.patient ? (
                                <Link
                                    href={`/patients/${appointment.patient.id}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {appointment.patient.first_name}{' '}
                                    {appointment.patient.last_name}
                                </Link>
                            ) : (
                                '—'
                            )}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-neutral-500 uppercase">
                            Doctor
                        </dt>
                        <dd>
                            {appointment.doctor
                                ? `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`
                                : '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-neutral-500 uppercase">
                            Status
                        </dt>
                        <dd>{appointment.status}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-neutral-500 uppercase">
                            Confirmation
                        </dt>
                        <dd>
                            {appointment.confirmation_status}{' '}
                            {appointment.confirmation_at &&
                                `(${appointment.confirmation_at})`}
                        </dd>
                    </div>
                    <div className="col-span-2">
                        <dt className="text-xs text-neutral-500 uppercase">
                            Chief complaint
                        </dt>
                        <dd>{appointment.chief_complaint ?? '—'}</dd>
                    </div>
                </section>

                {appointment.status !== 'cancelled' && (
                    <section className="mb-6 rounded border border-rose-200 p-4">
                        <h2 className="mb-3 text-sm font-semibold text-rose-700 uppercase">
                            Cancel appointment
                        </h2>
                        <Form
                            action={`/appointments/${appointment.id}/cancel`}
                            method="post"
                            className="flex gap-2 text-sm"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <input
                                        name="cancelled_reason"
                                        required
                                        placeholder="Reason for cancellation"
                                        className="flex-1 rounded border border-neutral-300 px-3 py-2"
                                    />
                                    {errors.cancelled_reason && (
                                        <span className="text-xs text-red-600">
                                            {errors.cancelled_reason}
                                        </span>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded bg-rose-600 px-4 py-2 text-white disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </Form>
                    </section>
                )}

                <div className="mb-6">
                    <ProvenancePanel
                        deferredKey="provenance"
                        entries={provenance}
                    />
                </div>

                <p className="mt-auto text-center text-xs text-neutral-400">
                    Placeholder. Carbon panel will replace this view.
                </p>
            </div>
        </>
    );
}
