import { Head } from '@inertiajs/react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import ProfileInformationForm from '@/components/settings/profile-information-form';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile information"
                    description="Update your name and email address"
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
