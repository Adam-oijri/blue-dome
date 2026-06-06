import { Head, Link, setLayoutProps } from '@inertiajs/react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { useAuthLang } from '@/lib/i18n/auth-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { home, logout } from '@/routes';

export default function TrialExpired() {
    const { slug: locale } = useLocale();
    const { t } = useAuthLang();

    setLayoutProps({
        title: t.trial_expired_title,
        description: t.trial_expired_desc,
    });

    return (
        <>
            <Head title={t.trial_expired_title} />

            <div className="space-y-6 text-center">
                <p className="text-sm text-muted-foreground">
                    {t.trial_expired_body}
                </p>

                <Button
                    asChild
                    className="w-full bg-olive-600 text-white hover:bg-olive-700"
                >
                    <Link href={home({ locale })}>{t.trial_contact_btn}</Link>
                </Button>

                <TextLink
                    href={logout({ locale })}
                    className="mx-auto block text-sm"
                >
                    {t.log_out}
                </TextLink>
            </div>
        </>
    );
}
