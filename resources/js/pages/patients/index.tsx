import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Download, Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';

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
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { DOCTOR_MOCK } from '@/lib/mock/doctor';
import type { PatientRecord } from '@/lib/mock/doctor';
import { cn } from '@/lib/utils';
import patients from '@/routes/patients';

interface PatientsIndexProps {
    // Phase 2 wires this from PatientController@index. Optional for the UI port.
    patients?: { data: PatientRecord[]; total: number };
}

export default function PatientsIndex({
    patients: paginated,
}: PatientsIndexProps) {
    const { t, lang } = useDoctorLang();
    const { slug: locale } = useLocale();
    const data = paginated?.data ?? DOCTOR_MOCK.patients;
    const total = paginated?.total ?? data.length * 247;

    const [query, setQuery] = useState('');
    const filtered = data.filter((p) => {
        if (!query.trim()) {
            return true;
        }

        const needle = query.toLowerCase();

        return (
            p.name.en.toLowerCase().includes(needle) ||
            p.name.fr.toLowerCase().includes(needle) ||
            p.name.ar.includes(query) ||
            p.id.toLowerCase().includes(needle) ||
            p.phone.toLowerCase().includes(needle)
        );
    });

    return (
        <>
            <Head title={t.patients} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.patients}
                    description={`${total} active patients across 2 branches`}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Download className="size-3.5" />
                                Export
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                                asChild
                            >
                                <Link href={patients.create.url({ locale })}>
                                    <Plus className="size-3.5" />
                                    New patient
                                </Link>
                            </Button>
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
                                placeholder="Search by name, phone, ID…"
                                className="h-9 w-full rounded-md border border-transparent bg-muted ps-9 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Filter className="size-3.5" />
                                All branches
                            </Button>
                            <Button variant="outline" size="sm">
                                All insurance
                            </Button>
                            <Button variant="outline" size="sm">
                                All conditions
                            </Button>
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
                                    {t.blood_type}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.phone}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.insurance}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.last_visit}
                                </TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        No patients match your search.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtered.map((p) => (
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
                                                {p.name.en
                                                    .split(' ')
                                                    .map((s) => s[0])
                                                    .join('')}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[13px] font-medium">
                                                    {p.name[lang]}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {p.gender === 'male'
                                                        ? t.male
                                                        : t.female}
                                                </div>
                                            </div>
                                            {p.flag === 'new' && (
                                                <StatusPill tone="olive">
                                                    New
                                                </StatusPill>
                                            )}
                                            {p.flag === 'chronic' && (
                                                <StatusPill tone="warning">
                                                    Chronic
                                                </StatusPill>
                                            )}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {p.id}
                                    </TableCell>
                                    <TableCell className="text-[13px] tabular-nums">
                                        {p.age}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill tone="danger">
                                            {p.blood}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {p.phone}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {p.insurance}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {p.last_visit}
                                    </TableCell>
                                    <TableCell>
                                        <ChevronRight className="size-3.5 text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </SectionCard>
            </div>
        </>
    );
}
