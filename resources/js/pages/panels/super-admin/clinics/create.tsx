import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import ClinicController from '@/actions/App/Http/Controllers/SuperAdmin/ClinicController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { Button } from '@/components/ui/button';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { ClinicFormFields } from '@/pages/panels/super-admin/clinics/clinic-form-fields';
import superAdmin from '@/routes/super-admin';

export default function SuperAdminClinicCreate() {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={t.clinics_create_title} />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link href={superAdmin.clinics.index.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            {t.nav_clinics}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">
                        {t.clinics_action_new}
                    </span>
                </div>

                <PageHeader
                    title={t.clinics_create_title}
                    description={t.clinics_create_desc}
                />

                <SectionCard className="mt-6">
                    <Form
                        {...ClinicController.store.form({ locale })}
                        options={{ preserveScroll: true }}
                        className="space-y-8 p-6"
                    >
                        {({ processing, errors }) => (
                            <ClinicFormFields
                                processing={processing}
                                errors={errors}
                                submitLabel={t.clinics_create_submit}
                            />
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
