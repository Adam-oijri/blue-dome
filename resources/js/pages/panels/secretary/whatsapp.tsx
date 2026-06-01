import { Head } from '@inertiajs/react';
import { CheckCheck, MessageCircle, RefreshCcw, Send, X } from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fmtNumber } from '@/lib/format';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';

type MessageRow = {
    id: string;
    recipient_name: string | null;
    status: string;
    retry_count: number;
    sent_at: string | null;
    created_at: string | null;
};

type TemplateRow = {
    id: string;
    template_name: string;
    template_category: string | null;
    whatsapp_template_status: string | null;
};

interface Props {
    messages: MessageRow[];
    templates: TemplateRow[];
    kpis: {
        sent: number;
        delivered: number;
        seen: number;
        failed: number;
    };
}

const WA_STATUS_TONE: Record<string, StatusTone> = {
    seen: 'info',
    delivered: 'neutral',
    sent: 'neutral',
    failed: 'danger',
    confirmed: 'success',
};

const TEMPLATE_STATUS_TONE: Record<string, StatusTone> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger',
    paused: 'neutral',
    disabled: 'neutral',
};

const statusTone = (status: string): StatusTone =>
    WA_STATUS_TONE[status] ?? 'neutral';

const templateStatusTone = (status: string | null): StatusTone =>
    status ? (TEMPLATE_STATUS_TONE[status] ?? 'neutral') : 'neutral';

const timeOf = (row: MessageRow): string =>
    (row.sent_at ?? row.created_at)?.slice(11, 16) ?? '—';

export default function SecretaryWhatsApp({ messages, templates, kpis }: Props) {
    const { t } = useSecretaryLang();

    return (
        <>
            <Head title={t.nav_whatsapp} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_whatsapp}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <RefreshCcw className="size-3.5" />
                                {t.action_sync}
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Send className="size-3.5" />
                                {t.wa_send_template}
                            </Button>
                        </>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={t.wa_status_sent}
                        value={fmtNumber(Number(kpis.sent))}
                        icon={Send}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.wa_status_delivered}
                        value={fmtNumber(Number(kpis.delivered))}
                        icon={CheckCheck}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.wa_status_seen}
                        value={fmtNumber(Number(kpis.seen))}
                        icon={CheckCheck}
                        tone="success"
                    />
                    <KpiCard
                        label={t.wa_status_failed}
                        value={fmtNumber(Number(kpis.failed))}
                        icon={X}
                        tone="warn"
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <Tabs defaultValue="outbox">
                        <TabsList className="h-auto w-full justify-start rounded-none border-b border-border bg-transparent p-0">
                            {[
                                ['outbox', t.wa_tab_outbox, messages.length],
                                [
                                    'templates',
                                    t.wa_tab_templates,
                                    templates.length,
                                ],
                                ['inbox', t.wa_tab_inbox, null],
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
                            {messages.length === 0 && (
                                <div className="py-16 text-center text-[13px] text-muted-foreground">
                                    {t.empty_none}
                                </div>
                            )}
                            <ul className="divide-y divide-border">
                                {messages.map((row) => {
                                    const stale = row.retry_count >= 2;
                                    const failed = row.status === 'failed';
                                    const seen =
                                        row.status === 'seen' ||
                                        row.status === 'confirmed';

                                    return (
                                        <li
                                            key={row.id}
                                            className="space-y-2 px-5 py-3.5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[13px] font-semibold">
                                                        {row.recipient_name ??
                                                            t.unassigned}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {timeOf(row)}
                                                    </div>
                                                </div>
                                                <StatusPill
                                                    tone={statusTone(
                                                        row.status,
                                                    )}
                                                    withDot
                                                >
                                                    {t[
                                                        `wa_status_${row.status}`
                                                    ] ?? row.status}
                                                </StatusPill>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px]">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    {failed ? (
                                                        <X className="size-3 text-danger" />
                                                    ) : seen ? (
                                                        <CheckCheck className="size-3 text-info" />
                                                    ) : (
                                                        <CheckCheck className="size-3 text-muted-foreground" />
                                                    )}
                                                    {t.wa_sent_at} {timeOf(row)}
                                                    {row.retry_count > 0 &&
                                                        ` · ${t.wa_retry} ${row.retry_count}`}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {failed ? (
                                                        <Button
                                                            size="sm"
                                                            className="h-7 gap-1 bg-olive-600 text-[11px] text-white hover:bg-olive-700"
                                                        >
                                                            <RefreshCcw className="size-3" />
                                                            {t.wa_resend}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 gap-1 text-[11px]"
                                                        >
                                                            <Send className="size-3" />
                                                            {t.wa_send_template}
                                                        </Button>
                                                    )}
                                                    {(failed || stale) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 gap-1 border-danger text-[11px] text-danger hover:bg-danger-soft"
                                                        >
                                                            {t.wa_to_call}
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
                            <div className="grid grid-cols-[2fr_160px_120px_80px] gap-4 border-b bg-muted/50 px-5 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                <div>{t.wa_col_template}</div>
                                <div>{t.wa_col_category}</div>
                                <div>{t.col_status}</div>
                                <div />
                            </div>
                            {templates.length === 0 && (
                                <div className="py-16 text-center text-[13px] text-muted-foreground">
                                    {t.empty_none}
                                </div>
                            )}
                            {templates.map((tp) => (
                                <div
                                    key={tp.id}
                                    className="grid grid-cols-[2fr_160px_120px_80px] items-center gap-4 border-b border-border px-5 py-3 last:border-b-0"
                                >
                                    <div className="font-mono text-[12px] font-semibold">
                                        {tp.template_name}
                                    </div>
                                    <div className="text-[12px] text-muted-foreground">
                                        {tp.template_category ?? t.empty_none}
                                    </div>
                                    <div>
                                        <StatusPill
                                            tone={templateStatusTone(
                                                tp.whatsapp_template_status,
                                            )}
                                            withDot
                                        >
                                            {tp.whatsapp_template_status
                                                ? (t[
                                                      `wa_tpl_${tp.whatsapp_template_status}`
                                                  ] ??
                                                  tp.whatsapp_template_status)
                                                : t.empty_none}
                                        </StatusPill>
                                    </div>
                                    <div className="text-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7"
                                        >
                                            {t.action_edit}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="inbox" className="m-0">
                            <div className="flex items-center justify-center gap-2 py-16 text-center text-[13px] text-muted-foreground">
                                <MessageCircle className="size-4" />
                                {t.wa_inbox_coming}
                            </div>
                        </TabsContent>
                    </Tabs>
                </SectionCard>
            </div>
        </>
    );
}
