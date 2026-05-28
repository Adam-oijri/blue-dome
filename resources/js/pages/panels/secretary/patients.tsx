import { Head } from '@inertiajs/react';
import {
    Archive,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Heart,
    Search,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState } from 'react';

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
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { SECRETARY_MOCK, localName } from '@/lib/mock/secretary';
import { cn } from '@/lib/utils';

const LAST_VISITS = [
    '12 Apr 2026',
    '28 Mar 2026',
    '04 Apr 2026',
    '30 Apr 2026',
    '19 Mar 2026',
    '02 May 2026',
    '11 Apr 2026',
    '25 Apr 2026',
    '08 Apr 2026',
    '30 Apr 2026',
];
const NEXT_APPTS = [
    '—',
    '6 May',
    '—',
    '12 May',
    '—',
    '—',
    '6 May',
    '20 May',
    '—',
    '6 May',
];

export default function SecretaryPatients() {
    const { t, lang } = useSecretaryLang();
    const [filter, setFilter] = useState<
        'all' | 'chronic' | 'insured' | 'bday'
    >('all');
    const list = SECRETARY_MOCK.patients;
    const visible = filter === 'chronic' ? list.filter((p) => p.chronic) : list;

    return (
        <>
            <Head title={t.nav_patients} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_patients}
                    description="3,248 patients across 2 branches · 47 new this month"
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Archive className="size-3.5" />
                                Export
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <UserPlus className="size-3.5" />
                                New patient
                            </Button>
                        </>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label="Total patients"
                        value="3,248"
                        icon={Users}
                        tone="navy"
                        trend={{ value: '+1.5%', direction: 'up' }}
                    />
                    <KpiCard
                        label="New this month"
                        value="47"
                        icon={UserPlus}
                        tone="olive"
                    />
                    <KpiCard
                        label="Chronic care"
                        value="412"
                        icon={Heart}
                        tone="warn"
                    />
                    <KpiCard
                        label="Birthdays this week"
                        value="9"
                        icon={CalendarIcon}
                        tone="navy"
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                        <div className="relative max-w-[280px] flex-1">
                            <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                placeholder="Search patients…"
                                className="h-8 w-full rounded-md border border-transparent bg-muted ps-8 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {(
                                [
                                    ['all', 'All', list.length],
                                    [
                                        'chronic',
                                        'Chronic care',
                                        list.filter((p) => p.chronic).length,
                                    ],
                                    ['insured', 'Insured', list.length],
                                    ['bday', 'Birthday this week', 3],
                                ] as const
                            ).map(([id, label, ct]) => (
                                <Button
                                    key={id}
                                    variant={
                                        filter === id ? 'default' : 'ghost'
                                    }
                                    size="sm"
                                    onClick={() => setFilter(id)}
                                    className={cn(
                                        'gap-1.5',
                                        filter === id
                                            ? 'bg-navy-900 text-white hover:bg-navy-800'
                                            : '',
                                    )}
                                >
                                    {label}
                                    <span className="text-[11px] tabular-nums opacity-70">
                                        {ct}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    Patient
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Age
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Contact
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Insurance
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Last visit
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Next appt
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Tags
                                </TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visible.map((p, i) => {
                                const phoneSuffix = String(
                                    10000000 +
                                        ((p.id.charCodeAt(1) * 73) % 90000000),
                                ).padStart(8, '0');
                                const phone = `+212 6 ${phoneSuffix.slice(0, 2)} ${phoneSuffix.slice(2, 4)} ${phoneSuffix.slice(4, 6)} ${phoneSuffix.slice(6, 8)}`;
                                const next = NEXT_APPTS[i] ?? '—';

                                return (
                                    <TableRow
                                        key={p.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={cn(
                                                        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                        p.gender === 'm'
                                                            ? 'bg-navy-700'
                                                            : 'bg-olive-600',
                                                    )}
                                                >
                                                    {p.initials}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-semibold">
                                                        {localName(p, lang)}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground tabular-nums">
                                                        #{1000 + i * 7} ·{' '}
                                                        {p.gender === 'f'
                                                            ? 'F'
                                                            : 'M'}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px] tabular-nums">
                                            {p.age}
                                        </TableCell>
                                        <TableCell className="font-mono text-[11px] text-muted-foreground">
                                            {phone}
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {p.insurance}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {LAST_VISITS[i] ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-[12px] tabular-nums">
                                            {next === '—' ? (
                                                <span className="text-muted-foreground/60">
                                                    —
                                                </span>
                                            ) : (
                                                <span className="font-semibold text-olive-700">
                                                    {next}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                <StatusPill tone="danger">
                                                    {p.blood}
                                                </StatusPill>
                                                {p.chronic && (
                                                    <StatusPill tone="warning">
                                                        Chronic
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
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[12px] text-muted-foreground">
                        <span>
                            Showing 1–{visible.length} of 3,248 patients
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                            >
                                <ChevronLeft className="size-3" />
                            </Button>
                            <Button
                                size="sm"
                                className="size-7 bg-navy-900 text-white hover:bg-navy-800"
                            >
                                1
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="size-7"
                            >
                                2
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="size-7"
                            >
                                3
                            </Button>
                            <span className="px-1">…</span>
                            <Button variant="ghost" size="sm" className="h-7">
                                325
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                            >
                                <ChevronRight className="size-3" />
                            </Button>
                        </div>
                    </div>
                </SectionCard>
            </div>
        </>
    );
}
