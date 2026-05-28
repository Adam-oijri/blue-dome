import { Head, Link } from '@inertiajs/react';
import { Trash2, Undo2 } from 'lucide-react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
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
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { Pagination } from '@/pages/panels/super-admin/users';
import superAdmin from '@/routes/super-admin';

interface TypeOption {
    value: string;
    label: string;
    count: number;
}

interface DisplayMap {
    title: string;
    subtitle?: string;
}

type DeletedRow = Record<string, unknown> & {
    id: string;
    deleted_at: string | null;
    clinic_id?: string | null;
    clinic?: { id: string; name: string } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

interface Props {
    type: string;
    types: TypeOption[];
    records: Paginated<DeletedRow>;
    display: DisplayMap;
}

export default function SuperAdminRecyclePage({
    type,
    types,
    records,
    display,
}: Props) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={t.recycle_page_title} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.recycle_page_title}
                    description={t.recycle_page_sub}
                />

                <div className="mb-5 flex flex-wrap gap-2">
                    {types.map((typ) => (
                        <Link
                            key={typ.value}
                            href={superAdmin.recycle.url(
                                { locale },
                                { query: { type: typ.value } },
                            )}
                            className={cn(
                                'flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
                                typ.value === type
                                    ? 'border-navy-900 bg-navy-900 text-white'
                                    : 'border-border bg-card hover:bg-muted',
                            )}
                        >
                            <span>
                                {t[`recycle_tab_${typ.value}`] ?? typ.label}
                            </span>
                            <StatusPill
                                tone={typ.value === type ? 'olive' : 'neutral'}
                                className="text-[10px]"
                            >
                                {typ.count}
                            </StatusPill>
                        </Link>
                    ))}
                </div>

                <SectionCard bodyClassName="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {display.title}
                                </TableHead>
                                {display.subtitle && (
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {display.subtitle}
                                    </TableHead>
                                )}
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_clinic}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_deleted_at}
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    {t.th_action}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted">
                                            <Trash2 className="size-5" />
                                        </div>
                                        <div className="mt-3">
                                            {t.empty_no_results}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {records.data.map((row) => {
                                const titleVal = String(
                                    row[display.title] ?? row.id,
                                );
                                const subVal = display.subtitle
                                    ? row[display.subtitle]
                                    : null;

                                return (
                                    <TableRow
                                        key={row.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3 text-[13px] font-semibold">
                                            {titleVal}
                                        </TableCell>
                                        {display.subtitle && (
                                            <TableCell className="text-[12px] text-muted-foreground">
                                                {subVal !== null &&
                                                subVal !== undefined &&
                                                subVal !== ''
                                                    ? String(subVal)
                                                    : '—'}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            {row.clinic ? (
                                                <Link
                                                    href={superAdmin.clinics.show.url(
                                                        {
                                                            locale,
                                                            clinic: row.clinic
                                                                .id,
                                                        },
                                                    )}
                                                    className="text-[13px] hover:underline"
                                                >
                                                    {row.clinic.name}
                                                </Link>
                                            ) : (
                                                <span className="text-[13px] text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground">
                                            {fmtRelativeTime(
                                                row.deleted_at,
                                                'en',
                                            )}
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="h-7 gap-1.5 text-[11px]"
                                            >
                                                <Link
                                                    href={superAdmin.recycle.restore.url(
                                                        {
                                                            locale,
                                                            type,
                                                            id: row.id,
                                                        },
                                                    )}
                                                    method="post"
                                                    as="button"
                                                    onBefore={() =>
                                                        window.confirm(
                                                            t.recycle_restore_confirm,
                                                        )
                                                    }
                                                >
                                                    <Undo2 className="size-3.5" />
                                                    {t.action_restore}
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <Pagination paginated={records} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
