import { Head, router } from '@inertiajs/react';
import { Archive, Heart, Search, UserPlus, Users } from 'lucide-react';
import { useRef, useState } from 'react';

import { CreatePatientsSheet } from '@/components/blue-dome/create-patients-sheet';
import { KpiCard } from '@/components/blue-dome/kpi-card';
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
import { fmtNumber } from '@/lib/format';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { Pagination } from '@/pages/panels/super-admin/users';
import { show as patientShow } from '@/routes/patients';
import { patients as patientsRoute } from '@/routes/secretary';

type PatientRow = {
    id: string;
    patient_code: string | null;
    first_name: string | null;
    last_name: string | null;
    gender: string | null;
    date_of_birth: string | null;
    phone: string | null;
    blood_type: string | null;
    chronic_diseases: string | null;
    insurance_company: string | null;
    registration_date: string | null;
    is_active: boolean;
    last_visit: string | null;
    next_appt: string | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

interface Props {
    patients: Paginated<PatientRow>;
    kpis: {
        total: number;
        chronic: number;
        new_this_month: number;
    };
    filters: {
        q: string | null;
        filter: string | null;
    };
}

const fullName = (p: PatientRow): string =>
    `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—';

const initials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? '')
        .join('') || '?';

const ageFrom = (dob: string | null): string => {
    if (!dob) {
        return '—';
    }

    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();

    return String(Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
};

const fmtDate = (value: string | null): string =>
    value ? value.slice(0, 10) : '—';

export default function SecretaryPatients({ patients, kpis, filters }: Props) {
    const { t } = useSecretaryLang();
    const { slug: locale } = useLocale();
    const [search, setSearch] = useState(filters.q ?? '');
    const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    const chronicActive = filters.filter === 'chronic';

    const visit = (params: Record<string, string>): void => {
        router.get(patientsRoute.url({ locale }), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const onSearchChange = (value: string): void => {
        setSearch(value);

        if (debounce.current) {
            clearTimeout(debounce.current);
        }

        debounce.current = setTimeout(() => {
            const params: Record<string, string> = {};

            if (value) {
                params.q = value;
            }

            if (chronicActive) {
                params.filter = 'chronic';
            }

            visit(params);
        }, 300);
    };

    const toggleChronic = (next: boolean): void => {
        const params: Record<string, string> = {};

        if (search) {
            params.q = search;
        }

        if (next) {
            params.filter = 'chronic';
        }

        visit(params);
    };

    return (
        <>
            <Head title={t.nav_patients} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_patients}
                    description={`${fmtNumber(kpis.total)} · ${fmtNumber(kpis.new_this_month)} ${t.pt_kpi_new_month}`}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Archive className="size-3.5" />
                                {t.pt_export}
                            </Button>
                            <CreatePatientsSheet>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                                >
                                    <UserPlus className="size-3.5" />
                                    {t.pt_new}
                                </Button>
                            </CreatePatientsSheet>
                        </>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={t.pt_kpi_total}
                        value={fmtNumber(kpis.total)}
                        icon={Users}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.pt_kpi_new_month}
                        value={fmtNumber(kpis.new_this_month)}
                        icon={UserPlus}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.pt_kpi_chronic}
                        value={fmtNumber(kpis.chronic)}
                        icon={Heart}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.pt_kpi_results}
                        value={fmtNumber(patients.total)}
                        icon={Search}
                        tone="success"
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                        <div className="relative max-w-[280px] flex-1">
                            <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder={t.pt_search_placeholder}
                                className="h-8 w-full rounded-md border border-transparent bg-muted ps-8 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <Button
                                variant={chronicActive ? 'ghost' : 'default'}
                                size="sm"
                                onClick={() => toggleChronic(false)}
                                className={cn(
                                    'gap-1.5',
                                    !chronicActive
                                        ? 'bg-navy-900 text-white hover:bg-navy-800'
                                        : '',
                                )}
                            >
                                {t.pt_filter_all}
                            </Button>
                            <Button
                                variant={chronicActive ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => toggleChronic(true)}
                                className={cn(
                                    'gap-1.5',
                                    chronicActive
                                        ? 'bg-navy-900 text-white hover:bg-navy-800'
                                        : '',
                                )}
                            >
                                {t.pt_filter_chronic}
                                <span className="text-[11px] tabular-nums opacity-70">
                                    {fmtNumber(kpis.chronic)}
                                </span>
                            </Button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.pt_col_patient}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.pt_col_age}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.pt_col_contact}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.pt_col_insurance}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.pt_col_last_visit}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.pt_col_next_appt}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.pt_col_tags}
                                </TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        {t.pt_empty}
                                    </TableCell>
                                </TableRow>
                            )}
                            {patients.data.map((p) => {
                                const name = fullName(p);
                                const chronic = Boolean(
                                    p.chronic_diseases &&
                                        p.chronic_diseases.trim() !== '',
                                );

                                return (
                                    <TableRow
                                        key={p.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            router.visit(
                                                patientShow.url({
                                                    locale,
                                                    patient: p.id,
                                                }),
                                            )
                                        }
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={cn(
                                                        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                        p.gender === 'male'
                                                            ? 'bg-navy-700'
                                                            : 'bg-olive-600',
                                                    )}
                                                >
                                                    {initials(name)}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-semibold">
                                                        {name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground tabular-nums">
                                                        {p.patient_code ?? '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px] tabular-nums">
                                            {ageFrom(p.date_of_birth)}
                                        </TableCell>
                                        <TableCell className="font-mono text-[11px] text-muted-foreground">
                                            {p.phone ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {p.insurance_company ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {fmtDate(p.last_visit)}
                                        </TableCell>
                                        <TableCell className="text-[12px] tabular-nums">
                                            {p.next_appt ? (
                                                <span className="font-semibold text-olive-700">
                                                    {fmtDate(p.next_appt)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/60">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {p.blood_type && (
                                                    <StatusPill tone="danger">
                                                        {p.blood_type}
                                                    </StatusPill>
                                                )}
                                                {chronic && (
                                                    <StatusPill tone="warning">
                                                        {t.pt_tag_chronic}
                                                    </StatusPill>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7"
                                            >
                                                {t.pt_view}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <Pagination paginated={patients} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
