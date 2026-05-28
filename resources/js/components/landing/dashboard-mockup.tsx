import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
} from 'framer-motion';
import { Check, MessageCircle, UserPlus } from 'lucide-react';
import { useRef } from 'react';

import { BrandIconMark } from '@/components/blue-dome/brand-icon-mark';
import { MiniKpi } from '@/components/landing/mini-kpi';
import type { SectionProps } from '@/components/landing/shared/types';
import { SidebarRow } from '@/components/landing/sidebar-row';
import { cn } from '@/lib/utils';

const WAITING_ROOM: {
    name: string;
    wait: string;
    tone: 'warn' | 'info' | 'olive';
}[] = [
    { name: 'Hassan El Amrani', wait: '32 min', tone: 'warn' },
    { name: 'Fatima Bennani', wait: '19 min', tone: 'info' },
    { name: 'Mehdi Saidi', wait: '14 min', tone: 'olive' },
];

export function DashboardMockup({ lang }: SectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const rotX = useMotionValue(0);
    const rotY = useMotionValue(0);
    const springX = useSpring(rotX, { stiffness: 120, damping: 18, mass: 0.5 });
    const springY = useSpring(rotY, { stiffness: 120, damping: 18, mass: 0.5 });
    const transform = useMotionTemplate`perspective(1400px) rotateX(${springX}deg) rotateY(${springY}deg)`;

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }

        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotY.set(px * 8);
        rotX.set(-py * 6);
    };

    const handleLeave = () => {
        rotX.set(0);
        rotY.set(0);
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="relative"
        >
            <div className="to-navy-200/30 absolute -inset-8 -z-10 rounded-[36px] bg-gradient-to-br from-olive-200/30 blur-3xl" />

            <motion.div
                style={{ transform, transformStyle: 'preserve-3d' }}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-navy-900/15"
            >
                <div className="flex items-center gap-2 bg-navy-950 px-5 py-3">
                    <span className="size-3 rounded-full bg-red-400/80" />
                    <span className="size-3 rounded-full bg-amber-400/80" />
                    <span className="size-3 rounded-full bg-emerald-400/80" />
                    <div className="ms-4 font-mono text-[11px] text-muted-foreground/70">
                        bluedome.app/secretary
                    </div>
                </div>

                <div className="grid min-h-[480px] grid-cols-[200px_minmax(0,1fr)]">
                    <div className="bg-navy-950 p-4 text-slate-300">
                        <div className="mb-4 flex items-center gap-2 border-b border-navy-800/80 pb-3">
                            <BrandIconMark size="sm" />
                            <div className="text-[11px] font-bold tracking-wide text-white">
                                BLUE DOME
                            </div>
                        </div>
                        <SidebarRow active label="Dashboard" />
                        <SidebarRow label="Appointments" badge="24" />
                        <SidebarRow label="Patients" />
                        <SidebarRow label="WhatsApp" badge="7" />
                        <SidebarRow label="Follow-ups" />
                        <div className="mt-4 border-t border-navy-800/80 pt-3">
                            <SidebarRow label="Billing" />
                            <SidebarRow label="Payments" />
                            <SidebarRow label="Reports" />
                        </div>
                    </div>

                    <div className="space-y-4 p-5">
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-[18px] font-semibold text-navy-900">
                                    {lang === 'fr'
                                        ? 'Accueil — Mardi 5 mai'
                                        : 'Front desk — Tuesday, May 5'}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                    Cabinet Dr. Lahlou · 3 doctors on schedule
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 320,
                                    damping: 18,
                                }}
                                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-navy-900 px-2.5 text-[11px] font-semibold text-white"
                            >
                                <UserPlus className="size-3" />
                                {lang === 'fr' ? 'Nouveau RDV' : 'New appt'}
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            <MiniKpi label="Today" value="24" tone="navy" />
                            <MiniKpi label="Pending" value="7" tone="warn" />
                            <MiniKpi label="Walk-ins" value="3" tone="navy" />
                            <MiniKpi label="Cash" value="2,480" tone="olive" />
                        </div>

                        <div className="rounded-lg border border-border bg-card p-3">
                            <div className="mb-2.5 flex items-center justify-between text-[12px] font-semibold text-navy-900">
                                <span>
                                    {lang === 'fr'
                                        ? "Salle d'attente"
                                        : 'Waiting room'}
                                </span>
                                <motion.span
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{
                                        duration: 1.4,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="inline-flex items-center gap-1 rounded-full bg-danger px-1.5 py-px text-[9px] font-semibold text-white"
                                >
                                    <span className="size-1 rounded-full bg-white" />
                                    LIVE
                                </motion.span>
                            </div>
                            <div className="space-y-2">
                                {WAITING_ROOM.map((r, i) => (
                                    <motion.div
                                        key={r.name}
                                        initial={{ opacity: 0, x: -8 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, amount: 0.5 }}
                                        transition={{
                                            delay: 0.6 + i * 0.12,
                                            duration: 0.5,
                                        }}
                                        className="flex items-center gap-2.5"
                                    >
                                        <div className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-700 text-[10px] font-semibold text-white">
                                            {r.name
                                                .split(' ')
                                                .map((p) => p[0])
                                                .join('')}
                                        </div>
                                        <span className="flex-1 text-[12px]">
                                            {r.name}
                                        </span>
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-px text-[10px] font-semibold',
                                                r.tone === 'warn' &&
                                                    'bg-warning-soft text-warning',
                                                r.tone === 'info' &&
                                                    'bg-info-soft text-info',
                                                r.tone === 'olive' &&
                                                    'bg-olive-100 text-olive-700',
                                            )}
                                        >
                                            {r.wait}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 30, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1, duration: 0.7 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="absolute top-1/3 -right-4 hidden w-56 rounded-xl border border-border bg-card p-3 shadow-xl shadow-navy-900/10 md:block"
            >
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="grid size-7 place-items-center rounded-full bg-emerald-100"
                    >
                        <MessageCircle className="size-3.5 text-emerald-700" />
                    </motion.div>
                    <div className="text-[11px] font-semibold">
                        {lang === 'fr' ? 'WhatsApp envoyé' : 'WhatsApp sent'}
                    </div>
                </div>
                <div className="mt-1.5 text-[11px] text-muted-foreground">
                    {lang === 'fr'
                        ? 'Rendez-vous demain · 14:00'
                        : 'Appointment tomorrow · 2:00 PM'}
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                    <Check className="size-3" /> Seen 2 min ago
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: -30, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.15, duration: 0.7 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="absolute top-20 -left-6 hidden w-52 rounded-xl border border-border bg-card p-3 shadow-xl shadow-navy-900/10 lg:block"
            >
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                    {lang === 'fr' ? 'Revenu du jour' : "Today's revenue"}
                </div>
                <div className="mt-1 text-[20px] font-semibold text-navy-900 tabular-nums">
                    4,820 MAD
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                    <span className="rounded-full bg-success-soft px-1.5 py-px text-[10px] font-semibold text-success">
                        +12%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {lang === 'fr' ? 'vs hier' : 'vs yesterday'}
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
