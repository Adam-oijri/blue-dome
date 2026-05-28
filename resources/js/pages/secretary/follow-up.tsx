import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    Check,
    CheckCheck,
    Phone,
    RefreshCcw,
} from 'lucide-react';

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
import { findPatient, localName } from '@/lib/mock/secretary';
import { cn } from '@/lib/utils';

type Priority = 'high' | 'med' | 'low';

const CALLS: {
    p: string;
    reason: { en: string; fr: string; ar: string };
    phone: string;
    attempts: number;
    last: string;
    priority: Priority;
}[] = [
    {
        p: 'p8',
        reason: {
            en: 'WhatsApp failed ×2',
            fr: 'Échec WhatsApp ×2',
            ar: 'فشل واتساب ×2',
        },
        phone: '+212 6 22 81 49 30',
        attempts: 0,
        last: '—',
        priority: 'high',
    },
    {
        p: 'p10',
        reason: {
            en: 'WhatsApp failed ×3',
            fr: 'Échec WhatsApp ×3',
            ar: 'فشل واتساب ×3',
        },
        phone: '+212 6 18 32 71 04',
        attempts: 1,
        last: 'Yesterday 16:20',
        priority: 'high',
    },
    {
        p: 'p3',
        reason: {
            en: 'No WhatsApp reply 24h',
            fr: 'Sans réponse 24h',
            ar: 'بدون رد 24س',
        },
        phone: '+212 6 65 90 12 88',
        attempts: 2,
        last: 'Today 09:15',
        priority: 'med',
    },
    {
        p: 'p4',
        reason: {
            en: 'Reschedule needed',
            fr: 'Reporter le RDV',
            ar: 'إعادة جدولة',
        },
        phone: '+212 5 22 47 81 03',
        attempts: 0,
        last: '—',
        priority: 'med',
    },
    {
        p: 'p6',
        reason: {
            en: 'Test results — recall',
            fr: 'Résultats — rappel',
            ar: 'نتائج التحاليل',
        },
        phone: '+212 6 71 04 28 19',
        attempts: 1,
        last: 'Yesterday 14:00',
        priority: 'high',
    },
    {
        p: 'p9',
        reason: {
            en: 'Post-procedure check',
            fr: 'Suivi post-procédure',
            ar: 'متابعة بعد الإجراء',
        },
        phone: '+212 6 33 15 80 92',
        attempts: 0,
        last: '—',
        priority: 'low',
    },
];

export default function SecretaryFollowUp() {
    // Phase 2 will wire follow_ups from FollowUpController@index.
    const { t, lang } = useSecretaryLang();

    return (
        <>
            <Head title={t.nav_followups} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_followups}
                    description="6 patients to call today · 4 high priority · Average 1.8 attempts per patient"
                    actions={
                        <Button variant="outline" size="sm" className="gap-2">
                            <Archive className="size-3.5" />
                            Export
                        </Button>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label="Pending"
                        value="6"
                        icon={Phone}
                        tone="warn"
                    />
                    <KpiCard
                        label="Completed today"
                        value="11"
                        icon={CheckCheck}
                        tone="success"
                        trend={{ value: '+27%', direction: 'up' }}
                    />
                    <KpiCard
                        label="No answer"
                        value="4"
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label="Avg. attempts"
                        value="1.8"
                        icon={RefreshCcw}
                        tone="navy"
                    />
                </div>

                <SectionCard
                    title="Call queue"
                    titleIcon={<Phone className="size-4" />}
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    Patient
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Reason
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Phone
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Attempts
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Last try
                                </TableHead>
                                <TableHead className="w-44" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {CALLS.map((r, i) => {
                                const p = findPatient(r.p);

                                if (!p) {
                                    return null;
                                }

                                return (
                                    <TableRow
                                        key={i}
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
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                                        {r.priority ===
                                                            'high' && (
                                                            <StatusPill tone="danger">
                                                                Priority
                                                            </StatusPill>
                                                        )}
                                                        <StatusPill tone="danger">
                                                            {p.blood}
                                                        </StatusPill>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {r.reason[lang]}
                                        </TableCell>
                                        <TableCell className="font-mono text-[11px]">
                                            {r.phone}
                                        </TableCell>
                                        <TableCell className="text-[13px] font-semibold tabular-nums">
                                            {r.attempts}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {r.last}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    size="sm"
                                                    className="h-7 gap-1 bg-navy-900 text-[11px] text-white hover:bg-navy-800"
                                                >
                                                    <Phone className="size-3" />
                                                    Call
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 gap-1 text-[11px]"
                                                >
                                                    <Check className="size-3" />
                                                    Done
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </SectionCard>
            </div>
        </>
    );
}
