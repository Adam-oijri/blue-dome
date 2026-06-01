import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import DoctorProfileController from '@/actions/App/Http/Controllers/SuperAdmin/DoctorProfileController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

interface Profile {
    specialty?: string | null;
    sub_specialty?: string | null;
    license_number?: string | null;
    license_expiry?: string | null;
    consultation_duration?: number | null;
    consultation_fee?: number | null;
    follow_up_fee?: number | null;
    emergency_fee?: number | null;
    accepts_new_patients?: boolean | null;
    bio?: string | null;
}

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

function Field({
    label,
    name,
    error,
    type = 'text',
    defaultValue = '',
}: {
    label: string;
    name: string;
    error?: string;
    type?: string;
    defaultValue?: string | number;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                defaultValue={defaultValue}
                autoComplete="off"
            />
            <InputError message={error} />
        </div>
    );
}

export default function SuperAdminDoctorEdit({
    doctor,
    profile,
}: {
    doctor: { id: string; first_name: string | null; last_name: string | null };
    profile: Profile | null;
}) {
    const { slug: locale } = useLocale();
    const name = `${doctor.first_name ?? ''} ${doctor.last_name ?? ''}`.trim();

    return (
        <>
            <Head title={`Doctor profile — ${name}`} />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link href={superAdmin.doctors.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            Doctors
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">{name}</span>
                </div>

                <PageHeader
                    title={`Dr. ${name}`}
                    description="Clinical profile, fees, and licensing."
                />

                <SectionCard className="mt-6">
                    <Form
                        {...DoctorProfileController.update.form({
                            locale,
                            user: doctor.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="space-y-6 p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field
                                        label="Specialty"
                                        name="specialty"
                                        defaultValue={profile?.specialty ?? ''}
                                        error={errors.specialty}
                                    />
                                    <Field
                                        label="Sub-specialty"
                                        name="sub_specialty"
                                        defaultValue={
                                            profile?.sub_specialty ?? ''
                                        }
                                        error={errors.sub_specialty}
                                    />
                                    <Field
                                        label="License number"
                                        name="license_number"
                                        defaultValue={
                                            profile?.license_number ?? ''
                                        }
                                        error={errors.license_number}
                                    />
                                    <Field
                                        label="License expiry"
                                        name="license_expiry"
                                        type="date"
                                        defaultValue={
                                            profile?.license_expiry?.slice(
                                                0,
                                                10,
                                            ) ?? ''
                                        }
                                        error={errors.license_expiry}
                                    />
                                    <Field
                                        label="Consultation duration (min)"
                                        name="consultation_duration"
                                        type="number"
                                        defaultValue={
                                            profile?.consultation_duration ?? ''
                                        }
                                        error={errors.consultation_duration}
                                    />
                                    <div className="grid gap-2">
                                        <Label htmlFor="accepts_new_patients">
                                            Accepts new patients
                                        </Label>
                                        <select
                                            id="accepts_new_patients"
                                            name="accepts_new_patients"
                                            defaultValue={
                                                profile?.accepts_new_patients ===
                                                false
                                                    ? '0'
                                                    : '1'
                                            }
                                            className={selectClass}
                                        >
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                        <InputError
                                            message={
                                                errors.accepts_new_patients
                                            }
                                        />
                                    </div>
                                    <Field
                                        label="Consultation fee"
                                        name="consultation_fee"
                                        type="number"
                                        defaultValue={
                                            profile?.consultation_fee ?? ''
                                        }
                                        error={errors.consultation_fee}
                                    />
                                    <Field
                                        label="Follow-up fee"
                                        name="follow_up_fee"
                                        type="number"
                                        defaultValue={
                                            profile?.follow_up_fee ?? ''
                                        }
                                        error={errors.follow_up_fee}
                                    />
                                    <Field
                                        label="Emergency fee"
                                        name="emergency_fee"
                                        type="number"
                                        defaultValue={
                                            profile?.emergency_fee ?? ''
                                        }
                                        error={errors.emergency_fee}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={4}
                                        defaultValue={profile?.bio ?? ''}
                                        className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                    <InputError message={errors.bio} />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-navy-900 text-white hover:bg-navy-800"
                                >
                                    {processing && <Spinner />}
                                    Save profile
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
