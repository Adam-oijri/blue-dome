import { Head, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    Droplet,
    Edit3,
    Phone,
    Pill,
    Plus,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';

import { StatusPill } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { DOCTOR_MOCK } from '@/lib/mock/doctor';
import type { PatientRecord } from '@/lib/mock/doctor';
import patients from '@/routes/patients';

type LegacyPatient = {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    phone: string | null;
    blood_type: string | null;
};

interface PatientShowProps {
    // Phase 2 wires from PatientController@show. Optional for the UI port.
    patient?: LegacyPatient;
}

function adaptPatient(p?: LegacyPatient): PatientRecord {
    if (!p) {
        return DOCTOR_MOCK.patients[0];
    }

    const name = `${p.first_name} ${p.last_name}`;
    const age = p.date_of_birth
        ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()
        : 50;

    return {
        id: p.id,
        name: { en: name, fr: name, ar: name },
        age,
        gender: p.gender === 'female' ? 'female' : 'male',
        blood: p.blood_type ?? 'A+',
        phone: p.phone ?? '—',
        last_visit: '—',
        insurance: '—',
        flag: '',
    };
}

const VITALS: {
    label: string;
    value: string;
    unit: string;
    tone?: 'warning';
}[] = [
    { label: 'BP', value: '138/86', unit: 'mmHg', tone: 'warning' },
    { label: 'Heart rate', value: '78', unit: 'bpm' },
    { label: 'Temperature', value: '36.7', unit: '°C' },
    { label: 'SpO₂', value: '98', unit: '%' },
    { label: 'Weight', value: '82.5', unit: 'kg' },
    { label: 'BMI', value: '27.4', unit: '', tone: 'warning' },
];

const HISTORY: {
    date: string;
    title: string;
    who: string;
    desc: string;
    color: 'olive' | 'warning' | 'danger' | 'navy';
}[] = [
    {
        date: 'May 5, 2026',
        title: 'Follow-up consultation',
        who: 'Dr. Lahlou',
        desc: 'BP slightly elevated, adjusted Amlodipine dose to 10mg.',
        color: 'olive',
    },
    {
        date: 'Apr 22, 2026',
        title: 'Lipid panel results',
        who: 'Lab Biocenter',
        desc: 'LDL 162 mg/dL — borderline high. Statin continued.',
        color: 'warning',
    },
    {
        date: 'Mar 15, 2026',
        title: 'Annual checkup',
        who: 'Dr. Lahlou',
        desc: 'ECG normal. BMI 27.4 — counseled on diet.',
        color: 'navy',
    },
    {
        date: 'Jan 8, 2026',
        title: 'Echocardiogram',
        who: 'Dr. Idrissi (referral)',
        desc: 'Mild LV hypertrophy, EF 58%. Recheck in 6 months.',
        color: 'navy',
    },
    {
        date: 'Oct 10, 2025',
        title: 'ER visit — chest pain',
        who: 'Hôpital Cheikh Zaid',
        desc: 'Ruled out MI. Discharged with cardiology follow-up.',
        color: 'danger',
    },
];

const TIMELINE_DOT: Record<(typeof HISTORY)[number]['color'], string> = {
    olive: 'bg-olive-500',
    warning: 'bg-warning',
    danger: 'bg-danger',
    navy: 'bg-navy-500',
};

const CURRENT_MEDS = [
    { name: 'Atorvastatin', detail: '20mg · 1× daily · evening' },
    { name: 'Amlodipine', detail: '5mg · 1× daily · morning' },
    { name: 'Aspirin', detail: '75mg · 1× daily' },
];

export default function PatientShow({ patient }: PatientShowProps) {
    const { t, lang } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [tab, setTab] = useState('overview');
    const p = adaptPatient(patient);

    return (
        <>
            <Head title={p.name[lang]} />

            <div className="px-8 py-6 lg:px-10">
                <div className="mb-4 flex items-center gap-3 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1.5"
                    >
                        <Link href={patients.index.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            {t.patients}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-medium">
                        {p.name[lang]}
                    </span>
                </div>

                <div className="relative mb-5 flex items-start gap-5 overflow-hidden rounded-xl bg-gradient-to-br from-navy-950 to-navy-800 p-6 text-white">
                    <span
                        className="pointer-events-none absolute end-[-10%] top-[-40%] size-[400px] rounded-full"
                        style={{
                            background:
                                'radial-gradient(circle, rgba(134, 158, 71, 0.18), transparent 70%)',
                        }}
                        aria-hidden
                    />
                    <div className="relative grid size-14 shrink-0 place-items-center rounded-full bg-olive-600 text-lg font-semibold">
                        {p.name.en
                            .split(' ')
                            .map((s) => s[0])
                            .join('')}
                    </div>
                    <div className="relative flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-[22px] font-semibold">
                                {p.name[lang]}
                            </h1>
                            {p.flag === 'chronic' && (
                                <StatusPill tone="warning">
                                    Chronic care
                                </StatusPill>
                            )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <UserIcon className="size-3.5" />
                                {p.age} ·{' '}
                                {p.gender === 'male' ? t.male : t.female}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Droplet className="size-3.5" />
                                {p.blood}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Phone className="size-3.5" />
                                {p.phone}
                            </span>
                            <span className="opacity-70">· {p.id}</span>
                        </div>
                    </div>
                    <div className="relative flex items-center gap-2 self-start">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15"
                        >
                            <Edit3 className="size-3.5" />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                        >
                            <Plus className="size-3.5" />
                            New visit
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList className="h-auto w-full justify-start rounded-none border-b border-border bg-transparent p-0">
                            {[
                                ['overview', t.overview],
                                ['history', t.medical_history],
                                ['visits', t.visits],
                                ['rx', t.rx],
                                ['labs', t.labs],
                                ['billing', t.billing],
                            ].map(([id, label]) => (
                                <TabsTrigger
                                    key={id}
                                    value={id}
                                    className="h-auto rounded-none border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-muted-foreground shadow-none data-[state=active]:border-olive-600 data-[state=active]:bg-transparent data-[state=active]:text-navy-900 data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent"
                                >
                                    {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="overview" className="m-0 p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3.5 text-sm font-semibold">
                                        {t.vital_signs}{' '}
                                        <span className="text-[12px] font-normal text-muted-foreground">
                                            · last recorded today 09:50
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {VITALS.map((v) => (
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
                                                                ? 'text-lg font-semibold text-warning tabular-nums'
                                                                : 'text-lg font-semibold tabular-nums'
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

                                    <h3 className="mt-5 mb-2.5 text-sm font-semibold">
                                        {t.allergies}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <StatusPill tone="danger">
                                            Penicillin
                                        </StatusPill>
                                        <StatusPill tone="danger">
                                            Aspirin
                                        </StatusPill>
                                        <StatusPill>
                                            Pollen (seasonal)
                                        </StatusPill>
                                    </div>

                                    <h3 className="mt-5 mb-2.5 text-sm font-semibold">
                                        {t.chronic_diseases}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <StatusPill tone="warning">
                                            Hypertension (since 2019)
                                        </StatusPill>
                                        <StatusPill tone="warning">
                                            Hyperlipidemia
                                        </StatusPill>
                                    </div>

                                    <h3 className="mt-5 mb-2.5 text-sm font-semibold">
                                        {t.current_meds}
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {CURRENT_MEDS.map((m) => (
                                            <div
                                                key={m.name}
                                                className="flex items-center gap-3 rounded-md bg-muted px-3 py-2"
                                            >
                                                <Pill className="size-3.5 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <div className="text-[13px] font-medium">
                                                        {m.name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {m.detail}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3.5 text-sm font-semibold">
                                        {t.medical_history}
                                    </h3>
                                    <div className="relative border-s-2 border-border ps-5">
                                        {HISTORY.map((h, i) => (
                                            <div
                                                key={i}
                                                className="relative pb-4"
                                            >
                                                <span
                                                    className={`absolute -start-[27px] top-1 size-3 rounded-full border-2 border-white shadow-[0_0_0_2px_var(--color-border)] ${TIMELINE_DOT[h.color]}`}
                                                    aria-hidden
                                                />
                                                <div className="text-[11px] text-muted-foreground">
                                                    {h.date}
                                                </div>
                                                <div className="mt-0.5 text-[13px] font-semibold">
                                                    {h.title}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {h.who}
                                                </div>
                                                <div className="mt-1 text-[12px] text-slate-700">
                                                    {h.desc}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {['history', 'visits', 'rx', 'labs', 'billing'].map(
                            (id) => (
                                <TabsContent
                                    key={id}
                                    value={id}
                                    className="m-0"
                                >
                                    <div className="py-16 text-center text-sm text-muted-foreground">
                                        The {id} tab — content scaffolds coming
                                        as wiring lands.
                                    </div>
                                </TabsContent>
                            ),
                        )}
                    </Tabs>
                </div>
            </div>
        </>
    );
}
