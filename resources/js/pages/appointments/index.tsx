import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Plus } from 'lucide-react';
import { useState } from 'react';

import { CreateAppointmentSheet } from '@/components/blue-dome/create-appointment-sheet';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
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
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    appointments: Paginator<AppointmentRow>;
    filters: { day: string | null; status: string | null };
}

const STATUS_VALUES = [
    'scheduled',
    'confirmed',
    'arrived',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
];

const STATUS_TONE: Record<string, StatusTone> = {
    scheduled: 'neutral',
    confirmed: 'info',
    arrived: 'olive',
    in_progress: 'olive',
    completed: 'success',
    cancelled: 'danger',
    no_show: 'warning',
};

const fieldClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

function personName(person?: { first_name: string; last_name: string }): string {
    return person
        ? `${person.first_name} ${person.last_name}`.trim() || '—'
        : '—';
}

export default function AppointmentsIndex({ appointments, filters }: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [day, setDay] = useState(filters.day ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const apply = (e: React.FormEvent): void => {
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

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.appointments}
                    description={String(appointments.total)}
                    actions={
                        <CreateAppointmentSheet>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                {t.new_appointment}
                            </Button>
                        </CreateAppointmentSheet>
                    }
                />

                <form onSubmit={apply} className="mb-4 flex flex-wrap gap-2">
                    <Input
                        type="date"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="h-9 w-auto"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={fieldClass}
                    >
                        <option value="">{t.all_statuses}</option>
                        {STATUS_VALUES.map((s) => (
                            <option key={s} value={s}>
                                {enumLabel(t.appt_status_opts, s)}
                            </option>
                        ))}
                    </select>
                    <Button type="submit" variant="outline" size="sm">
                        {t.apply}
                    </Button>
                </form>

                <SectionCard
                    titleIcon={<CalendarDays className="size-4" />}
                    title={t.appointments}
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    #
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_when}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_patient}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_doctor}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_status}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.confirmed_q}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_appointments}
                                    </TableCell>
                                </TableRow>
                            )}
                            {appointments.data.map((a) => {
                                const confirmed =
                                    a.confirmation_status ===
                                        'confirmed_by_patient' ||
                                    a.confirmation_status === 'confirmed_by_call';

                                return (
                                    <TableRow
                                        key={a.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3 font-mono text-[11px] text-muted-foreground tabular-nums">
                                            {a.appointment_number ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-[12px] tabular-nums">
                                            {a.scheduled_start}
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {a.patient ? (
                                                <Link
                                                    href={appointmentRoutes.show.url(
                                                        {
                                                            locale,
                                                            appointment: a.id,
                                                        },
                                                    )}
                                                    className="font-medium hover:underline"
                                                >
                                                    {personName(a.patient)}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-[13px] text-muted-foreground">
                                            {personName(a.doctor)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={
                                                    STATUS_TONE[a.status] ??
                                                    'neutral'
                                                }
                                                withDot
                                            >
                                                {enumLabel(
                                                    t.appt_status_opts,
                                                    a.status,
                                                )}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={
                                                    confirmed
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {confirmed
                                                    ? t.confirmed
                                                    : enumLabel(
                                                          t.appt_status_opts,
                                                          a.confirmation_status,
                                                      )}
                                            </StatusPill>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <Pagination paginated={appointments} t={{}} />
                </SectionCard>
            </div>
        </>
    );
}
