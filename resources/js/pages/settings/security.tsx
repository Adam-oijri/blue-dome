import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import TwoFactorSection from '@/components/settings/two-factor-section';
import UpdatePasswordForm from '@/components/settings/update-password-form';
import { useSettingsLang } from '@/lib/i18n/settings';

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    passwordRules: string;
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
    passwordRules,
}: Props) {
    const { t } = useSettingsLang();

    return (
        <>
            <Head title={t.security_settings_title} />

            <h1 className="sr-only">{t.security_settings_title}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t.password_heading}
                    description={t.password_desc}
                />

                <UpdatePasswordForm passwordRules={passwordRules} />
            </div>

            {canManageTwoFactor && (
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title={t.twofa_heading}
                        description={t.twofa_desc}
                    />

                    <TwoFactorSection
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                    />
                </div>
            )}
        </>
    );
}
