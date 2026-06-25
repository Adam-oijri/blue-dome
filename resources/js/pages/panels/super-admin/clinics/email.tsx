import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import ClinicEmailController from '@/actions/App/Http/Controllers/SuperAdmin/ClinicEmailController';
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

type Props = {
    clinic: { id: string; name: string };
    integration: {
        from_email: string | null;
        from_name: string | null;
        reply_to: string | null;
    };
};

export default function SuperAdminClinicEmail({ clinic, integration }: Props) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={t.cl_email_head.replace('{clinic}', clinic.name)} />

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
                        {t.cl_email_crumb}
                    </span>
                </div>

                <PageHeader
                    title={t.cl_email_title}
                    description={t.cl_email_desc.replace(
                        '{clinic}',
                        clinic.name,
                    )}
                />

                <SectionCard className="mt-6">
                    <Form
                        {...ClinicEmailController.update.form({
                            locale,
                            clinic: clinic.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="space-y-6 p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="from_email">
                                        {t.cl_email_from_address}
                                    </Label>
                                    <Input
                                        id="from_email"
                                        name="from_email"
                                        type="email"
                                        defaultValue={
                                            integration.from_email ?? ''
                                        }
                                        required
                                        autoComplete="off"
                                    />
                                    <InputError message={errors.from_email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="from_name">
                                        {t.cl_email_from_name}
                                    </Label>
                                    <Input
                                        id="from_name"
                                        name="from_name"
                                        defaultValue={
                                            integration.from_name ?? ''
                                        }
                                        autoComplete="off"
                                    />
                                    <InputError message={errors.from_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="reply_to">
                                        {t.cl_email_reply_to}
                                    </Label>
                                    <Input
                                        id="reply_to"
                                        name="reply_to"
                                        type="email"
                                        defaultValue={
                                            integration.reply_to ?? ''
                                        }
                                        autoComplete="off"
                                    />
                                    <InputError message={errors.reply_to} />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-navy-900 text-white hover:bg-navy-800"
                                >
                                    {processing && <Spinner />}
                                    {t.cl_email_submit}
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
