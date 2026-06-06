import { Form, Head, setLayoutProps } from '@inertiajs/react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuthLang } from '@/lib/i18n/auth-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const { slug: locale } = useLocale();
    const { t } = useAuthLang();

    setLayoutProps({ title: t.verify_title, description: t.verify_desc });

    return (
        <>
            <Head title={t.verify_title} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-success">
                    {t.verify_sent}
                </div>
            )}

            <Form {...send.form({ locale })} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            className="bg-olive-600 text-white hover:bg-olive-700"
                        >
                            {processing && <Spinner />}
                            {t.resend_btn}
                        </Button>

                        <TextLink
                            href={logout({ locale })}
                            className="mx-auto block text-sm"
                        >
                            {t.log_out}
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}
