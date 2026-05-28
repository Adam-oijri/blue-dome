import { Head } from '@inertiajs/react';
import { Building2, LayoutGrid, MapPin, Phone, Plus } from 'lucide-react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { StatusPill } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { cn } from '@/lib/utils';

const BRANCHES: {
    id: string;
    key: 'casa' | 'rabat';
    main: boolean;
    pin: string;
    addr: { en: string; fr: string; ar: string };
    phone: string;
    hrs: string;
    doctors: number;
    staff: number;
    todayAppts: number;
}[] = [
    {
        id: 'b1',
        key: 'casa',
        main: true,
        pin: 'C',
        addr: {
            en: '12 Rue Ibn Khaldoun, Maârif, Casablanca',
            fr: '12 Rue Ibn Khaldoun, Maârif, Casablanca',
            ar: '12 شارع ابن خلدون، المعاريف، الدار البيضاء',
        },
        phone: '+212 5 22 47 81 03',
        hrs: 'Mon–Fri · 08:00–19:00 · Sat · 09:00–13:00',
        doctors: 2,
        staff: 4,
        todayAppts: 24,
    },
    {
        id: 'b2',
        key: 'rabat',
        main: false,
        pin: 'R',
        addr: {
            en: '8 Av. Mohamed V, Agdal, Rabat',
            fr: '8 Av. Mohamed V, Agdal, Rabat',
            ar: '8 شارع محمد الخامس، أكدال، الرباط',
        },
        phone: '+212 5 37 68 24 91',
        hrs: 'Mon–Fri · 09:00–18:00',
        doctors: 1,
        staff: 2,
        todayAppts: 9,
    },
];

export default function SecretaryBranches() {
    const { t, lang } = useSecretaryLang();

    return (
        <>
            <Head title={t.nav_branches} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_branches}
                    description="2 locations · 3 doctors · 6 staff · 33 appointments today"
                    actions={
                        <Button
                            size="sm"
                            className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                        >
                            <Plus className="size-3.5" />
                            New branch
                        </Button>
                    }
                />

                <div className="grid gap-4 md:grid-cols-2">
                    {BRANCHES.map((b) => (
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
                                    {b.pin}
                                    <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-olive-600/60" />
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-navy-900">
                                        {b.key === 'casa'
                                            ? t.branch_casa
                                            : t.branch_rabat}
                                    </h3>
                                    {b.main && (
                                        <StatusPill tone="olive">
                                            Main
                                        </StatusPill>
                                    )}
                                </div>

                                <div className="space-y-2 text-[13px]">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                        <span>{b.addr[lang]}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                                        <span className="font-mono text-[12px]">
                                            {b.phone}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                        <span className="text-[12px] text-muted-foreground">
                                            {b.hrs}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 border-y border-border py-3">
                                    {[
                                        ['Doctors', b.doctors],
                                        ['Staff', b.staff],
                                        [
                                            "Today's appts",
                                            b.todayAppts,
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

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-2"
                                >
                                    <LayoutGrid className="size-3.5" />
                                    View dashboard
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
