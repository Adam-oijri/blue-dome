import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import PatientController from '@/actions/App/Http/Controllers/SuperAdmin/PatientController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

interface Patient {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code: string | null;
    date_of_birth: string | null;
    gender: string | null;
    phone: string | null;
    phone_e164: string | null;
    email: string | null;
    national_id: string | null;
    blood_type: string | null;
    address: string | null;
    city: string | null;
    notes: string | null;
    is_active: boolean;
}

const GENDERS = ['', 'male', 'female', 'other'];
const BLOOD_TYPES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function SuperAdminClinicPatientEdit({
    clinic,
    patient,
}: {
    clinic: { id: string; name: string };
    patient: Patient | null;
}) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();
    const isEdit = patient !== null;

    const formProps = isEdit
        ? PatientController.update.form({
              locale,
              clinic: clinic.id,
              patient: patient.id,
          })
        : PatientController.store.form({ locale, clinic: clinic.id });

    return (
        <>
            <Head
                title={(isEdit
                    ? t.cl_patient_head_edit
                    : t.cl_patient_head_new
                ).replace('{clinic}', clinic.name)}
            />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link
                            href={superAdmin.clinics.patients.index.url({
                                locale,
                                clinic: clinic.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            {t.cl_patients_crumb}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">
                        {isEdit
                            ? t.cl_invoice_crumb_edit
                            : t.cl_patient_crumb_new}
                    </span>
                </div>

                <PageHeader
                    title={
                        isEdit
                            ? t.cl_patient_title_edit
                            : t.cl_patient_title_new
                    }
                    description={clinic.name}
                />

                <SectionCard className="mt-6">
                    <Form
                        {...formProps}
                        options={{ preserveScroll: true }}
                        className="space-y-6 p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name">
                                            {t.cl_patient_first_name}
                                        </Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            defaultValue={
                                                patient?.first_name ?? ''
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.first_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">
                                            {t.cl_patient_last_name}
                                        </Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            defaultValue={
                                                patient?.last_name ?? ''
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.last_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="date_of_birth">
                                            {t.cl_patient_dob}
                                        </Label>
                                        <Input
                                            id="date_of_birth"
                                            name="date_of_birth"
                                            type="date"
                                            defaultValue={
                                                patient?.date_of_birth?.slice(
                                                    0,
                                                    10,
                                                ) ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.date_of_birth}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gender">
                                            {t.cl_patient_gender}
                                        </Label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            defaultValue={patient?.gender ?? ''}
                                            className={selectClass}
                                        >
                                            {GENDERS.map((g) => (
                                                <option key={g} value={g}>
                                                    {g || '—'}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.gender} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            {t.cl_patient_th_phone}
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            defaultValue={patient?.phone ?? ''}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone_e164">
                                            {t.cl_patient_phone_e164}
                                        </Label>
                                        <Input
                                            id="phone_e164"
                                            name="phone_e164"
                                            placeholder="+212600000000"
                                            defaultValue={
                                                patient?.phone_e164 ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.phone_e164}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            {t.clinic_form_email}
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={patient?.email ?? ''}
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="patient_code">
                                            {t.cl_patient_code}
                                        </Label>
                                        <Input
                                            id="patient_code"
                                            name="patient_code"
                                            defaultValue={
                                                patient?.patient_code ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.patient_code}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="national_id">
                                            {t.cl_patient_national_id}
                                        </Label>
                                        <Input
                                            id="national_id"
                                            name="national_id"
                                            defaultValue={
                                                patient?.national_id ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.national_id}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="blood_type">
                                            {t.cl_patient_blood_type}
                                        </Label>
                                        <select
                                            id="blood_type"
                                            name="blood_type"
                                            defaultValue={
                                                patient?.blood_type ?? ''
                                            }
                                            className={selectClass}
                                        >
                                            {BLOOD_TYPES.map((b) => (
                                                <option key={b} value={b}>
                                                    {b || '—'}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.blood_type}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="city">
                                            {t.clinic_form_city}
                                        </Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            defaultValue={patient?.city ?? ''}
                                        />
                                        <InputError message={errors.city} />
                                    </div>
                                    {isEdit && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="is_active">
                                                {t.cl_patient_status}
                                            </Label>
                                            <select
                                                id="is_active"
                                                name="is_active"
                                                defaultValue={
                                                    patient.is_active
                                                        ? '1'
                                                        : '0'
                                                }
                                                className={selectClass}
                                            >
                                                <option value="1">
                                                    {t.status_active}
                                                </option>
                                                <option value="0">
                                                    {t.status_inactive}
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.is_active}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">
                                        {t.cl_patient_address}
                                    </Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        defaultValue={patient?.address ?? ''}
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">
                                        {t.cl_patient_notes}
                                    </Label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        defaultValue={patient?.notes ?? ''}
                                        className="min-h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-navy-900 text-white hover:bg-navy-800"
                                >
                                    {processing && <Spinner />}
                                    {isEdit
                                        ? t.cl_invoice_submit_save
                                        : t.cl_patient_submit_create}
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
