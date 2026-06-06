import { Form, Head, setLayoutProps } from '@inertiajs/react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthLang } from '@/lib/i18n/auth-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const { slug: locale } = useLocale();
    const { t } = useAuthLang();

    setLayoutProps({ title: t.register_title, description: t.register_desc });

    return (
        <>
            <Head title={t.register_title} />

            <Form
                {...store.form({ locale })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="rounded-md bg-olive-50 px-3 py-2 text-center text-sm font-medium text-olive-700">
                                {t.trial_badge}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">
                                        {t.first_name_label}
                                    </Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="given-name"
                                        placeholder={t.first_name_ph}
                                    />
                                    <InputError message={errors.first_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">
                                        {t.last_name_label}
                                    </Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        required
                                        tabIndex={2}
                                        autoComplete="family-name"
                                        placeholder={t.last_name_ph}
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="clinic_name">
                                    {t.clinic_name_label}
                                </Label>
                                <Input
                                    id="clinic_name"
                                    name="clinic_name"
                                    tabIndex={3}
                                    autoComplete="organization"
                                    placeholder={t.clinic_name_ph}
                                />
                                <InputError message={errors.clinic_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t.email_label}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    tabIndex={4}
                                    autoComplete="email"
                                    placeholder={t.email_ph}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t.password_label}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    placeholder={t.password_ph}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t.confirm_password_label}
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    tabIndex={6}
                                    autoComplete="new-password"
                                    placeholder={t.confirm_password_ph}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-olive-600 text-white hover:bg-olive-700"
                                tabIndex={7}
                                disabled={processing}
                                data-test="register-button"
                            >
                                {processing && <Spinner />}
                                {t.create_account_btn}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            {t.have_account}{' '}
                            <TextLink href={login({ locale })} tabIndex={8}>
                                {t.log_in_link}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
