import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import { CreateAppointmentSheet } from '@/components/blue-dome/create-appointment-sheet';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import appointmentRoutes from '@/routes/appointments';

interface AppointmentRow {
    id: string;
    appointment_number: string | null;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
    confirmation_status: string;
    needs_follow_up_call: boolean;
    patient?: { id: string; first_name: string; last_name: string };
    doctor?: { id: string; first_name: string; last_name: string };
}

interface Paginator<T> {
    data: T[];
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    appointments: Paginator<AppointmentRow>;
    filters: { day: string | null; status: string | null };
}

export default function AppointmentsIndex({ appointments, filters }: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [day, setDay] = useState(filters.day ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const apply = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            appointmentRoutes.index.url({ locale }),
            { day: day || undefined, status: status || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t.appointments} />
            <div className="flex h-full flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t.appointments}
                        </h1>
                        <p className="text-xs text-neutral-500">
                            {appointments.total} total
                        </p>
                    </div>
                    <CreateAppointmentSheet>
                        <button
                            type="button"
                            className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                        >
                            + {t.new_appointment}
                        </button>
                    </CreateAppointmentSheet>
                </div>

                <form onSubmit={apply} className="mb-4 flex gap-2 text-sm">
                    <input
                        type="date"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="rounded border border-neutral-300 px-3 py-2"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded border border-neutral-300 px-3 py-2"
                    >
                        <option value="">{t.all_statuses}</option>
                        {[
                            'scheduled',
                            'confirmed',
                            'arrived',
                            'in_progress',
                            'completed',
                            'cancelled',
                            'no_show',
                        ].map((s) => (
                            <option key={s} value={s}>
                                {enumLabel(t.appt_status_opts, s)}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="rounded border border-neutral-300 px-3 py-2"
                    >
                        {t.apply}
                    </button>
                </form>

                <table className="w-full text-left text-sm">
                    <thead className="border-b border-neutral-200 text-xs text-neutral-500 uppercase">
                        <tr>
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">{t.col_when}</th>
                            <th className="px-3 py-2">{t.col_patient}</th>
                            <th className="px-3 py-2">{t.col_doctor}</th>
                            <th className="px-3 py-2">{t.col_status}</th>
                            <th className="px-3 py-2">{t.confirmed_q}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-3 py-8 text-center text-neutral-400"
                                >
                                    {t.no_appointments}
                                </td>
                            </tr>
                        )}
                        {appointments.data.map((a) => (
                            <tr
                                key={a.id}
                                className="border-b border-neutral-100 hover:bg-neutral-50"
                            >
                                <td className="px-3 py-2 font-mono text-xs">
                                    {a.appointment_number ?? '—'}
                                </td>
                                <td className="px-3 py-2 font-mono text-xs">
                                    {a.scheduled_start}
                                </td>
                                <td className="px-3 py-2">
                                    {a.patient ? (
                                        <Link
                                            href={appointmentRoutes.show.url({
                                                locale,
                                                appointment: a.id,
                                            })}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {a.patient.first_name}{' '}
                                            {a.patient.last_name}
                                        </Link>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="px-3 py-2">
                                    {a.doctor
                                        ? `Dr. ${a.doctor.last_name}`
                                        : '—'}
                                </td>
                                <td className="px-3 py-2">
                                    {enumLabel(t.appt_status_opts, a.status)}
                                </td>
                                <td className="px-3 py-2">
                                    {a.confirmation_status ===
                                    'confirmed_by_patient' ? (
                                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                                            {t.confirmed}
                                        </span>
                                    ) : (
                                        <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                                            {a.confirmation_status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p className="mt-auto text-center text-xs text-neutral-400">
                    Placeholder. Carbon panel will replace this view.
                </p>
            </div>
        </>
    );
}
