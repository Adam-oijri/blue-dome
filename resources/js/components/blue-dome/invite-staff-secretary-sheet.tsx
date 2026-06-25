import { router, useForm } from '@inertiajs/react';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { store as createInvitation } from '@/routes/secretary/staff/invitations';

const SELECT_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

/**
 * Clinic-side "invite staff" sheet for the secretary (clinic manager). Creates
 * a tokenized invitation scoped to the secretary's own clinic (the backend
 * forces clinic_id) for a doctor or secretary, then surfaces the shareable
 * activation link flashed back by the controller. Drop it anywhere and pass the
 * trigger as `children`.
 */
export function InviteStaffSecretarySheet({
    children,
}: {
    children: ReactNode;
}) {
    const { t } = useSecretaryLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const form = useForm({ role: 'secretary', first_name: '', last_name: '' });

    useEffect(() => {
        return router.on('flash', (event) => {
            const invite = (event as CustomEvent).detail?.flash?.invite as
                | { url: string }
                | undefined;

            if (invite?.url) {
                setInviteUrl(invite.url);
            }
        });
    }, []);

    const reset = (): void => {
        form.reset();
        form.clearErrors();
        setInviteUrl(null);
        setCopied(false);
    };

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        setInviteUrl(null);
        form.post(createInvitation.url({ locale }), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const copy = async (): Promise<void> => {
        if (!inviteUrl) {
            return;
        }

        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Sheet
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (!next) {
                    reset();
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.staff_invite}</SheetTitle>
                    <SheetDescription>{t.staff_invite_desc}</SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="space-y-4 px-4 pb-4">
                    <div className="grid gap-2">
                        <Label htmlFor="role">{t.staff_role_label}</Label>
                        <select
                            id="role"
                            value={form.data.role}
                            onChange={(e) =>
                                form.setData('role', e.target.value)
                            }
                            className={SELECT_CLASS}
                        >
                            <option value="secretary">
                                {t.staff_role_secretary}
                            </option>
                            <option value="doctor">
                                {t.staff_role_doctor}
                            </option>
                        </select>
                        <InputError message={form.errors.role} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="first_name">{t.staff_first_name}</Label>
                        <Input
                            id="first_name"
                            value={form.data.first_name}
                            onChange={(e) =>
                                form.setData('first_name', e.target.value)
                            }
                            autoComplete="off"
                        />
                        <InputError message={form.errors.first_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="last_name">{t.staff_last_name}</Label>
                        <Input
                            id="last_name"
                            value={form.data.last_name}
                            onChange={(e) =>
                                form.setData('last_name', e.target.value)
                            }
                            autoComplete="off"
                        />
                        <InputError message={form.errors.last_name} />
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="w-full bg-olive-600 text-white hover:bg-olive-700"
                    >
                        {t.staff_generate_link}
                    </Button>
                </form>

                {inviteUrl && (
                    <div className="mx-4 rounded-lg border border-border bg-muted/40 p-3">
                        <div className="mb-1.5 text-[12px] font-medium text-muted-foreground">
                            {t.staff_invite_link}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                readOnly
                                value={inviteUrl}
                                onFocus={(e) => e.currentTarget.select()}
                                className="h-9 w-full rounded-md border border-input bg-background px-2 text-[12px] outline-none"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-9 shrink-0"
                                onClick={copy}
                                aria-label={t.staff_copy_link}
                            >
                                {copied ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
