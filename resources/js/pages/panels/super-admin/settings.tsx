import { AccountSettingsPanel } from '@/components/settings/account-settings-panel';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    passwordRules: string;
}

export default function SuperAdminSettings(props: Props) {
    const { t } = useSuperAdminLang();

    return (
        <AccountSettingsPanel
            {...props}
            title={t.nav_settings}
            appearanceTitle={t.settings_appearance_title}
            appearanceHelp={t.settings_appearance_help}
        />
    );
}
