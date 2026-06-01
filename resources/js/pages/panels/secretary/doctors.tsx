import { Head } from '@inertiajs/react';
import { Check, Heart, Stethoscope } from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { cn } from '@/lib/utils';

type DoctorState = 'in_consult' | 'available' | 'off';

type DoctorRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    is_active: boolean;
    specialty: string | null;
    today_count: number;
    week_count: number;
    state: DoctorState;
    week_load: number[];
};

interface Props {
    doctors: DoctorRow[];
    clinic_name: string | null;
}

const STATE_META: Record<DoctorState, { tone: StatusTone; labelKey: string }> = {
    in_consult: { tone: 'info', labelKey: 'wr_status_in_room' },
    available: { tone: 'success', labelKey: 'status_active' },
    off: { tone: 'neutral', labelKey: 'status_inactive' },
};

const fullName = (d: DoctorRow): string =>
    `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() || d.email;

const initials = (name: string): string =>
    name
        .replace(/^Dr\.?\s*/i, '')
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

export default function SecretaryDoctors({ doctors }: Props) {
    const { t } = useSecretaryLang();

    const onDuty = doctors.filter((d) => d.state !== 'off').length;
    const specialties = new Set(
        doctors.map((d) => d.specialty).filter((s): s is string => !!s),
    ).size;

    return (
        <>
            <Head title={t.nav_doctors} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_doctors}
                    description={t.doctors_all}
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                    <KpiCard
                        label={t.doctors_label}
                        value={String(doctors.length)}
                        icon={Stethoscope}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.doc_on_duty}
                        value={String(onDuty)}
                        icon={Check}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.doc_specialties}
                        value={String(specialties)}
                        icon={Heart}
                        tone="success"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {doctors.map((d) => {
                        const meta = STATE_META[d.state];
                        const name = fullName(d);
                        const hue =
                            d.id.charCodeAt(0) % 2 === 0 ? 'navy' : 'olive';
                        const maxLoad = Math.max(...d.week_load, 1);

                        return (
                            <div
                                key={d.id}
                                className="rounded-xl border border-border bg-card p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            'grid size-12 shrink-0 place-items-center rounded-full text-base font-semibold text-white',
                                            hue === 'navy'
                                                ? 'bg-navy-700'
                                                : 'bg-olive-600',
                                        )}
                                    >
                                        {initials(name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[14px] font-semibold">
                                            {name}
                                        </div>
                                        <div className="text-[12px] text-muted-foreground">
                                            {d.specialty ?? '—'}
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <StatusPill tone={meta.tone} withDot>
                                                {t[meta.labelKey]}
                                            </StatusPill>
                                            <span className="truncate text-[11px] text-muted-foreground">
                                                {d.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-3 gap-2 border-y border-border py-3">
                                    {[
                                        [t.today, d.today_count],
                                        [t.doc_week, d.week_count],
                                        [
                                            t.wr_col_status,
                                            d.is_active
                                                ? t.status_active
                                                : t.status_inactive,
                                        ],
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
                                        {t.doc_week_load}
                                    </div>
                                    <div className="flex items-end gap-1">
                                        {d.week_load.map((v, i) => (
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
                                                            : `color-mix(in oklab, ${hue === 'navy' ? '#1e3a5f' : '#6f8536'} ${20 + (v / maxLoad) * 70}%, transparent)`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-1 flex font-mono text-[9px] text-muted-foreground/60">
                                        {['6', '5', '4', '3', '2', '1', '0'].map(
                                            (x, i) => (
                                                <span
                                                    key={i}
                                                    className="flex-1 text-center"
                                                >
                                                    {x}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {doctors.length === 0 && (
                        <div className="col-span-full rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
                            {t.empty_none}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
