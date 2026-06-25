import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { useSettingsLang } from '@/lib/i18n/settings';

export default function Appearance() {
    const { t } = useSettingsLang();

    return (
        <>
            <Head title={t.appearance_settings_title} />

            <h1 className="sr-only">{t.appearance_settings_title}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t.appearance_settings_title}
                    description={t.appearance_settings_desc}
                />
                <AppearanceTabs />
            </div>
        </>
    );
}
