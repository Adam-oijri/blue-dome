import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import ClinicWhatsAppController from '@/actions/App/Http/Controllers/SuperAdmin/ClinicWhatsAppController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

type Integration = {
    phone_number_id: string;
    business_account_id: string;
    display_phone_number: string | null;
    daily_message_limit: number;
    is_active: boolean;
    webhook_verified: boolean;
    messages_sent_today: number | null;
    quality_rating: string | null;
    messaging_limit_tier: string | null;
    has_access_token: boolean;
    has_app_secret: boolean;
    has_webhook_verify_token: boolean;
};

type Props = {
    clinic: { id: string; name: string };
    webhookUrl: string;
    integration: Integration | null;
};

export default function SuperAdminClinicWhatsApp({
    clinic,
    webhookUrl,
    integration,
}: Props) {
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={`${clinic.name} — WhatsApp`} />

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
                    <span className="text-[13px] font-semibold">WhatsApp</span>
                </div>

                <PageHeader
                    title="WhatsApp Cloud API"
                    description={`Editing the Meta WhatsApp Business integration for ${clinic.name}.`}
                />

                <SectionCard className="mt-6">
                    <div className="space-y-6 p-6">
                        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                            <div className="mb-1 font-medium">Webhook URL</div>
                            <code className="block rounded border bg-background px-2 py-1.5 text-xs">
                                {webhookUrl}
                            </code>
                        </div>

                        <Form
                            {...ClinicWhatsAppController.update.form({
                                locale,
                                clinic: clinic.id,
                            })}
                            options={{ preserveScroll: true }}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone_number_id">
                                            Phone number ID
                                        </Label>
                                        <Input
                                            id="phone_number_id"
                                            name="phone_number_id"
                                            defaultValue={
                                                integration?.phone_number_id ??
                                                ''
                                            }
                                            required
                                            autoComplete="off"
                                        />
                                        <InputError
                                            message={errors.phone_number_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="business_account_id">
                                            WhatsApp Business Account ID
                                        </Label>
                                        <Input
                                            id="business_account_id"
                                            name="business_account_id"
                                            defaultValue={
                                                integration?.business_account_id ??
                                                ''
                                            }
                                            required
                                            autoComplete="off"
                                        />
                                        <InputError
                                            message={errors.business_account_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="display_phone_number">
                                            Display phone number
                                        </Label>
                                        <Input
                                            id="display_phone_number"
                                            name="display_phone_number"
                                            defaultValue={
                                                integration?.display_phone_number ??
                                                ''
                                            }
                                            autoComplete="off"
                                        />
                                        <InputError
                                            message={
                                                errors.display_phone_number
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="access_token">
                                            Access token
                                            {integration?.has_access_token && (
                                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                    (saved &mdash; leave blank
                                                    to keep current)
                                                </span>
                                            )}
                                        </Label>
                                        <PasswordInput
                                            id="access_token"
                                            name="access_token"
                                            autoComplete="off"
                                        />
                                        <InputError
                                            message={errors.access_token}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="app_secret">
                                            App secret
                                            {integration?.has_app_secret && (
                                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                    (saved &mdash; leave blank
                                                    to keep current)
                                                </span>
                                            )}
                                        </Label>
                                        <PasswordInput
                                            id="app_secret"
                                            name="app_secret"
                                            autoComplete="off"
                                        />
                                        <InputError
                                            message={errors.app_secret}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="webhook_verify_token">
                                            Webhook verify token
                                            {integration?.has_webhook_verify_token && (
                                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                    (saved &mdash; leave blank
                                                    to keep current)
                                                </span>
                                            )}
                                        </Label>
                                        <PasswordInput
                                            id="webhook_verify_token"
                                            name="webhook_verify_token"
                                            autoComplete="off"
                                        />
                                        <InputError
                                            message={
                                                errors.webhook_verify_token
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="daily_message_limit">
                                            Daily message limit
                                        </Label>
                                        <Input
                                            id="daily_message_limit"
                                            name="daily_message_limit"
                                            type="number"
                                            min={0}
                                            defaultValue={
                                                integration?.daily_message_limit ??
                                                1000
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.daily_message_limit}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="is_active"
                                            name="is_active"
                                            value="1"
                                            defaultChecked={
                                                integration?.is_active ?? true
                                            }
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="font-normal"
                                        >
                                            Active
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-navy-900 text-white hover:bg-navy-800"
                                    >
                                        {processing && <Spinner />}
                                        Save WhatsApp settings
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>
                </SectionCard>
            </div>
        </>
    );
}
