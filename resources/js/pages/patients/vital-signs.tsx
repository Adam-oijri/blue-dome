import { Form, Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocaleSlug } from '@/lib/i18n/use-locale';
import patients from '@/routes/patients';
import patientVitalSigns from '@/routes/patients/vital-signs';

interface VitalSign {
    id: string;
    recorded_at: string;
    temperature_c: string | null;
    blood_pressure_sys: number | null;
    blood_pressure_dia: number | null;
    heart_rate: number | null;
    respiratory_rate: number | null;
    oxygen_saturation: string | null;
    blood_glucose: string | null;
    weight_kg: string | null;
    height_cm: string | null;
    bmi: string | null;
    pain_score: number | null;
    notes: string | null;
}

interface Paginator<T> {
    data: T[];
    total: number;
}

interface Props {
    patient: {
        id: string;
        first_name: string;
        last_name: string;
        patient_code: string | null;
    };
    vital_signs: Paginator<VitalSign>;
}

const INPUT_CLASS = 'rounded border border-input px-2 py-1';
const LABEL_CLASS = 'text-xs text-muted-foreground uppercase';

export default function PatientVitalSigns({ patient, vital_signs }: Props) {
    const { t } = useDoctorLang();
    const locale = useLocaleSlug();

    return (
        <>
            <Head
                title={`${t.vital_signs} — ${patient.first_name} ${patient.last_name}`}
            />
            <div className="flex h-full flex-col p-6">
                <div className="mb-4">
                    <Link
                        href={patients.show.url({ locale, patient: patient.id })}
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                    >
                        ← {t.back_to_patient}
                    </Link>
                    <h1 className="text-2xl font-semibold">
                        {t.vital_signs} — {patient.first_name}{' '}
                        {patient.last_name}
                    </h1>
                </div>

                <section className="mb-6 rounded border border-border p-4">
                    <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">
                        {t.record_new_reading}
                    </h2>
                    <Form
                        action={patientVitalSigns.store.url({
                            locale,
                            patient: patient.id,
                        })}
                        method="post"
                        className="grid grid-cols-3 gap-3 text-sm"
                    >
                        {({ errors, processing }) => (
                            <>
                                <label className="flex flex-col gap-1">
                                    <span className={LABEL_CLASS}>
                                        {t.temp_c}
                                    </span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="temperature_c"
                                        className={INPUT_CLASS}
                                    />
                                    {errors.temperature_c && (
                                        <span className="text-xs text-danger">
                                            {errors.temperature_c}
                                        </span>
                                    )}
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className={LABEL_CLASS}>
                                        {t.bp_sys}
                                    </span>
                                    <input
                                        type="number"
                                        name="blood_pressure_sys"
                                        className={INPUT_CLASS}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className={LABEL_CLASS}>
                                        {t.bp_dia}
                                    </span>
                                    <input
                                        type="number"
                                        name="blood_pressure_dia"
                                        className={INPUT_CLASS}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className={LABEL_CLASS}>
                                        {t.hr_label}
                                    </span>
                                    <input
                                        type="number"
                                        name="heart_rate"
                                        className={INPUT_CLASS}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className={LABEL_CLASS}>
                                        {t.weight_kg}
                                    </span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="weight_kg"
                                        className={INPUT_CLASS}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className={LABEL_CLASS}>
                                        {t.height_cm}
                                    </span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="height_cm"
                                        className={INPUT_CLASS}
                                    />
                                </label>
                                <label className="col-span-3 flex flex-col gap-1">
                                    <span className={LABEL_CLASS}>
                                        {t.notes_label}
                                    </span>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        className={INPUT_CLASS}
                                    />
                                </label>
                                <div className="col-span-3 mt-2 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-olive-600 text-white hover:bg-olive-700"
                                    >
                                        {t.record_action}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <section>
                    <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">
                        {t.history_label} ({vital_signs.total})
                    </h2>
                    {vital_signs.data.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            {t.empty_no_vital_signs}
                        </p>
                    ) : (
                        <Table className="text-xs">
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-2 py-1 text-[11px] tracking-wider uppercase">
                                        {t.col_when}
                                    </TableHead>
                                    <TableHead className="px-2 py-1 text-[11px] tracking-wider uppercase">
                                        {t.temp_c}
                                    </TableHead>
                                    <TableHead className="px-2 py-1 text-[11px] tracking-wider uppercase">
                                        {t.col_bp}
                                    </TableHead>
                                    <TableHead className="px-2 py-1 text-[11px] tracking-wider uppercase">
                                        {t.hr_label}
                                    </TableHead>
                                    <TableHead className="px-2 py-1 text-[11px] tracking-wider uppercase">
                                        {t.bmi}
                                    </TableHead>
                                    <TableHead className="px-2 py-1 text-[11px] tracking-wider uppercase">
                                        {t.pain}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vital_signs.data.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell className="px-2 py-1 font-mono">
                                            {v.recorded_at}
                                        </TableCell>
                                        <TableCell className="px-2 py-1">
                                            {v.temperature_c ?? '—'}
                                        </TableCell>
                                        <TableCell className="px-2 py-1">
                                            {v.blood_pressure_sys}/
                                            {v.blood_pressure_dia}
                                        </TableCell>
                                        <TableCell className="px-2 py-1">
                                            {v.heart_rate ?? '—'}
                                        </TableCell>
                                        <TableCell className="px-2 py-1">
                                            {v.bmi ?? '—'}
                                        </TableCell>
                                        <TableCell className="px-2 py-1">
                                            {v.pain_score ?? '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </section>
            </div>
        </>
    );
}
