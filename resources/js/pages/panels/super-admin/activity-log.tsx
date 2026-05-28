import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { fmtRelativeTime } from '@/lib/format';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { Pagination } from '@/pages/panels/super-admin/users';

interface ActivityRow {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    description: string | null;
    user?: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
    } | null;
    clinic?: { id: string; name: string } | null;
    created_at: string | null;
}

interface ActivityLogProps {
    activity: {
        data: ActivityRow[];
        total: number;
        current_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export default function SuperAdminActivityLog({ activity }: ActivityLogProps) {
    const { t } = useSuperAdminLang();

    return (
        <>
            <Head title={t.nav_audit} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_audit}
                    description={`${activity.total} entries · cross-clinic visibility`}
                />

                <SectionCard
                    title={t.activity_title}
                    titleIcon={<Activity className="size-4" />}
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.th_action}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_doctor}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_clinic}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Description
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    When
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activity.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.empty_no_results}
                                    </TableCell>
                                </TableRow>
                            )}
                            {activity.data.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3 font-mono text-[12px] font-semibold">
                                        {row.action}{' '}
                                        <span className="font-normal text-muted-foreground">
                                            {row.entity_type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {row.user
                                            ? `${row.user.first_name ?? ''} ${row.user.last_name ?? ''}`.trim() ||
                                              row.user.email
                                            : 'System'}
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {row.clinic?.name ?? '—'}
                                    </TableCell>
                                    <TableCell className="max-w-md truncate text-[12px] text-muted-foreground">
                                        {row.description ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {fmtRelativeTime(row.created_at, 'en')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={activity} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
