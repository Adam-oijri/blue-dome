import { router, useForm } from '@inertiajs/react';
import { Check, Copy, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { store as createInvitation } from '@/routes/super-admin/invitations';

type ClinicOpt = { id: string; name: string };

const SELECT_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

export function InviteStaffSheet({ clinics }: { clinics: ClinicOpt[] }) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const form = useForm({
        role: 'doctor',
        clinic_id: '',
        first_name: '',
        last_name: '',
    });

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
            <SheetTrigger asChild>
                <Button className="gap-1.5 bg-olive-600 text-white hover:bg-olive-700">
                    <UserPlus className="size-4" />
                    {t.invite_staff}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.invite_staff}</SheetTitle>
                    <SheetDescription>{t.invite_staff_desc}</SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="space-y-4 px-4">
                    <div className="grid gap-2">
                        <Label htmlFor="role">{t.role_label}</Label>
                        <select
                            id="role"
                            value={form.data.role}
                            onChange={(e) =>
                                form.setData('role', e.target.value)
                            }
                            className={SELECT_CLASS}
                        >
                            <option value="doctor">{t.role_doctor}</option>
                            <option value="secretary">
                                {t.role_secretary}
                            </option>
                        </select>
                        <InputError message={form.errors.role} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="clinic_id">{t.clinic_label}</Label>
                        <select
                            id="clinic_id"
                            value={form.data.clinic_id}
                            onChange={(e) =>
                                form.setData('clinic_id', e.target.value)
                            }
                            className={SELECT_CLASS}
                        >
                            <option value="">{t.select_clinic_ph}</option>
                            {clinics.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={form.errors.clinic_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="first_name">{t.first_name}</Label>
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
                        <Label htmlFor="last_name">{t.last_name}</Label>
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

                    <Button type="submit" disabled={form.processing}>
                        {t.generate_invite_link}
                    </Button>
                </form>

                {inviteUrl && (
                    <div className="mx-4 mt-4 rounded-lg border border-border bg-muted/40 p-3">
                        <div className="mb-1.5 text-[12px] font-medium text-muted-foreground">
                            {t.invite_link}
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
                                aria-label={t.copy_invite_link}
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
