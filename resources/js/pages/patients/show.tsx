import { Deferred, Head, Link } from '@inertiajs/react';
import {
    Activity,
    ChevronLeft,
    Droplet,
    Edit3,
    Phone,
    Plus,
    User as UserIcon,
} from 'lucide-react';

import { CreateAppointmentSheet } from '@/components/blue-dome/create-appointment-sheet';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { FieldChangeEntry } from '@/components/provenance-panel';
import { ProvenancePanel } from '@/components/provenance-panel';
import { Button } from '@/components/ui/button';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import patients from '@/routes/patients';

type Vital = {
    id: string;
    recorded_at: string | null;
    temperature_c: string | number | null;
    blood_pressure_sys: number | null;
    blood_pressure_dia: number | null;
    heart_rate: number | null;
    oxygen_saturation: string | number | null;
    weight_kg: string | number | null;
    height_cm: string | number | null;
    bmi: string | number | null;
    pain_score: number | null;
};

type Patient = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    date_of_birth: string | null;
    gender: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    blood_type: string | null;
    patient_code: string | null;
    insurance_company: string | null;
    allergies: string | null;
    chronic_diseases: string | null;
    current_medications: string | null;
    registration_date: string | null;
    is_active: boolean;
    clinic?: { name: string | null } | null;
    branch?: { branch_name: string | null } | null;
};

interface PatientShowProps {
    patient: Patient;
    national_id: string | null;
    insurance_number: string | null;
    vital_signs?: Vital[];
    provenance?: FieldChangeEntry[];
}

