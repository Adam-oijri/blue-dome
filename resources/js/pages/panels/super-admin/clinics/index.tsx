import { Head, Link, router } from '@inertiajs/react';
import { Building2, Download, Plus, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BulkActionBar } from '@/components/blue-dome/bulk-action-bar';
import { CreateClinicsSheet } from '@/components/blue-dome/create-clinics-sheet';
import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useRowSelection } from '@/hooks/use-row-selection';
import { enumLabel } from '@/lib/i18n/doctor';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { Pagination } from '@/pages/panels/super-admin/users';
import superAdmin from '@/routes/super-admin';

interface ClinicRow {
    id: string;
    name: string;
    slug?: string;
    country?: string | null;
    subscription_plan?: string;
    subscription_status?: string;
    is_active?: boolean;
    users_count?: number;
    patients_count?: number;
    created_at?: string;
}

interface Filters {
    search: string;
    status: string;
    [key: string]: string;
}

interface ClinicsIndexProps {
    clinics?: {
        data: ClinicRow[];
        total: number;
        current_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters?: Filters;
}

const STATUS_TONE: Record<string, StatusTone> = {
    active: 'success',
    trial: 'olive',
    expired: 'warning',
    suspended: 'danger',
    cancelled: 'neutral',
};

export default function SuperAdminClinicsIndex({
    clinics,
    filters,
}: ClinicsIndexProps) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();
    const statusLabels: Record<string, string> = {
        active: t.clinic_status_active,
        trial: t.clinic_status_trial,
        suspended: t.clinic_status_suspended,
        cancelled: t.clinic_status_cancelled,
        expired: t.clinic_status_expired,
    };
    const data = clinics?.data ?? [];
    const total = clinics?.total ?? data.length;
    const currentFilters: Filters = filters ?? { search: '', status: '' };

    const [search, setSearch] = useState(currentFilters.search);
    const selection = useRowSelection(data.map((c) => c.id));

    const runBulk = (action: 'suspend' | 'restore'): void => {
        router.post(
            superAdmin.clinics.bulk.url({ locale }),
            { action, ids: selection.ids },
            { preserveScroll: true, onSuccess: () => selection.clear() },
        );
    };

    const exportSelected = (): void => {
        window.location.href = superAdmin.clinics.export.url(
            { locale },
            { query: { ids: selection.ids } },
        );
    };

