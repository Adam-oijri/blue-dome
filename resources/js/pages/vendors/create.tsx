import { Form, Head, Link } from '@inertiajs/react';

import VendorController from '@/actions/App/Http/Controllers/VendorController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import vendors from '@/routes/vendors';

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

export default function VendorCreate() {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={t.add_vendor} />

            <div className="mx-auto w-full max-w-3xl p-6">
                <PageHeader
                    title={t.add_vendor}
                    description={t.add_vendor_desc}
                    actions={
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                        >
                            <Link href={vendors.index.url({ locale })}>
                                {t.back_to_vendors}
                            </Link>
                        </Button>
                    }
                />

                <Form
                    {...VendorController.store.form({ locale })}
                    options={{ preserveScroll: true }}
                    className="space-y-6"
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
                                        required
                                        maxLength={255}
                                        className={FIELD_CLASS}
                                    />
                                    <InputError message={errors.vendor_name} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">
                                            {t.col_category}
                                        </Label>
                                        <input
                                            id="category"
                                            name="category"
                                            type="text"
                                            maxLength={100}
                                            className={FIELD_CLASS}
                                        />
                                        <InputError message={errors.category} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="contact_person">
                                            {t.contact_person}
                                        </Label>
                                        <input
                                            id="contact_person"
                                            name="contact_person"
                                            type="text"
                                            maxLength={200}
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={errors.contact_person}
                                        />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                title={t.contact_label}
                                bodyClassName="space-y-4"
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            {t.phone}
                                        </Label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            maxLength={50}
                                            className={FIELD_CLASS}
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
                                            maxLength={255}
                                            className={FIELD_CLASS}
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="website">
                                        {t.website}
                                    </Label>
                                    <input
                                        id="website"
                                        name="website"
                                        type="url"
                                        maxLength={255}
                                        placeholder="https://"
                                        className={FIELD_CLASS}
                                    />
                                    <InputError message={errors.website} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">
                                        {t.address}
                                    </Label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows={2}
                                        className={TEXTAREA_CLASS}
                                    />
                                    <InputError message={errors.address} />
                                </div>
                            </SectionCard>

                            <SectionCard
                                title={t.billing_label}
                                bodyClassName="space-y-4"
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tax_number">
                                            {t.tax_number}
                                        </Label>
                                        <input
                                            id="tax_number"
                                            name="tax_number"
                                            type="text"
                                            maxLength={100}
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={errors.tax_number}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="payment_terms">
                                            {t.payment_terms}
                                        </Label>
                                        <input
                                            id="payment_terms"
                                            name="payment_terms"
                                            type="text"
                                            maxLength={100}
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={errors.payment_terms}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bank_account">
                                        {t.bank_account}
                                    </Label>
                                    <input
                                        id="bank_account"
                                        name="bank_account"
                                        type="text"
                                        maxLength={255}
                                        className={FIELD_CLASS}
                                    />
                                    <InputError message={errors.bank_account} />
                                </div>
                            </SectionCard>

                            <SectionCard
                                title={t.additional_label}
                                bodyClassName="space-y-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">
                                        {t.notes_label}
                                    </Label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        className={TEXTAREA_CLASS}
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="hidden"
                                        name="is_active"
                                        value="0"
                                    />
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        value="1"
                                        defaultChecked
                                        className="size-4 rounded border-input accent-olive-600"
                                    />
                                    <span className="text-foreground">
                                        {t.active_vendor}
                                    </span>
                                </label>
                                <InputError message={errors.is_active} />
                            </SectionCard>

                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    asChild
                                    variant="outline"
                                >
                                    <Link href={vendors.index.url({ locale })}>
                                        {t.cancel_label}
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-olive-600 text-white hover:bg-olive-700"
                                >
                                    {t.create_vendor}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
