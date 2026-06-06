import { Form, Head, setLayoutProps } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthLang } from '@/lib/i18n/auth-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const { slug: locale } = useLocale();
    const { t } = useAuthLang();

    setLayoutProps({ title: t.forgot_title, description: t.forgot_desc });

    return (
        <>
            <Head title={t.forgot_title} />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-success">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form({ locale })}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t.email_label}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder={t.email_ph}
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6">
                                <Button
                                    className="w-full bg-olive-600 text-white hover:bg-olive-700"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && <Spinner />}
                                    {t.send_reset_btn}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>{t.or_return_to}</span>{' '}
                    <TextLink href={login({ locale })}>{t.log_in_link}</TextLink>
                </div>
            </div>
        </>
    );
}
