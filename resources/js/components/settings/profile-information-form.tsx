import { Form, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsLang } from '@/lib/i18n/settings';
import { useLocale } from '@/lib/i18n/use-locale';
import { send } from '@/routes/verification';

export default function ProfileInformationForm({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const { slug: locale } = useLocale();
    const { t } = useSettingsLang();

    return (
        <Form
            {...ProfileController.update.form({ locale })}
            options={{
                preserveScroll: true,
            }}
            className="space-y-6"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t.name_label}</Label>

                        <Input
                            id="name"
                            className="mt-1 block w-full"
                            defaultValue={auth.user.name}
                            name="name"
                            required
                            autoComplete="name"
                            placeholder={t.name_ph}
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">{t.email_label}</Label>

                        <Input
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            defaultValue={auth.user.email}
                            name="email"
                            required
                            autoComplete="username"
                            placeholder={t.email_ph}
                        />

                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    {mustVerifyEmail &&
                        auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    {t.email_unverified}{' '}
                                    <Link
                                        href={send({ locale })}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        {t.resend_verification_link}
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        {t.verification_sent}
                                    </div>
                                )}
                            </div>
                        )}

                    <div className="flex items-center gap-4">
                        <Button
                            disabled={processing}
                            data-test="update-profile-button"
                        >
                            {t.save_btn}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
