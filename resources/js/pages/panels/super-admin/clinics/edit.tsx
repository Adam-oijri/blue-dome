import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import ClinicController from '@/actions/App/Http/Controllers/SuperAdmin/ClinicController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { Button } from '@/components/ui/button';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { ClinicFormFields } from '@/pages/panels/super-admin/clinics/clinic-form-fields';
import type { ClinicFormData } from '@/pages/panels/super-admin/clinics/clinic-form-fields';
import superAdmin from '@/routes/super-admin';

export default function SuperAdminClinicEdit({
    clinic,
}: {
    clinic: ClinicFormData & { id: string; name: string };
}) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head
                title={t.clinics_edit_title.replace('{name}', clinic.name)}
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
                            href={superAdmin.clinics.show.url({
                                locale,
                                clinic: clinic.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            {clinic.name}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">
                        {t.clinics_edit_crumb}
                    </span>
                </div>

                <PageHeader
                    title={t.clinics_edit_title.replace('{name}', clinic.name)}
                    description={t.clinics_edit_desc}
                />

                <SectionCard className="mt-6">
                    <Form
                        {...ClinicController.update.form({
                            locale,
                            clinic: clinic.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="space-y-8 p-6"
                    >
                        {({ processing, errors }) => (
                            <ClinicFormFields
                                clinic={clinic}
                                processing={processing}
                                errors={errors}
                                submitLabel={t.clinics_edit_submit}
                            />
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
