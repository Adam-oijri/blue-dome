import { Head, Link, router } from '@inertiajs/react';
import { Ban, ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
import superAdmin from '@/routes/super-admin';

type Appointment = {
    id: string;
    appointment_number: string | null;
    scheduled_start: string | null;
    status: string;
    type: string | null;
    patient?: { first_name: string | null; last_name: string | null } | null;
    doctor?: { first_name: string | null; last_name: string | null } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

const STATUS_TONE: Record<string, StatusTone> = {
    scheduled: 'navy',
    confirmed: 'info',
    arrived: 'olive',
    in_progress: 'olive',
    completed: 'success',
    cancelled: 'danger',
    no_show: 'warning',
    rescheduled: 'neutral',
};

const fullName = (
    p?: { first_name: string | null; last_name: string | null } | null,
): string =>
    p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';

export default function SuperAdminClinicAppointments({
    clinic,
    appointments,
}: {
    clinic: { id: string; name: string };
    appointments: Paginated<Appointment>;
}) {
    const { slug: locale } = useLocale();

    const cancel = (id: string): void => {
        const reason = window.prompt('Cancellation reason?');

        if (!reason) {
            return;
        }

        router.post(
            superAdmin.clinics.appointments.cancel.url({
                locale,
                clinic: clinic.id,
                appointment: id,
            }),
            { cancelled_reason: reason },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={`Appointments — ${clinic.name}`} />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link
                            href={superAdmin.clinics.show.url({
                                locale,
                                clinic: clinic.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            {clinic.name}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">
                        Appointments
                    </span>
                </div>

                <PageHeader
                    title="Appointments"
                    description={`${appointments.total} appointments at ${clinic.name}`}
                    actions={
                        <Button
                            asChild
                            size="sm"
                            className="gap-2 bg-navy-900 text-white hover:bg-navy-800"
                        >
                            <Link
                                href={superAdmin.clinics.appointments.create.url(
                                    { locale, clinic: clinic.id },
                                )}
                            >
                                <Plus className="size-3.5" />
                                New appointment
                            </Link>
                        </Button>
                    }
                />

                <SectionCard bodyClassName="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    When
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Patient
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Doctor
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Status
                                </TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        No appointments.
                                    </TableCell>
                                </TableRow>
                            )}
                            {appointments.data.map((a) => (
                                <TableRow
                                    key={a.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3 text-[13px]">
                                        {a.scheduled_start
                                            ?.replace('T', ' ')
                                            .slice(0, 16) ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {fullName(a.patient)}
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {fullName(a.doctor)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                STATUS_TONE[a.status] ??
                                                'neutral'
                                            }
                                            withDot
                                        >
                                            {a.status.replace('_', ' ')}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="size-7 p-0"
                                                title="Edit"
                                            >
                                                <Link
                                                    href={superAdmin.clinics.appointments.edit.url(
                                                        {
                                                            locale,
                                                            clinic: clinic.id,
                                                            appointment: a.id,
                                                        },
                                                    )}
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Link>
                                            </Button>
                                            {a.status !== 'cancelled' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="size-7 p-0 text-warning"
                                                    title="Cancel"
                                                    onClick={() => cancel(a.id)}
                                                >
                                                    <Ban className="size-3.5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="size-7 p-0 text-danger"
                                                title="Delete"
                                            >
                                                <Link
                                                    href={superAdmin.clinics.appointments.destroy.url(
                                                        {
                                                            locale,
                                                            clinic: clinic.id,
                                                            appointment: a.id,
                                                        },
                                                    )}
                                                    method="delete"
                                                    as="button"
                                                    onBefore={() =>
                                                        confirm(
                                                            'Delete this appointment?',
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={appointments} t={{}} />
                </SectionCard>
            </div>
        </>
    );
}
