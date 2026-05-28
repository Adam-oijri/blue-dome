import { Head } from '@inertiajs/react';
import { CheckCheck, MessageCircle, RefreshCcw, Send, X } from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import {
    SECRETARY_MOCK,
    findDoctor,
    findPatient,
    localName,
} from '@/lib/mock/secretary';
import { cn } from '@/lib/utils';

const WA_STATUS_TONE: Record<string, StatusTone> = {
    seen: 'info',
    delivered: 'neutral',
    sent: 'neutral',
    failed: 'danger',
    confirmed: 'success',
};

const TEMPLATES = [
    {
        name: 'appointment_reminder_24h',
        body: 'Bonjour {{1}}, rappel de votre RDV…',
        lang: 'fr-MA',
        status: 'approved',
        used: 1248,
    },
    {
        name: 'appointment_reminder_24h_ar',
        body: 'مرحبًا {{1}}، تذكير بموعدك…',
        lang: 'ar-MA',
        status: 'approved',
        used: 890,
    },
    {
        name: 'confirmation_request',
        body: 'Veuillez confirmer votre RDV…',
        lang: 'fr-MA',
        status: 'approved',
        used: 754,
    },
    {
        name: 'directions_parking',
        body: "Voici l'adresse et instructions…",
        lang: 'fr-MA',
        status: 'approved',
        used: 421,
    },
    {
        name: 'test_results_ready',
        body: "Vos résultats d'analyse sont disponibles…",
        lang: 'fr-MA',
        status: 'pending',
        used: 0,
    },
    {
        name: 'post_visit_followup',
        body: 'Comment vous sentez-vous depuis votre visite?',
        lang: 'fr-MA',
        status: 'approved',
        used: 198,
    },
];

export default function SecretaryWhatsApp() {
    const { t, lang } = useSecretaryLang();
    const all = SECRETARY_MOCK.whatsapp;

    return (
        <>
            <Head title={t.nav_whatsapp} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_whatsapp}
                    description="186 messages sent today · 93.5% delivery rate · 76.3% read rate"
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <RefreshCcw className="size-3.5" />
                                Sync
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Send className="size-3.5" />
                                Send template
                            </Button>
                        </>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label="Sent today"
                        value="186"
                        icon={Send}
                        tone="navy"
                        trend={{ value: '+15%', direction: 'up' }}
                    />
                    <KpiCard
                        label="Delivered"
                        value="174"
                        icon={CheckCheck}
                        tone="navy"
                    />
                    <KpiCard
                        label="Read"
                        value="142"
                        icon={CheckCheck}
                        tone="success"
                    />
                    <KpiCard
                        label="Failed"
                        value="12"
                        icon={X}
                        tone="warn"
                        trend={{ value: '-2.1%', direction: 'up' }}
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <Tabs defaultValue="outbox">
                        <TabsList className="h-auto w-full justify-start rounded-none border-b border-border bg-transparent p-0">
                            {[
                                ['inbox', 'Inbox', 3],
                                ['outbox', 'Outbox', 10],
                                ['templates', 'Templates', TEMPLATES.length],
                                ['log', 'Log', null],
                            ].map(([id, label, ct]) => (
                                <TabsTrigger
                                    key={id as string}
                                    value={id as string}
                                    className="h-auto rounded-none border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-muted-foreground shadow-none data-[state=active]:border-olive-600 data-[state=active]:bg-transparent data-[state=active]:text-navy-900 data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent"
                                >
                                    {label}
                                    {ct !== null && (
                                        <span className="ms-1.5 text-[11px] text-muted-foreground tabular-nums">
                                            {ct as number}
                                        </span>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="outbox" className="m-0">
                            <ul className="divide-y divide-border">
                                {all.map((row, i) => {
                                    const p = findPatient(row.patient);
                                    const d = findDoctor(row.doctor);

                                    if (!p || !d) {
                                        return null;
                                    }

                                    const stale = row.retries >= 2;
                                    const failed = row.status === 'failed';

                                    return (
                                        <li
                                            key={i}
                                            className="space-y-2 px-5 py-3.5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        'grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white',
                                                        p.gender === 'm'
                                                            ? 'bg-navy-700'
                                                            : 'bg-olive-600',
                                                    )}
                                                >
                                                    {p.initials}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[13px] font-semibold">
                                                        {localName(p, lang)}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {localName(
                                                            d,
                                                            lang,
                                                        ).replace(
                                                            /^(Dr\.|د\.)\s*/,
                                                            '',
                                                        )}{' '}
                                                        · {row.apptTime}
                                                    </div>
                                                </div>
                                                <StatusPill
                                                    tone={
                                                        WA_STATUS_TONE[
                                                            row.status
                                                        ]
                                                    }
                                                    withDot
                                                >
                                                    {t[
                                                        `wa_status_${row.status}`
                                                    ] ?? row.status}
                                                </StatusPill>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px]">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    {row.status === 'failed' ? (
                                                        <X className="size-3 text-danger" />
                                                    ) : row.status === 'seen' ||
                                                      row.status ===
                                                          'confirmed' ? (
                                                        <CheckCheck className="size-3 text-info" />
                                                    ) : (
                                                        <CheckCheck className="size-3 text-muted-foreground" />
                                                    )}
                                                    Sent at {row.sentAt}
                                                    {row.retries > 0 &&
                                                        ` · retry ${row.retries}`}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {failed ? (
                                                        <Button
                                                            size="sm"
                                                            className="h-7 gap-1 bg-olive-600 text-[11px] text-white hover:bg-olive-700"
                                                        >
                                                            <RefreshCcw className="size-3" />
                                                            Resend
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 gap-1 text-[11px]"
                                                        >
                                                            <Send className="size-3" />
                                                            Send template
                                                        </Button>
                                                    )}
                                                    {(failed || stale) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 gap-1 border-danger text-[11px] text-danger hover:bg-danger-soft"
                                                        >
                                                            Move to call
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </TabsContent>

                        <TabsContent value="templates" className="m-0">
                            <div className="grid grid-cols-[2fr_120px_120px_120px_80px] gap-4 border-b bg-muted/50 px-5 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                <div>Template</div>
                                <div>Lang</div>
                                <div>Status</div>
                                <div>Used</div>
                                <div />
                            </div>
                            {TEMPLATES.map((tp) => (
                                <div
                                    key={tp.name}
                                    className="grid grid-cols-[2fr_120px_120px_120px_80px] items-center gap-4 border-b border-border px-5 py-3 last:border-b-0"
                                >
                                    <div>
                                        <div className="font-mono text-[12px] font-semibold">
                                            {tp.name}
                                        </div>
                                        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                            {tp.body}
                                        </div>
                                    </div>
                                    <div className="font-mono text-[12px]">
                                        {tp.lang}
                                    </div>
                                    <div>
                                        <StatusPill
                                            tone={
                                                tp.status === 'approved'
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                            withDot
                                        >
                                            {tp.status}
                                        </StatusPill>
                                    </div>
                                    <div className="text-[13px] font-semibold tabular-nums">
                                        {tp.used.toLocaleString('en-US')}
                                    </div>
                                    <div className="text-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="inbox" className="m-0">
                            <div className="flex items-center justify-center gap-2 py-16 text-center text-[13px] text-muted-foreground">
                                <MessageCircle className="size-4" />3 new
                                inbound replies — implementation coming
                            </div>
                        </TabsContent>

                        <TabsContent value="log" className="m-0">
                            <div className="py-16 text-center text-[13px] text-muted-foreground">
                                Full message log — wiring pending
                            </div>
                        </TabsContent>
                    </Tabs>
                </SectionCard>
            </div>
        </>
    );
}
