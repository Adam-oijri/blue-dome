import { Form, Head, setLayoutProps } from '@inertiajs/react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthLang } from '@/lib/i18n/auth-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { accept } from '@/routes/invitations';

type Props = {
    token: string;
    role: string;
    firstName: string;
    lastName: string;
    clinicName: string | null;
};

export default function AcceptInvite({
    token,
    role,
    firstName,
    lastName,
    clinicName,
}: Props) {
    const { slug: locale } = useLocale();
    const { t } = useAuthLang();
    const isDoctor = role === 'doctor';

    setLayoutProps({ title: t.invite_title, description: t.invite_desc });

    return (
        <>
            <Head title={t.invite_title} />

            <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                {t.invited_as}{' '}
                <span className="font-semibold">
                    {isDoctor ? 'Dr. ' : ''}
                    {firstName} {lastName}
                </span>
                <span className="text-muted-foreground">
                    {' · '}
                    {isDoctor ? t.role_doctor : t.role_secretary}
                    {clinicName ? ` · ${clinicName}` : ''}
                </span>
            </div>

            <Form
                {...accept.form({ locale, token })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t.email_label}</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder={t.email_ph}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">{t.password_label}</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
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
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            {t.create_account_btn}
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}
