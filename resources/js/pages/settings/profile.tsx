import { Head } from '@inertiajs/react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import ProfileInformationForm from '@/components/settings/profile-information-form';
import { useSettingsLang } from '@/lib/i18n/settings';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { t } = useSettingsLang();

    return (
        <>
            <Head title={t.profile_settings_title} />

            <h1 className="sr-only">{t.profile_settings_title}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t.profile_heading}
                    description={t.profile_desc}
                />

                <ProfileInformationForm
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                />
            </div>

            <DeleteUser />
        </>
    );
}