    useEffect(() => {
        const handle = setTimeout(() => {
            if (search === currentFilters.search) {
                return;
            }

            selection.clear();
            router.get(
                superAdmin.clinics.index.url({ locale }),
                { search, status: currentFilters.status || undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const setStatus = (status: string): void => {
        selection.clear();
        router.get(
            superAdmin.clinics.index.url({ locale }),
            {
                search: currentFilters.search || undefined,
                status: status || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t.nav_clinics} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_clinics}
                    description={t.clinics_index_desc.replace(
                        '{total}',
                        String(total),
                    )}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <a
                                    href={superAdmin.clinics.export.url(
                                        { locale },
                                        { query: currentFilters },
                                    )}
                                >
                                    <Download className="size-3.5" />
                                    {t.action_export}
                                </a>
                            </Button>
                            <CreateClinicsSheet>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-navy-900 text-white hover:bg-navy-800"
                                >
                                    <Plus className="size-3.5" />
                                    {t.clinics_action_new}
                                </Button>
                            </CreateClinicsSheet>
                        </div>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={t.total_clinics}
                        value={total}
                        icon={Building2}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.finance_kpi_active_subs}
                        value={
                            data.filter(
                                (c) => c.subscription_status === 'active',
                            ).length
                        }
                        icon={Building2}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.clinics_kpi_total_staff}
                        value={data.reduce(
                            (s, c) => s + (c.users_count ?? 0),
                            0,
                        )}
                        icon={Users}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.kpi_patients}
                        value={data.reduce(
                            (s, c) => s + (c.patients_count ?? 0),
                            0,
                        )}
                        icon={Users}
                        tone="navy"
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <div className="relative max-w-[320px] flex-1">
                            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t.search_ph}
                                className="h-9 w-full rounded-md border border-transparent bg-muted ps-9 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>
                        <select
                            value={currentFilters.status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-9 rounded-md border-0 bg-muted px-3 text-sm outline-none"
                        >
                            <option value="">
                                {t.th_status}: {t.status_all}
                            </option>
                            <option value="active">
                                {enumLabel(statusLabels, 'active')}
                            </option>
                            <option value="trial">
                                {enumLabel(statusLabels, 'trial')}
                            </option>
                            <option value="suspended">
                                {enumLabel(statusLabels, 'suspended')}
                            </option>
                            <option value="cancelled">
                                {enumLabel(statusLabels, 'cancelled')}
                            </option>
                            <option value="expired">
                                {enumLabel(statusLabels, 'expired')}
                            </option>
                        </select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-10 px-5">
                                    <Checkbox
                                        aria-label={t.clinics_select_all}
                                        checked={
                                            selection.allSelected
                                                ? true
                                                : selection.someSelected
                                                  ? 'indeterminate'
                                                  : false
                                        }
                                        onCheckedChange={() =>
                                            selection.toggleAll()
                                        }
                                    />
                                </TableHead>
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.th_clinic}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_country}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_plan}
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    {t.label_staff}
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    {t.label_patients}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_status}
                                </TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.empty_no_results}
                                    </TableCell>
                                </TableRow>
                            )}
                            {data.map((c) => {
                                const status =
                                    c.subscription_status ?? 'active';

                                return (
                                    <TableRow
                                        key={c.id}
                                        data-state={
                                            selection.has(c.id)
                                                ? 'selected'
                                                : undefined
                                        }
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5">
                                            <Checkbox
                                                aria-label={t.clinics_select_row.replace(
                                                    '{name}',
                                                    c.name,
                                                )}
                                                checked={selection.has(c.id)}
                                                onCheckedChange={() =>
                                                    selection.toggle(c.id)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="px-5 py-3">
                                            <Link
                                                href={superAdmin.clinics.show.url(
                                                    { locale, clinic: c.id },
                                                )}
                                                className="flex items-center gap-2.5"
                                            >
                                                <div
                                                    className={cn(
                                                        'grid size-8 shrink-0 place-items-center rounded-full bg-navy-700 text-xs font-semibold text-white',
                                                    )}
                                                >
                                                    {c.name
                                                        .split(' ')
                                                        .map((p) => p[0])
                                                        .slice(0, 2)
                                                        .join('')
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-semibold">
                                                        {c.name}
                                                    </div>
                                                    {c.slug && (
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {c.slug}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {c.country ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill tone="navy">
                                                {c.subscription_plan ?? 'free'}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell className="text-end text-[13px] tabular-nums">
                                            {c.users_count ?? 0}
                                        </TableCell>
                                        <TableCell className="text-end text-[13px] tabular-nums">
                                            {c.patients_count ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={
                                                    STATUS_TONE[status] ??
                                                    'neutral'
                                                }
                                                withDot
                                            >
                                                {status.replace('_', ' ')}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    className="h-7"
                                                >
                                                    <Link
                                                        href={superAdmin.clinics.show.url(
                                                            {
                                                                locale,
                                                                clinic: c.id,
                                                            },
                                                        )}
                                                    >
                                                        {t.action_view}
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {clinics && <Pagination paginated={clinics} t={t} />}
                </SectionCard>
            </div>

            <BulkActionBar
                count={selection.count}
                onClear={selection.clear}
                actions={[
                    {
                        label: t.clinics_bulk_restore,
                        onClick: () => runBulk('restore'),
                    },
                    {
                        label: t.clinics_bulk_export,
                        onClick: exportSelected,
                    },
                    {
                        label: t.clinics_bulk_suspend,
                        onClick: () => runBulk('suspend'),
                        destructive: true,
                    },
                ]}
            />
        </>
    );
}