function fullName(p: Patient): string {
    return `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—';
}

function ageFrom(dob: string | null): string {
    if (!dob) {
        return '—';
    }

    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age -= 1;
    }

    return `${age}`;
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="flex items-baseline justify-between gap-3 py-1.5">
            <span className="text-[12px] text-muted-foreground">{label}</span>
            <span className="text-[13px] font-medium">{value || '—'}</span>
        </div>
    );
}

function Metric({
    label,
    value,
    unit,
}: {
    label: string;
    value: string | number | null;
    unit?: string;
}) {
    return (
        <div className="rounded-md border border-border p-3">
            <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                {label}
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-lg font-semibold tabular-nums">
                    {value ?? '—'}
                </span>
                {unit && value != null && (
                    <span className="text-[11px] text-muted-foreground">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function PatientShow({
    patient,
    national_id,
    insurance_number,
    vital_signs,
    provenance,
}: PatientShowProps) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const name = fullName(patient);

    const genderLabel = patient.gender
        ? enumLabel(t.gender_opts, patient.gender)
        : '—';

    return (
        <>
            <Head title={name} />

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
                    <span className="text-[13px] font-medium">{name}</span>
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
                        {`${patient.first_name?.[0] ?? ''}${patient.last_name?.[0] ?? ''}`.toUpperCase() ||
                            '?'}
                    </div>
                    <div className="relative flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-[22px] font-semibold">
                                {name}
                            </h1>
                            <StatusPill
                                tone={patient.is_active ? 'olive' : 'neutral'}
                            >
                                {patient.is_active
                                    ? t.active_label
                                    : t.inactive_label}
                            </StatusPill>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <UserIcon className="size-3.5" />
                                {ageFrom(patient.date_of_birth)} · {genderLabel}
                            </span>
                            {patient.blood_type && (
                                <span className="flex items-center gap-1.5">
                                    <Droplet className="size-3.5" />
                                    {patient.blood_type}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Phone className="size-3.5" />
                                {patient.phone ?? '—'}
                            </span>
                            {patient.patient_code && (
                                <span className="opacity-70">
                                    · {patient.patient_code}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="relative flex items-center gap-2 self-start">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15"
                        >
                            <Link
                                href={patients.edit.url({
                                    locale,
                                    patient: patient.id,
                                })}
                            >
                                <Edit3 className="size-3.5" />
                                {t.edit}
                            </Link>
                        </Button>
                        <CreateAppointmentSheet
                            lockedPatient={{ id: patient.id, name }}
                        >
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                {t.new_appointment}
                            </Button>
                        </CreateAppointmentSheet>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <SectionCard
                            title={t.vital_signs}
                            titleIcon={<Activity className="size-4" />}
                            bodyClassName="p-5"
                        >
                            <Deferred
                                data="vital_signs"
                                fallback={
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {Array.from({ length: 6 }).map(
                                            (_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-16 animate-pulse rounded-md bg-muted"
                                                />
                                            ),
                                        )}
                                    </div>
                                }
                            >
                                {!vital_signs || vital_signs.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        {t.no_vital_signs}
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-3 text-[12px] text-muted-foreground">
                                            {t.last_recorded}{' '}
                                            {vital_signs[0].recorded_at
                                                ?.slice(0, 16)
                                                .replace('T', ' ') ?? '—'}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2.5">
                                            <Metric
                                                label="BP"
                                                value={
                                                    vital_signs[0]
                                                        .blood_pressure_sys &&
                                                    vital_signs[0]
                                                        .blood_pressure_dia
                                                        ? `${vital_signs[0].blood_pressure_sys}/${vital_signs[0].blood_pressure_dia}`
                                                        : null
                                                }
                                                unit="mmHg"
                                            />
                                            <Metric
                                                label={t.heart_rate_label}
                                                value={
                                                    vital_signs[0].heart_rate
                                                }
                                                unit="bpm"
                                            />
                                            <Metric
                                                label={t.temp_label}
                                                value={
                                                    vital_signs[0].temperature_c
                                                }
                                                unit="°C"
                                            />
                                            <Metric
                                                label={t.spo2_label}
                                                value={
                                                    vital_signs[0]
                                                        .oxygen_saturation
                                                }
                                                unit="%"
                                            />
                                            <Metric
                                                label={t.weight_label}
                                                value={vital_signs[0].weight_kg}
                                                unit="kg"
                                            />
                                            <Metric
                                                label={t.bmi}
                                                value={vital_signs[0].bmi}
                                            />
                                        </div>
                                    </>
                                )}
                            </Deferred>
                        </SectionCard>

                        <SectionCard title={t.clinical_label} bodyClassName="p-5">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="mb-1.5 text-sm font-semibold">
                                        {t.allergies}
                                    </h3>
                                    <p className="text-[13px] text-muted-foreground">
                                        {patient.allergies || t.none_recorded}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="mb-1.5 text-sm font-semibold">
                                        {t.chronic_diseases}
                                    </h3>
                                    <p className="text-[13px] text-muted-foreground">
                                        {patient.chronic_diseases ||
                                            t.none_recorded}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="mb-1.5 text-sm font-semibold">
                                        {t.current_meds}
                                    </h3>
                                    <p className="text-[13px] text-muted-foreground">
                                        {patient.current_medications ||
                                            t.none_recorded}
                                    </p>
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    <div className="space-y-5">
                        <SectionCard
                            title={t.patient_information}
                            bodyClassName="px-5 py-3"
                        >
                            <div className="divide-y divide-border">
                                <InfoRow
                                    label={t.age}
                                    value={`${ageFrom(patient.date_of_birth)} · ${genderLabel}`}
                                />
                                <InfoRow
                                    label={t.date_of_birth}
                                    value={
                                        patient.date_of_birth?.slice(0, 10) ??
                                        null
                                    }
                                />
                                <InfoRow
                                    label={t.phone}
                                    value={patient.phone}
                                />
                                <InfoRow
                                    label={t.email}
                                    value={patient.email}
                                />
                                <InfoRow
                                    label={t.address}
                                    value={
                                        [patient.address, patient.city]
                                            .filter(Boolean)
                                            .join(', ') || null
                                    }
                                />
                                <InfoRow
                                    label={t.national_id}
                                    value={national_id}
                                />
                                <InfoRow
                                    label={t.insurance}
                                    value={
                                        [
                                            patient.insurance_company,
                                            insurance_number,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ') || null
                                    }
                                />
                                <InfoRow
                                    label={t.patient_id}
                                    value={patient.patient_code}
                                />
                                <InfoRow
                                    label={t.clinic_label}
                                    value={patient.clinic?.name ?? null}
                                />
                                <InfoRow
                                    label={t.branch_label}
                                    value={patient.branch?.branch_name ?? null}
                                />
                                <InfoRow
                                    label={t.registered_label}
                                    value={
                                        patient.registration_date?.slice(
                                            0,
                                            10,
                                        ) ?? null
                                    }
                                />
                            </div>
                        </SectionCard>
                    </div>
                </div>

                <div className="mt-5">
                    <ProvenancePanel
                        deferredKey="provenance"
                        entries={provenance}
                    />
                </div>
            </div>
        </>
    );
}
