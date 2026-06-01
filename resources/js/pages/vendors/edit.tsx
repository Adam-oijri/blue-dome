import { Form, Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';

import VendorController from '@/actions/App/Http/Controllers/VendorController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import vendors from '@/routes/vendors';

type Vendor = {
    id: string;
    vendor_name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    website: string | null;
    tax_number: string | null;
    category: string | null;
    payment_terms: string | null;
    bank_account: string | null;
    notes: string | null;
    is_active: boolean;
};

interface Props {
    vendor: Vendor;
}

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const CATEGORY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
    { value: 'supplies', label: 'Supplies' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'professional_services', label: 'Professional services' },
];

const OTHER_CATEGORY = '__other__';

const KNOWN_CATEGORY_VALUES = CATEGORY_OPTIONS.map((option) => option.value);

export default function VendorEdit({ vendor }: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const initialIsKnownCategory =
        vendor.category !== null &&
        KNOWN_CATEGORY_VALUES.includes(vendor.category);

    const [categorySelection, setCategorySelection] = useState<string>(() => {
        if (vendor.category === null || vendor.category === '') {
            return '';
        }

        return initialIsKnownCategory ? vendor.category : OTHER_CATEGORY;
    });

    const showCustomCategory = categorySelection === OTHER_CATEGORY;

    function handleDelete() {
        if (!window.confirm(t.delete_vendor_confirm)) {
            return;
        }

        router.delete(vendors.destroy.url({ locale, vendor: vendor.id }), {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`${t.edit} · ${vendor.vendor_name}`} />

            <div className="px-8 py-6 lg:px-10">
                <Link
                    href={vendors.show.url({ locale, vendor: vendor.id })}
                    className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5 rtl:rotate-180" />
                    {vendor.vendor_name}
                </Link>

                <PageHeader
                    title={t.edit_vendor}
                    description={t.edit_vendor_desc}
                    actions={
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDelete}
                            className="text-danger hover:text-danger"
                        >
                            <Trash2 className="size-4" />
                            {t.delete_action}
                        </Button>
                    }
                />

                <Form
                    {...VendorController.update.form({
                        locale,
                        vendor: vendor.id,
                    })}
                    options={{ preserveScroll: true }}
                    className="max-w-3xl space-y-6"
                >
                    {({
                        processing,
                        errors,
                    }: {
                        processing: boolean;
                        errors: Record<string, string>;
                    }) => (
                        <>
                            <SectionCard
                                title={t.vendor_details}
                                bodyClassName="space-y-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="vendor_name">
                                        {t.vendor_name_label}
                                    </Label>
                                    <input
                                        id="vendor_name"
                                        name="vendor_name"
                                        type="text"
                                        defaultValue={vendor.vendor_name ?? ''}
                                        className={FIELD_CLASS}
                                        required
                                    />
                                    <InputError message={errors.vendor_name} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">
                                            {t.col_category}
                                        </Label>
                                        <select
                                            id="category"
                                            name={
                                                showCustomCategory
                                                    ? undefined
                                                    : 'category'
                                            }
                                            value={categorySelection}
                                            onChange={(event) =>
                                                setCategorySelection(
                                                    event.target.value,
                                                )
                                            }
                                            className={FIELD_CLASS}
                                        >
                                            <option value="">
                                                {t.not_specified}
                                            </option>
                                            {CATEGORY_OPTIONS.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {enumLabel(
                                                        t.vendor_category_opts,
                                                        option.value,
                                                    )}
                                                </option>
                                            ))}
                                            <option value={OTHER_CATEGORY}>
                                                {t.other_label}
                                            </option>
                                        </select>
                                        {showCustomCategory && (
                                            <input
                                                name="category"
                                                type="text"
                                                placeholder={t.custom_category_ph}
                                                defaultValue={
                                                    initialIsKnownCategory
                                                        ? ''
                                                        : (vendor.category ?? '')
                                                }
                                                className={FIELD_CLASS}
                                                maxLength={100}
                                                autoFocus
                                            />
                                        )}
                                        <InputError message={errors.category} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="is_active">
                                            {t.col_status}
                                        </Label>
                                        <select
                                            id="is_active"
                                            name="is_active"
                                            defaultValue={
                                                vendor.is_active ? '1' : '0'
                                            }
                                            className={FIELD_CLASS}
                                        >
                                            <option value="1">
                                                {t.active_label}
                                            </option>
                                            <option value="0">
                                                {t.inactive_label}
                                            </option>
                                        </select>
                                        <InputError message={errors.is_active} />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                title={t.contact_label}
                                bodyClassName="space-y-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="contact_person">
                                        {t.contact_person}
                                    </Label>
                                    <input
                                        id="contact_person"
                                        name="contact_person"
                                        type="text"
                                        defaultValue={vendor.contact_person ?? ''}
                                        className={FIELD_CLASS}
                                        maxLength={200}
                                    />
                                    <InputError
                                        message={errors.contact_person}
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            {t.phone}
                                        </Label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            dir="ltr"
                                            defaultValue={vendor.phone ?? ''}
                                            className={`${FIELD_CLASS} text-start`}
                                            maxLength={50}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            {t.email}
                                        </Label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            dir="ltr"
                                            defaultValue={vendor.email ?? ''}
                                            className={`${FIELD_CLASS} text-start`}
                                            maxLength={255}
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                title={t.notes_label}
                                bodyClassName="space-y-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">
                                        {t.notes_label}
                                    </Label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={4}
                                        defaultValue={vendor.notes ?? ''}
                                        className={TEXTAREA_CLASS}
                                    />
                                    <InputError message={errors.notes} />
                                </div>
                            </SectionCard>

                            <div className="flex items-center gap-3">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-olive-600 text-white hover:bg-olive-700"
                                >
                                    {t.save_changes}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link
                                        href={vendors.show.url({
                                            locale,
                                            vendor: vendor.id,
                                        })}
                                    >
                                        {t.cancel_label}
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
