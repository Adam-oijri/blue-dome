import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useLocale } from '@/lib/i18n/use-locale';
import { accept } from '@/routes/invitations';

type Props = {
    token: string;
    role: string;
    firstName: string;
    lastName: string;
    clinicName: string | null;
};

export default function AcceptInvite({
    token,
    role,
    firstName,
    lastName,
    clinicName,
}: Props) {
    const { slug: locale } = useLocale();
    const isDoctor = role === 'doctor';

    return (
        <>
            <Head title="Accept invitation" />

            <div className="mb-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                You&apos;re invited as{' '}
                <span className="font-semibold">
                    {isDoctor ? 'Dr. ' : ''}
                    {firstName} {lastName}
                </span>
                <span className="text-muted-foreground">
                    {' '}
                    · {isDoctor ? 'Doctor' : 'Secretary'}
                    {clinicName ? ` · ${clinicName}` : ''}
                </span>
            </div>

            <Form
                {...accept.form({ locale, token })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="new-password"
                                placeholder="Password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirm password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                autoComplete="new-password"
                                placeholder="Confirm password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Create my account
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

AcceptInvite.layout = {
    title: 'Accept your invitation',
    description: 'Set your email and password to activate your account',
};
