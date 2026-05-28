import { Head } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    Check,
    FileText,
    FlaskConical,
    Pill,
    Receipt,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDoctorLang } from '@/lib/i18n/doctor-context';

const VITALS_TODAY: {
    label: string;
    value: string;
    unit: string;
    tone?: 'warning';
}[] = [
    { label: 'BP', value: '142/90', unit: 'mmHg', tone: 'warning' },
    { label: 'HR', value: '84', unit: 'bpm' },
    { label: 'Temp', value: '36.8', unit: '°C' },
    { label: 'SpO₂', value: '97', unit: '%' },
];

const INVESTIGATIONS = [
    {
        label: 'ECG (12-lead)',
        note: 'In-clinic · today',
        state: 'ordered' as const,
    },
    {
        label: 'Lipid panel + Troponin + CBC',
        note: 'Lab Biocenter · fasting',
        state: 'ordered' as const,
    },
    {
        label: 'Stress test',
        note: 'Schedule within 1 week',
        state: 'pending' as const,
    },
];

export default function MedicalRecordCreate() {
    const { t } = useDoctorLang();
    const [tab, setTab] = useState('exam');

    return (
        <>
            <Head title="Consultation" />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title="Youssef Tazi · Visit"
                    description={
                        <span className="text-[13px] text-muted-foreground">
                            <span className="mb-1.5 flex items-center gap-3">
                                <StatusPill tone="info" withDot>
                                    {t.in_progress}
                                </StatusPill>
                                <span className="text-[12px]">
                                    Started 09:47 · 14 min elapsed
                                </span>
                            </span>
                            Initial consultation — Chest pain · 42y · M · B+ ·
                            P-002910
                        </span>
                    }
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <FileText className="size-3.5" />
                                Save draft
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Check className="size-3.5" />
                                Complete visit
                            </Button>
                        </>
                    }
                />

                <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
                    <div className="flex flex-col gap-4">
                        <SectionCard bodyClassName="p-4">
                            <div className="flex items-center gap-3">
                                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-700 text-sm font-semibold text-white">
                                    YT
                                </div>
                                <div>
                                    <div className="text-[14px] font-semibold">
                                        Youssef Tazi
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        P-002910 · 42y
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                                {[
                                    ['Blood', 'B+'],
                                    ['Insurance', 'Saham'],
                                    ['Phone', '+212 6 63 77…'],
                                    ['Last visit', 'Today'],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <div className="text-[10px] text-muted-foreground">
                                            {k}
                                        </div>
                                        <div className="font-medium">{v}</div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard
                            title={t.allergies}
                            bodyClassName="px-4 pb-3.5"
                        >
                            <StatusPill tone="danger">
                                No known allergies
                            </StatusPill>
                        </SectionCard>

                        <SectionCard title="Recent visits" bodyClassName="p-1">
                            {[
                                { d: 'Mar 2026', t: 'Annual checkup' },
                                { d: 'Sep 2025', t: 'Cold/Flu' },
                                { d: 'Feb 2025', t: 'Sports injury' },
                            ].map((v) => (
                                <div
                                    key={v.d}
                                    className="rounded-md px-3 py-2 text-[12px]"
                                >
                                    <div className="font-medium">{v.t}</div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {v.d}
                                    </div>
                                </div>
                            ))}
                        </SectionCard>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        <Tabs value={tab} onValueChange={setTab}>
                            <TabsList className="h-auto w-full justify-start rounded-none border-b border-border bg-transparent p-0">
                                {[
                                    ['exam', 'Examination'],
                                    ['dx', 'Diagnosis'],
                                    ['plan', 'Treatment plan'],
                                ].map(([id, l]) => (
                                    <TabsTrigger
                                        key={id}
                                        value={id}
                                        className="h-auto rounded-none border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-muted-foreground shadow-none data-[state=active]:border-olive-600 data-[state=active]:bg-transparent data-[state=active]:text-navy-900 data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent"
                                    >
                                        {l}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <TabsContent
                                value="exam"
                                className="m-0 space-y-4 p-5"
                            >
                                <Field
                                    label="Chief complaint"
                                    component="textarea"
                                    rows={2}
                                    defaultValue="Intermittent chest pain over the last 3 weeks, worse with exertion."
                                />
                                <Field
                                    label="Present illness"
                                    component="textarea"
                                    rows={4}
                                    defaultValue="42-year-old male, sedentary office worker, presenting with retrosternal chest discomfort, sharp, non-radiating, occurring 2-3 times weekly. No associated dyspnea, nausea, or diaphoresis. Family history of CAD (father, MI age 58)."
                                />
                                <div>
                                    <div className="mb-1 text-[12px] font-medium text-muted-foreground">
                                        Vital signs (recorded 09:50)
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {VITALS_TODAY.map((v) => (
                                            <div
                                                key={v.label}
                                                className="rounded-md border border-border p-3"
                                            >
                                                <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                                    {v.label}
                                                </div>
                                                <div className="mt-0.5 flex items-baseline gap-1">
                                                    <span
                                                        className={
                                                            v.tone === 'warning'
                                                                ? 'text-base font-semibold text-warning tabular-nums'
                                                                : 'text-base font-semibold tabular-nums'
                                                        }
                                                    >
                                                        {v.value}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {v.unit}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Field
                                    label="Physical examination"
                                    component="textarea"
                                    rows={4}
                                    defaultValue="Heart: regular rate and rhythm, S1 S2 normal, no murmurs/rubs/gallops. Lungs: clear bilaterally. No peripheral edema. Carotids without bruits."
                                />
                            </TabsContent>

                            <TabsContent
                                value="dx"
                                className="m-0 space-y-4 p-5"
                            >
                                <Field
                                    label="Primary diagnosis (ICD-10)"
                                    defaultValue="R07.9 — Chest pain, unspecified"
                                />
                                <Field
                                    label="Differential diagnosis"
                                    component="textarea"
                                    rows={4}
                                    defaultValue={`• Stable angina (rule out via stress test)\n• Costochondritis\n• GERD\n• Anxiety-related chest pain`}
                                />
                                <Field
                                    label="Clinical impression"
                                    component="textarea"
                                    rows={3}
                                    defaultValue="Atypical chest pain in 42yo male with positive family history. Low-to-intermediate cardiac risk. Workup indicated."
                                />
                            </TabsContent>

                            <TabsContent
                                value="plan"
                                className="m-0 space-y-4 p-5"
                            >
                                <div>
                                    <div className="mb-2 text-[12px] font-medium text-muted-foreground">
                                        Investigations ordered
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {INVESTIGATIONS.map((i) => (
                                            <label
                                                key={i.label}
                                                className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-2.5"
                                            >
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="size-4"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-[13px] font-medium">
                                                        {i.label}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {i.note}
                                                    </div>
                                                </div>
                                                <StatusPill
                                                    tone={
                                                        i.state === 'ordered'
                                                            ? 'info'
                                                            : 'warning'
                                                    }
                                                >
                                                    {i.state === 'ordered'
                                                        ? 'Ordered'
                                                        : 'Pending'}
                                                </StatusPill>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 text-[12px] font-medium text-muted-foreground">
                                        Follow-up
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <input
                                            defaultValue="In 2 weeks after stress test"
                                            className="h-9 flex-1 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        />
                                        <input
                                            type="date"
                                            defaultValue="2026-05-19"
                                            className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        />
                                    </div>
                                </div>
                                <Field
                                    label="Patient instructions"
                                    component="textarea"
                                    rows={3}
                                    defaultValue="Avoid strenuous exercise until cleared. Return immediately if chest pain becomes severe, prolonged, or accompanied by shortness of breath."
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="flex flex-col gap-4">
                        <SectionCard bodyClassName="p-5">
                            <h3 className="mb-3 text-sm font-semibold">
                                Visit summary
                            </h3>
                            <div className="space-y-2.5 text-[12px]">
                                {[
                                    ['Duration', '14 min'],
                                    ['Tests ordered', '3'],
                                    ['Prescriptions', '0'],
                                    ['Fee', '450 MAD'],
                                ].map(([k, v]) => (
                                    <div
                                        key={k}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-muted-foreground">
                                            {k}
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {v}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Quick actions"
                            bodyClassName="grid grid-cols-2 gap-2 p-3"
                        >
                            {[
                                { Icon: Pill, label: 'Prescribe' },
                                { Icon: FlaskConical, label: 'Lab order' },
                                { Icon: Receipt, label: 'Invoice' },
                                { Icon: CalendarIcon, label: 'Re-book' },
                            ].map(({ Icon, label }) => (
                                <Button
                                    key={label}
                                    variant="outline"
                                    className="h-[60px] flex-col gap-1 text-[11px]"
                                >
                                    <Icon className="size-4" />
                                    {label}
                                </Button>
                            ))}
                        </SectionCard>

                        <SectionCard
                            className="border-transparent bg-info-soft"
                            bodyClassName="p-4"
                        >
                            <div className="flex items-start gap-3">
                                <Sparkles className="size-4 shrink-0 pt-0.5 text-info" />
                                <div>
                                    <div className="text-[12px] font-semibold text-info">
                                        AI suggestion
                                    </div>
                                    <div className="mt-1 text-[11px] text-blue-900">
                                        Given family hx + atypical pain,
                                        consider HEART score documentation.
                                        Patient scores 3 → outpatient workup
                                        appropriate.
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </>
    );
}

function Field({
    label,
    component = 'input',
    rows,
    defaultValue,
}: {
    label: string;
    component?: 'input' | 'textarea';
    rows?: number;
    defaultValue?: string;
}) {
    return (
        <div>
            <div className="mb-1 text-[12px] font-medium text-muted-foreground">
                {label}
            </div>
            {component === 'textarea' ? (
                <textarea
                    rows={rows ?? 3}
                    defaultValue={defaultValue}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
            ) : (
                <input
                    defaultValue={defaultValue}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
            )}
        </div>
    );
}
