import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/use-locale';

export default function InviteInvalid() {
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title="Invitation unavailable" />

            <p className="text-center text-sm text-muted-foreground">
                This invitation link is invalid, has expired, or has already
                been used. Ask your administrator to send a new one.
            </p>

            <Button asChild className="mt-6 w-full">
                <Link href={`/${locale}`}>Go to homepage</Link>
            </Button>
        </>
    );
}

InviteInvalid.layout = {
    title: 'Invitation unavailable',
    description: 'This link can no longer be used',
};
