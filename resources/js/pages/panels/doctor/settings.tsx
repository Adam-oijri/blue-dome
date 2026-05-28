import { AccountSettingsPanel } from '@/components/settings/account-settings-panel';
import { useDoctorLang } from '@/lib/i18n/doctor-context';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    passwordRules: string;
}

export default function DoctorSettings(props: Props) {
    const { t } = useDoctorLang();

    return (
        <AccountSettingsPanel
            {...props}
            title={t.settings}
            appearanceTitle={t.settings_appearance_title}
            appearanceHelp={t.settings_appearance_help}
        />
    );
}
