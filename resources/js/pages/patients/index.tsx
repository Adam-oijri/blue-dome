import { Head, Link, router } from '@inertiajs/react';
import { ChevronRight, Download, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CreatePatientsSheet } from '@/components/blue-dome/create-patients-sheet';
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
import { downloadCsv } from '@/lib/format';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { Pagination } from '@/pages/panels/super-admin/users';
import patients from '@/routes/patients';

type PatientRow = {
    id: string;
    patient_code: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
    is_active: boolean;
    registration_date: string | null;
    clinic?: { id: string; name: string } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

interface PatientsIndexProps {
    patients: Paginated<PatientRow>;
    filters: { q: string | null; origin_clinic: string | null };
}

function fullName(p: PatientRow): string {
    return `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—';
}

function ageFrom(dob: string | null): string {
    if (!dob) {
        return '—';
    }

    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age -= 1;
    }

    return String(age);
}

function initials(p: PatientRow): string {
    return (
        `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() ||
        '?'
    );
}

export default function PatientsIndex({
    patients: paginated,
    filters,
}: PatientsIndexProps) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [query, setQuery] = useState(filters.q ?? '');

    useEffect(() => {
        const handle = setTimeout(() => {
            if ((query.trim() || null) === filters.q) {
                return;
            }

            router.get(
                patients.index.url({ locale }),
                { q: query.trim() || undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const exportCsv = (): void => {
        downloadCsv(
            'patients.csv',
            paginated.data.map((p) => ({
                code: p.patient_code ?? '',
                name: fullName(p),
                gender: p.gender ?? '',
                age: ageFrom(p.date_of_birth),
                phone: p.phone ?? '',
                clinic: p.clinic?.name ?? '',
                registered: p.registration_date?.slice(0, 10) ?? '',
                status: p.is_active ? 'active' : 'inactive',
            })),
        );
    };

    return (
        <>
            <Head title={t.patients} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.patients}
                    description={`${paginated.total} ${t.patients.toLowerCase()}`}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={exportCsv}
                                disabled={paginated.data.length === 0}
                            >
                                <Download className="size-3.5" />
                                {t.export_label}
                            </Button>
                            <CreatePatientsSheet>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                                >
                                    <Plus className="size-3.5" />
                                    {t.new_patient}
                                </Button>
                            </CreatePatientsSheet>
                        </>
                    }
                />

                <SectionCard bodyClassName="p-0">
                    <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                        <div className="relative max-w-[360px] flex-1">
                            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t.search_by_name_ph}
                                className="h-9 w-full rounded-md border border-transparent bg-muted ps-9 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.patients}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.patient_id}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.age}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.phone}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.clinic_label}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.registered_label}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_status}
                                </TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_patients_found}
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginated.data.map((p) => (
                                <TableRow
                                    key={p.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <Link
                                            href={patients.show.url({
                                                locale,
                                                patient: p.id,
                                            })}
                                            className="flex items-center gap-3"
                                        >
                                            <div
                                                className={cn(
                                                    'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                    p.gender === 'male'
                                                        ? 'bg-navy-700'
                                                        : 'bg-olive-600',
                                                )}
                                            >
                                                {initials(p)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[13px] font-medium">
                                                    {fullName(p)}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {p.gender
                                                        ? enumLabel(
                                                              t.gender_opts,
                                                              p.gender,
                                                          )
                                                        : '—'}
                                                </div>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-mono text-[12px] text-muted-foreground">
                                        {p.patient_code ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[13px] tabular-nums">
                                        {ageFrom(p.date_of_birth)}
                                    </TableCell>
                                    <TableCell className="font-mono text-[12px] text-muted-foreground">
                                        {p.phone ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {p.clinic?.name ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {p.registration_date?.slice(0, 10) ??
                                            '—'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                p.is_active
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                            withDot
                                        >
                                            {p.is_active
                                                ? t.active_label
                                                : t.inactive_label}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={patients.show.url({
                                                locale,
                                                patient: p.id,
                                            })}
                                        >
                                            <ChevronRight className="size-3.5 text-muted-foreground" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={paginated} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
