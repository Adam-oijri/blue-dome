import { Head, Link } from '@inertiajs/react';
import { Activity } from 'lucide-react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
import appointments from '@/routes/appointments';

type Appt = {
    id: string;
    patient?: {
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
    } | null;
    scheduled_start: string | null;
    confirmation_status: string;
    type: string | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

const CONF_TONE: Record<string, StatusTone> = {
    pending: 'warning',
    reminder_sent: 'info',
    delivered: 'info',
    seen: 'olive',
    declined: 'danger',
    no_response: 'neutral',
};

const fullName = (p?: Appt['patient']): string =>
    p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';

export default function DoctorConfirmations({
    appointments: data,
}: {
    appointments: Paginated<Appt>;
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={t.confirmations} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.confirmations}
                    description={`${data.total} ${t.pending}`}
                />

                <SectionCard
                    titleIcon={<Activity className="size-4" />}
                    title={t.pending_confirmations}
                    bodyClassName="p-0"
                    className="mt-6"
                >
                    {data.data.length === 0 ? (
                        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                            {t.all_confirmed}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        {t.last_visit}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.patients}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.phone}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.confirmations}
                                    </TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.map((a) => (
                                    <TableRow
                                        key={a.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3 text-[13px] tabular-nums">
                                            {a.scheduled_start
                                                ?.slice(0, 16)
                                                .replace('T', ' ') ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-[13px] font-medium">
                                            {fullName(a.patient)}
                                        </TableCell>
                                        <TableCell className="font-mono text-[12px] text-muted-foreground">
                                            {a.patient?.phone ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={
                                                    CONF_TONE[
                                                        a.confirmation_status
                                                    ] ?? 'neutral'
                                                }
                                                withDot
                                            >
                                                {a.confirmation_status.replace(
                                                    /_/g,
                                                    ' ',
                                                )}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={appointments.show.url({
                                                    locale,
                                                    appointment: a.id,
                                                })}
                                                className="text-[12px] text-muted-foreground hover:underline"
                                            >
                                                {t.overview}
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <Pagination paginated={data} t={{}} />
                </SectionCard>
            </div>
        </>
    );
}
