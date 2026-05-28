import { AccountSettingsPanel } from '@/components/settings/account-settings-panel';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    passwordRules: string;
}

export default function SecretarySettings(props: Props) {
    const { t } = useSecretaryLang();

    return (
        <AccountSettingsPanel
            {...props}
            title={t.nav_settings}
            appearanceTitle={t.settings_appearance_title}
            appearanceHelp={t.settings_appearance_help}
        />
    );
}
