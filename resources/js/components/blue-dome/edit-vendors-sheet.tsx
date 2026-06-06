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
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import vendors from '@/routes/vendors';

export type VendorEditable = {
    id: string;
    vendor_name: string;
    category: string | null;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    tax_number: string | null;
    payment_terms: string | null;
    bank_account: string | null;
    notes: string | null;
    is_active: boolean | null;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const CATEGORY_OPTIONS: ReadonlyArray<readonly [string, string]> = [
    ['supplies', 'Supplies'],
    ['utilities', 'Utilities'],
    ['maintenance', 'Maintenance'],
    ['professional_services', 'Professional services'],
];

const OTHER_CATEGORY = '__other__';

const KNOWN_CATEGORY_VALUES = CATEGORY_OPTIONS.map(([value]) => value);

/**
 * Inline "edit vendor" Sheet. Prefilled from the row; posts via PATCH to the
 * vendors.update endpoint and stays on the page. Category supports a free-text
 * `__other__` fallback for values outside the known option set.
 */
export function EditVendorsSheet({
    children,
    vendor,
}: {
    children: ReactNode;
    vendor: VendorEditable;
}) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();
    const [open, setOpen] = useState(false);

    const initialIsKnownCategory =
        vendor.category !== null &&
        vendor.category !== '' &&
        KNOWN_CATEGORY_VALUES.includes(vendor.category);

    const initialSelection = (): string => {
        if (vendor.category === null || vendor.category === '') {
            return '';
        }

        return initialIsKnownCategory ? vendor.category : OTHER_CATEGORY;
    };

    const [categorySelection, setCategorySelection] =
        useState<string>(initialSelection);

    const showCustomCategory = categorySelection === OTHER_CATEGORY;

    const form = useForm({
        vendor_name: vendor.vendor_name ?? '',
        category:
            vendor.category === null || vendor.category === ''
                ? ''
                : initialIsKnownCategory
                  ? vendor.category
                  : (vendor.category ?? ''),
        contact_person: vendor.contact_person ?? '',
        phone: vendor.phone ?? '',
        email: vendor.email ?? '',
        website: vendor.website ?? '',
        address: vendor.address ?? '',
        tax_number: vendor.tax_number ?? '',
        payment_terms: vendor.payment_terms ?? '',
        bank_account: vendor.bank_account ?? '',
        notes: vendor.notes ?? '',
        is_active: vendor.is_active ?? true,
    });

    const resetCategorySelection = (): void => {
        setCategorySelection(initialSelection());
    };

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.patch(vendors.update.url({ locale, vendor: vendor.id }), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
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
                    resetCategorySelection();
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.edit_vendor}</SheetTitle>
                    <SheetDescription>{t.edit_vendor_desc}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_vendor_name">
                                {t.vendor_name_label}
                            </Label>
                            <input
                                id="edit_vendor_name"
                                type="text"
                                value={form.data.vendor_name}
                                onChange={(e) =>
                                    form.setData('vendor_name', e.target.value)
                                }
                                className={FIELD_CLASS}
                                maxLength={255}
                                required
                            />
                            <InputError message={form.errors.vendor_name} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_category">
                                    {t.col_category}
                                </Label>
                                <select
                                    id="edit_category"
                                    value={categorySelection}
                                    onChange={(e) => {
                                        const next = e.target.value;
                                        setCategorySelection(next);

                                        if (next === OTHER_CATEGORY) {
                                            form.setData('category', '');
                                        } else {
                                            form.setData('category', next);
                                        }
                                    }}
                                    className={FIELD_CLASS}
                                >
                                    <option value="">{t.not_specified}</option>
                                    {CATEGORY_OPTIONS.map(([value]) => (
                                        <option key={value} value={value}>
                                            {enumLabel(
                                                t.vendor_category_opts,
                                                value,
                                            )}
                                        </option>
                                    ))}
                                    <option value={OTHER_CATEGORY}>
                                        {t.other_label}
                                    </option>
                                </select>
                                {showCustomCategory && (
                                    <input
                                        type="text"
                                        placeholder={t.custom_category_ph}
                                        value={form.data.category}
                                        onChange={(e) =>
                                            form.setData(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                        maxLength={100}
                                        autoFocus
                                    />
                                )}
                                <InputError message={form.errors.category} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_contact_person">
                                    {t.contact_person}
                                </Label>
                                <input
                                    id="edit_contact_person"
                                    type="text"
                                    value={form.data.contact_person}
                                    onChange={(e) =>
                                        form.setData(
                                            'contact_person',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                    maxLength={200}
                                />
                                <InputError
                                    message={form.errors.contact_person}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_phone">{t.phone}</Label>
                                <input
                                    id="edit_phone"
                                    type="tel"
                                    dir="ltr"
                                    value={form.data.phone}
                                    onChange={(e) =>
                                        form.setData('phone', e.target.value)
                                    }
                                    className={`${FIELD_CLASS} text-start`}
                                    maxLength={50}
                                />
                                <InputError message={form.errors.phone} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_email">{t.email}</Label>
                                <input
                                    id="edit_email"
                                    type="email"
                                    dir="ltr"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData('email', e.target.value)
                                    }
                                    className={`${FIELD_CLASS} text-start`}
                                    maxLength={255}
                                />
                                <InputError message={form.errors.email} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_website">{t.website}</Label>
                            <input
                                id="edit_website"
                                type="url"
                                dir="ltr"
                                placeholder="https://"
                                value={form.data.website}
                                onChange={(e) =>
                                    form.setData('website', e.target.value)
                                }
                                className={`${FIELD_CLASS} text-start`}
                                maxLength={255}
                            />
                            <InputError message={form.errors.website} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_address">{t.address}</Label>
                            <textarea
                                id="edit_address"
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
                                <Label htmlFor="edit_tax_number">
                                    {t.tax_number}
                                </Label>
                                <input
                                    id="edit_tax_number"
                                    type="text"
                                    value={form.data.tax_number}
                                    onChange={(e) =>
                                        form.setData(
                                            'tax_number',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                    maxLength={100}
                                />
                                <InputError message={form.errors.tax_number} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_payment_terms">
                                    {t.payment_terms}
                                </Label>
                                <input
                                    id="edit_payment_terms"
                                    type="text"
                                    value={form.data.payment_terms}
                                    onChange={(e) =>
                                        form.setData(
                                            'payment_terms',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                    maxLength={100}
                                />
                                <InputError
                                    message={form.errors.payment_terms}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_bank_account">
                                {t.bank_account}
                            </Label>
                            <input
                                id="edit_bank_account"
                                type="text"
                                value={form.data.bank_account}
                                onChange={(e) =>
                                    form.setData('bank_account', e.target.value)
                                }
                                className={FIELD_CLASS}
                                maxLength={255}
                            />
                            <InputError message={form.errors.bank_account} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_notes">{t.notes_label}</Label>
                            <textarea
                                id="edit_notes"
                                rows={3}
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.notes} />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) =>
                                    form.setData('is_active', e.target.checked)
                                }
                                className="size-4 rounded border-input accent-olive-600"
                            />
                            <span className="text-foreground">
                                {t.active_vendor}
                            </span>
                        </label>
                        <InputError message={form.errors.is_active} />
                    </div>

                    <div className="border-t px-4 py-4">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                        >
                            {t.save_changes}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
