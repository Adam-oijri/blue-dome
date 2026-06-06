import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import vendors from '@/routes/vendors';

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

/**
 * Inline "add vendor" Sheet. Mirrors the standalone vendor create page in an
 * inline drawer; drop it anywhere and pass the trigger as `children`. Posts via
 * vendors.store and stays on the page. `is_active` is defaulted server-side.
 */
export function CreateVendorsSheet({ children }: { children: ReactNode }) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm({
        vendor_name: '',
        category: '',
        contact_person: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        tax_number: '',
        payment_terms: '',
        bank_account: '',
        notes: '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(vendors.store.url({ locale }), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    return (
        <Sheet
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (!next) {
                    form.reset();
                    form.clearErrors();
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.add_vendor}</SheetTitle>
                    <SheetDescription>{t.add_vendor_desc}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="vendor_name">
                                {t.vendor_name_label}
                            </Label>
                            <input
                                id="vendor_name"
                                type="text"
                                maxLength={255}
                                value={form.data.vendor_name}
                                onChange={(e) =>
                                    form.setData('vendor_name', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.vendor_name} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="category">
                                    {t.col_category}
                                </Label>
                                <input
                                    id="category"
                                    type="text"
                                    maxLength={100}
                                    value={form.data.category}
                                    onChange={(e) =>
                                        form.setData('category', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.category} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contact_person">
                                    {t.contact_person}
                                </Label>
                                <input
                                    id="contact_person"
                                    type="text"
                                    maxLength={200}
                                    value={form.data.contact_person}
                                    onChange={(e) =>
                                        form.setData(
                                            'contact_person',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.contact_person}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">{t.phone}</Label>
                                <input
                                    id="phone"
                                    type="tel"
                                    maxLength={50}
                                    value={form.data.phone}
                                    onChange={(e) =>
                                        form.setData('phone', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.phone} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t.email}</Label>
                                <input
                                    id="email"
                                    type="email"
                                    maxLength={255}
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData('email', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.email} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="website">{t.website}</Label>
                            <input
                                id="website"
                                type="url"
                                maxLength={255}
                                placeholder="https://"
                                value={form.data.website}
                                onChange={(e) =>
                                    form.setData('website', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.website} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">{t.address}</Label>
                            <textarea
                                id="address"
                                rows={2}
                                value={form.data.address}
                                onChange={(e) =>
                                    form.setData('address', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.address} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="tax_number">
                                    {t.tax_number}
                                </Label>
                                <input
                                    id="tax_number"
                                    type="text"
                                    maxLength={100}
                                    value={form.data.tax_number}
                                    onChange={(e) =>
                                        form.setData(
                                            'tax_number',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.tax_number} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="payment_terms">
                                    {t.payment_terms}
                                </Label>
                                <input
                                    id="payment_terms"
                                    type="text"
                                    maxLength={100}
                                    value={form.data.payment_terms}
                                    onChange={(e) =>
                                        form.setData(
                                            'payment_terms',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.payment_terms}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bank_account">
                                {t.bank_account}
                            </Label>
                            <input
                                id="bank_account"
                                type="text"
                                maxLength={255}
                                value={form.data.bank_account}
                                onChange={(e) =>
                                    form.setData('bank_account', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.bank_account} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">{t.notes_label}</Label>
                            <textarea
                                id="notes"
                                rows={3}
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.notes} />
                        </div>
                    </div>

                    <div className="border-t px-4 py-4">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                        >
                            {t.create_vendor}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
