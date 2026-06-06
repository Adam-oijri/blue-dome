import { Form, Head, setLayoutProps } from '@inertiajs/react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthLang } from '@/lib/i18n/auth-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const { slug: locale } = useLocale();
    const { t } = useAuthLang();

    setLayoutProps({ title: t.login_title, description: t.login_desc });

    return (
        <>
            <Head title={t.login_title} />

            <Form
                {...store.form({ locale })}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t.email_label}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder={t.email_ph}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">
                                        {t.password_label}
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request({ locale })}
                                            className="ms-auto text-sm"
                                            tabIndex={5}
                                        >
                                            {t.forgot_link}
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder={t.password_ph}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">{t.remember_me}</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full bg-olive-600 text-white hover:bg-olive-700"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {t.log_in_btn}
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                {t.no_account}{' '}
                                <TextLink
                                    href={`/${locale}/register`}
                                    tabIndex={5}
                                >
                                    {t.sign_up}
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-success">
                    {status}
                </div>
            )}
        </>
    );
}
