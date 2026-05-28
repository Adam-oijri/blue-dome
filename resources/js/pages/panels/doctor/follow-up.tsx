import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Check,
    Clock,
    FileText,
    MessageCircle,
    MessageSquare,
    Phone,
} from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { cn } from '@/lib/utils';

type CallStatus =
    | 'pending'
    | 'no_answer'
    | 'completed'
    | 'rescheduled'
    | 'wrong_number';

const CALLS: {
    name: string;
    phone: string;
    appt: string;
    reason: string;
    attempts: number;
    max: number;
    status: CallStatus;
    lastTry: string;
}[] = [
    {
        name: 'Omar Chraibi',
        phone: '+212 6 67 99 88 77',
        appt: 'May 6 · 14:00',
        reason: 'ECG review',
        attempts: 1,
        max: 3,
        status: 'pending',
        lastTry: 'Yesterday 16:20',
    },
    {
        name: 'Latifa Ouazzani',
        phone: '+212 6 68 12 34 56',
        appt: 'May 6 · 14:30',
        reason: 'Stress test',
        attempts: 2,
        max: 3,
        status: 'no_answer',
        lastTry: 'Today 09:15',
    },
    {
        name: 'Karim Sabri',
        phone: '+212 6 69 87 65 43',
        appt: 'May 6 · 15:30',
        reason: 'HTN follow-up',
        attempts: 0,
        max: 3,
        status: 'pending',
        lastTry: '—',
    },
    {
        name: 'Nadia Filali',
        phone: '+212 6 60 11 22 33',
        appt: 'May 6 · 16:00',
        reason: 'Palpitations',
        attempts: 1,
        max: 3,
        status: 'rescheduled',
        lastTry: 'Today 10:30',
    },
    {
        name: 'Youssef Bennani',
        phone: '+212 6 11 22 33 44',
        appt: 'May 7 · 09:00',
        reason: 'Follow-up',
        attempts: 0,
        max: 3,
        status: 'pending',
        lastTry: '—',
    },
    {
        name: 'Sara Tazi',
        phone: '+212 6 22 33 44 55',
        appt: 'May 7 · 10:30',
        reason: 'Lab review',
        attempts: 3,
        max: 3,
        status: 'wrong_number',
        lastTry: 'Today 11:00',
    },
];

const STATUS: Record<CallStatus, { tone: StatusTone; label: string }> = {
    pending: { tone: 'warning', label: 'Pending' },
    no_answer: { tone: 'neutral', label: 'No answer' },
    completed: { tone: 'success', label: 'Confirmed' },
    rescheduled: { tone: 'info', label: 'Rescheduled' },
    wrong_number: { tone: 'danger', label: 'Wrong #' },
};

const OUTCOMES: { tone: StatusTone; label: string }[] = [
    { tone: 'success', label: 'Confirmed by patient' },
    { tone: 'info', label: 'Wants to reschedule' },
    { tone: 'warning', label: 'No answer — will retry' },
    { tone: 'danger', label: 'Wrong number' },
    { tone: 'neutral', label: 'Patient cancelled' },
];

export default function DoctorFollowUp() {
    const { t } = useDoctorLang();

    return (
        <>
            <Head title={t.follow_up} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.follow_up}
                    description="Patients who didn't confirm via WhatsApp · 5 calls in queue · 2 needing reattempt"
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <MessageCircle className="size-3.5" />
                                Re-send WhatsApp
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Phone className="size-3.5" />
                                Start calling
                            </Button>
                        </>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <KpiCard
                        label="In queue"
                        value="5"
                        icon={Phone}
                        tone="warn"
                    />
                    <KpiCard
                        label="No answer (retry)"
                        value="2"
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label="Confirmed today"
                        value="11"
                        icon={Check}
                        tone="success"
                    />
                    <KpiCard
                        label="Avg. attempts"
                        value="1.4"
                        icon={Clock}
                        tone="navy"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <SectionCard
                        title="Call queue"
                        titleIcon={<Phone className="size-4" />}
                        actions={
                            <span className="text-[12px] text-muted-foreground">
                                Sorted by appointment time
                            </span>
                        }
                        bodyClassName="space-y-1.5 p-2"
                    >
                        {CALLS.map((c, i) => {
                            const s = STATUS[c.status];
                            const reachedMax = c.attempts >= c.max;

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        'rounded-lg border border-border p-3.5',
                                        c.status === 'pending'
                                            ? 'bg-card'
                                            : 'bg-muted',
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-700 text-sm font-semibold text-white">
                                            {c.name
                                                .split(' ')
                                                .map((p) => p[0])
                                                .join('')}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="text-[13px] font-semibold">
                                                    {c.name}
                                                </div>
                                                <StatusPill tone={s.tone}>
                                                    {s.label}
                                                </StatusPill>
                                            </div>
                                            <div className="mt-0.5 text-[12px] text-muted-foreground">
                                                {c.appt} · {c.reason}
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                                                <span className="flex items-center gap-1 text-muted-foreground">
                                                    <Phone className="size-3" />
                                                    {c.phone}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    ·
                                                </span>
                                                <span className="text-muted-foreground">
                                                    Attempts:{' '}
                                                    <span
                                                        className={cn(
                                                            'font-semibold tabular-nums',
                                                            reachedMax
                                                                ? 'text-danger'
                                                                : 'text-foreground',
                                                        )}
                                                    >
                                                        {c.attempts}/{c.max}
                                                    </span>
                                                </span>
                                                <span className="text-muted-foreground">
                                                    ·
                                                </span>
                                                <span className="text-muted-foreground">
                                                    Last try: {c.lastTry}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                            >
                                                <MessageSquare className="size-3.5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                                            >
                                                <Phone className="size-3.5" />
                                                Call now
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </SectionCard>

                    <SectionCard
                        title="Call script"
                        titleIcon={<FileText className="size-4" />}
                        bodyClassName="p-4"
                    >
                        <div className="mb-1.5 text-[11px] tracking-wider text-muted-foreground uppercase">
                            For confirmation
                        </div>
                        <div className="mb-4 rounded-lg bg-muted p-3 text-[12px] leading-relaxed">
                            "Bonjour, je vous appelle de la part du Dr. Lahlou
                            pour confirmer votre rendez-vous demain à 14h00.
                            Pourrez-vous être présent ?"
                        </div>
                        <div className="mb-1.5 text-[11px] tracking-wider text-muted-foreground uppercase">
                            Quick outcomes
                        </div>
                        <div className="flex flex-col gap-2">
                            {OUTCOMES.map((o) => (
                                <Button
                                    key={o.label}
                                    variant="outline"
                                    className="h-auto justify-start py-2"
                                >
                                    <StatusPill tone={o.tone}>
                                        {o.label}
                                    </StatusPill>
                                </Button>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}
