import { Head } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    Check,
    Heart,
    MoreHorizontal,
    Plus,
    Stethoscope,
} from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import {
    SECRETARY_MOCK,
    localName,
    localSpecialty,
} from '@/lib/mock/secretary';
import { cn } from '@/lib/utils';

type DoctorState = 'in_consult' | 'available' | 'off';

const DOCS = SECRETARY_MOCK.doctors.map((d, i) => ({
    ...d,
    todayCount: [12, 14, 9][i] ?? 8,
    weekHrs: [38, 42, 30][i] ?? 35,
    rating: [4.8, 4.9, 4.7][i] ?? 4.6,
    state:
        (['in_consult', 'in_consult', 'available'] as DoctorState[])[i] ??
        'off',
    weekLoad: [
        [60, 80, 90, 70, 85, 30, 0],
        [70, 75, 95, 80, 70, 40, 0],
        [50, 60, 65, 55, 70, 0, 0],
    ][i] ?? [50, 50, 50, 50, 50, 0, 0],
}));

const STATE_META: Record<DoctorState, { tone: StatusTone; label: string }> = {
    in_consult: { tone: 'info', label: 'In consultation' },
    available: { tone: 'success', label: 'Available' },
    off: { tone: 'neutral', label: 'Off' },
};

export default function SecretaryDoctors() {
    const { t, lang } = useSecretaryLang();

    return (
        <>
            <Head title={t.nav_doctors} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_doctors}
                    description="3 doctors across 2 branches · 100% on schedule today"
                    actions={
                        <Button
                            size="sm"
                            className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                        >
                            <Plus className="size-3.5" />
                            Add doctor
                        </Button>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label="Total doctors"
                        value="3"
                        icon={Stethoscope}
                        tone="navy"
                    />
                    <KpiCard
                        label="On duty today"
                        value="3"
                        icon={Check}
                        tone="olive"
                    />
                    <KpiCard
                        label="Specialties"
                        value="3"
                        icon={Heart}
                        tone="navy"
                    />
                    <KpiCard
                        label="Branches"
                        value="2"
                        icon={CalendarIcon}
                        tone="warn"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {DOCS.map((d) => {
                        const meta = STATE_META[d.state];
                        const branchKey = SECRETARY_MOCK.branches.find(
                            (b) => b.id === d.branch,
                        )?.key;

                        return (
                            <div
                                key={d.id}
                                className="rounded-xl border border-border bg-card p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            'grid size-12 shrink-0 place-items-center rounded-full text-base font-semibold text-white',
                                            d.hue === 'navy'
                                                ? 'bg-navy-700'
                                                : 'bg-olive-600',
                                        )}
                                    >
                                        {d.initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[14px] font-semibold">
                                            {localName(d, lang)}
                                        </div>
                                        <div className="text-[12px] text-muted-foreground">
                                            {localSpecialty(d, lang)}
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <StatusPill
                                                tone={meta.tone}
                                                withDot
                                            >
                                                {meta.label}
                                            </StatusPill>
                                            <span className="text-[11px] text-muted-foreground">
                                                ·{' '}
                                                {branchKey === 'casa'
                                                    ? 'Casablanca'
                                                    : 'Rabat'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-3 gap-2 border-y border-border py-3">
                                    {[
                                        ['Today', d.todayCount],
                                        ['Week', `${d.weekHrs}h`],
                                        ['Rating', d.rating],
                                    ].map(([k, v]) => (
                                        <div key={k as string}>
                                            <div className="text-base font-semibold tabular-nums">
                                                {v}
                                            </div>
                                            <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                                {k}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3">
                                    <div className="mb-2 text-[10px] tracking-wider text-muted-foreground uppercase">
                                        This week's load
                                    </div>
                                    <div className="flex gap-1">
                                        {d.weekLoad.map((v, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'flex-1 rounded-sm',
                                                    v === 0 && 'bg-muted',
                                                )}
                                                style={{
                                                    height: 28,
                                                    background:
                                                        v === 0
                                                            ? undefined
                                                            : `color-mix(in oklab, ${d.hue === 'navy' ? '#1e3a5f' : '#6f8536'} ${20 + v * 0.7}%, transparent)`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-1 flex font-mono text-[9px] text-muted-foreground/60">
                                        {[
                                            'M',
                                            'T',
                                            'W',
                                            'T',
                                            'F',
                                            'S',
                                            'S',
                                        ].map((x, i) => (
                                            <span
                                                key={i}
                                                className="flex-1 text-center"
                                            >
                                                {x}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 gap-1.5"
                                    >
                                        <CalendarIcon className="size-3.5" />
                                        View schedule
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                    >
                                        <MoreHorizontal className="size-3.5" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
