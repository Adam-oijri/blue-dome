import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import TwoFactorSection from '@/components/settings/two-factor-section';
import UpdatePasswordForm from '@/components/settings/update-password-form';

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
    return (
        <>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Update password"
                    description="Ensure your account is using a long, random password to stay secure"
                />

                <UpdatePasswordForm passwordRules={passwordRules} />
            </div>

            {canManageTwoFactor && (
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Two-factor authentication"
                        description="Manage your two-factor authentication settings"
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
