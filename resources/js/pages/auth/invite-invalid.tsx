import { Head, Link, setLayoutProps } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { useAuthLang } from '@/lib/i18n/auth-context';
import { useLocale } from '@/lib/i18n/use-locale';

export default function InviteInvalid() {
    const { slug: locale } = useLocale();
    const { t } = useAuthLang();

    setLayoutProps({
        title: t.invite_invalid_title,
        description: t.invite_invalid_desc,
    });

    return (
        <>
            <Head title={t.invite_invalid_title} />

            <p className="text-center text-sm text-muted-foreground">
                {t.invite_invalid_body}
            </p>

            <Button
                asChild
                className="mt-6 w-full bg-olive-600 text-white hover:bg-olive-700"
            >
                <Link href={`/${locale}`}>{t.go_home}</Link>
            </Button>
        </>
    );
}
