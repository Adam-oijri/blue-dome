import { Form, Head, setLayoutProps } from '@inertiajs/react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthLang } from '@/lib/i18n/auth-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const { slug: locale } = useLocale();
    const { t } = useAuthLang();

    setLayoutProps({ title: t.confirm_title, description: t.confirm_desc });

    return (
        <>
            <Head title={t.confirm_title} />

            <Form {...store.form({ locale })} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t.password_label}</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder={t.password_ph}
                                autoComplete="current-password"
                                autoFocus
                            />

                            <InputError message={errors.password} />
                        </div>

                        <Button
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner />}
                            {t.confirm_btn}
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}
