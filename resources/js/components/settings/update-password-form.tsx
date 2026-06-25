import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSettingsLang } from '@/lib/i18n/settings';
import { useLocale } from '@/lib/i18n/use-locale';

export default function UpdatePasswordForm({
    passwordRules,
}: {
    passwordRules: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { slug: locale } = useLocale();
    const { t } = useSettingsLang();

    return (
        <Form
            {...SecurityController.update.form({ locale })}
            options={{
                preserveScroll: true,
            }}
            resetOnError={[
                'password',
                'password_confirmation',
                'current_password',
            ]}
            resetOnSuccess
            onError={(errors) => {
                if (errors.password) {
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    currentPasswordInput.current?.focus();
                }
            }}
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="current_password">
                            {t.current_password_label}
                        </Label>

                        <PasswordInput
                            id="current_password"
                            ref={currentPasswordInput}
                            name="current_password"
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            placeholder={t.current_password_ph}
                        />

                        <InputError message={errors.current_password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">{t.new_password_label}</Label>

                        <PasswordInput
                            id="password"
                            ref={passwordInput}
                            name="password"
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder={t.new_password_ph}
                            passwordrules={passwordRules}
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
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder={t.confirm_password_ph}
                            passwordrules={passwordRules}
                        />

                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            disabled={processing}
                            data-test="update-password-button"
                        >
                            {t.save_password_btn}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
