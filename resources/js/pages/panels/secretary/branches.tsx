import { Head } from '@inertiajs/react';
import { Building2, MapPin, Phone } from 'lucide-react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { StatusPill } from '@/components/blue-dome/status-pill';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { cn } from '@/lib/utils';

type Branch = {
    id: string;
    branch_name: string;
    branch_code: string;
    is_main: boolean;
    phone: string | null;
    address: string | null;
    city: string | null;
    working_hours: Record<string, unknown> | null;
    is_active: boolean;
    doctors: number;
    staff: number;
    patients: number;
    today_appts: number;
};

interface Props {
    branches: Branch[];
    totals: {
        locations: number;
        doctors: number;
        staff: number;
        today_appts: number;
    };
}

const pinLetter = (name: string): string =>
    name.trim().charAt(0).toUpperCase() || '?';

/**
 * Render `working_hours` JSONB as a compact day → time summary. The shape isn't
 * fixed, so we defensively accept either a `"09:00-18:00"` string or an
 * `{ open, close }` object per day and skip anything we can't read. Returns '—'
 * when there's nothing meaningful to show (the column defaults to `{}`).
 */
const workingHoursSummary = (
    hours: Record<string, unknown> | null | undefined,
): string => {
    if (!hours || typeof hours !== 'object') {
        return '—';
    }

    const parts: string[] = [];

    for (const [day, value] of Object.entries(hours)) {
        const label = day.slice(0, 3);

        if (typeof value === 'string' && value.trim() !== '') {
            parts.push(`${label} ${value.trim()}`);
        } else if (
            value &&
            typeof value === 'object' &&
            'open' in value &&
            'close' in value
        ) {
            const { open, close } = value as { open: unknown; close: unknown };

            if (open != null && close != null) {
                parts.push(`${label} ${String(open)}–${String(close)}`);
            }
        }
    }

    return parts.length > 0 ? parts.join(' · ') : '—';
};

export default function SecretaryBranches({ branches, totals }: Props) {
    const { t } = useSecretaryLang();

    const description = `${totals.locations} ${t.br_locations} · ${totals.doctors} ${t.nav_doctors} · ${totals.staff} ${t.br_staff} · ${totals.today_appts} ${t.br_appointments_today}`;

    return (
        <>
            <Head title={t.nav_branches} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader title={t.nav_branches} description={description} />

                <div className="grid gap-4 md:grid-cols-2">
                    {branches.length === 0 && (
                        <div className="col-span-full rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                            {t.empty_none}
                        </div>
                    )}

                    {branches.map((b) => (
                        <div
                            key={b.id}
                            className="overflow-hidden rounded-xl border border-border bg-card"
                        >
                            <div
                                className={cn(
                                    'relative h-32 bg-gradient-to-br from-navy-950 to-navy-700',
                                    'flex items-center justify-center',
                                )}
                            >
                                <div className="relative grid size-14 place-items-center rounded-full bg-gradient-to-br from-olive-500 to-olive-700 text-xl font-bold text-white shadow-lg">
                                    {pinLetter(b.branch_name)}
                                    <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-olive-600/60" />
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-navy-900">
                                        {b.branch_name}
                                    </h3>
                                    {b.is_main && (
                                        <StatusPill tone="olive">
                                            {t.br_main}
                                        </StatusPill>
                                    )}
                                </div>

                                <div className="space-y-2 text-[13px]">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                        <span>{b.address ?? '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                                        <span className="font-mono text-[12px]">
                                            {b.phone ?? '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                        <span className="text-[12px] text-muted-foreground">
                                            {workingHoursSummary(
                                                b.working_hours,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 border-y border-border py-3">
                                    {[
                                        [t.nav_doctors, b.doctors],
                                        [t.br_staff, b.staff],
                                        [
                                            t.br_appts_today,
                                            b.today_appts,
                                            'text-olive-700',
                                        ],
                                    ].map(([k, v, color]) => (
                                        <div key={k as string}>
                                            <div
                                                className={cn(
                                                    'text-lg font-semibold tabular-nums',
                                                    (color as string) ??
                                                        'text-navy-900',
                                                )}
                                            >
                                                {v}
                                            </div>
                                            <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                                {k}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
