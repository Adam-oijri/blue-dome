import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Building2,
    Edit3,
    Globe,
    Mail,
    Phone,
    Receipt,
    Trash2,
    User,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { EditVendorsSheet } from '@/components/blue-dome/edit-vendors-sheet';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
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
    is_active: boolean | null;
    created_at: string | null;
    updated_at: string | null;
};

interface Props {
    vendor: Vendor;
}

function humanize(value: string | null): string {
    return value ? value.replace(/_/g, ' ') : '—';
}

function normalizeUrl(value: string): string {
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function DetailRow({
    icon,
    label,
    children,
}: {
    icon: ReactNode;
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {icon}
            </span>
            <div className="min-w-0">
                <div className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                    {label}
                </div>
                <div className="mt-0.5 text-[13px] break-words text-foreground">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function VendorShow({ vendor }: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const handleDelete = (): void => {
        if (
            !window.confirm(
                t.delete_vendor_confirm.replace('{name}', vendor.vendor_name),
            )
        ) {
            return;
        }

        router.delete(vendors.destroy.url({ locale, vendor: vendor.id }), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={vendor.vendor_name} />

            <div className="px-8 py-6 lg:px-10">
                <Link
                    href={vendors.index.url({ locale })}
                    className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    {t.vendors}
                </Link>

                <PageHeader
                    title={
                        <span className="flex items-center gap-3">
                            {vendor.vendor_name}
                            <StatusPill
                                tone={vendor.is_active ? 'success' : 'neutral'}
                                withDot
                            >
                                {vendor.is_active
                                    ? t.active_label
                                    : t.inactive_label}
                            </StatusPill>
                        </span>
                    }
                    description={
                        vendor.category
                            ? `${t.col_category}: ${enumLabel(t.vendor_category_opts, vendor.category)}`
                            : undefined
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            <EditVendorsSheet vendor={vendor}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Edit3 className="size-3.5" />
                                    {t.edit}
                                </Button>
                            </EditVendorsSheet>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="gap-2 text-danger hover:text-danger"
                            >
                                <Trash2 className="size-3.5" />
                                {t.delete_action}
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-5 lg:grid-cols-2">
                    <SectionCard
                        title={t.contact_label}
                        titleIcon={<User className="size-4" />}
                        bodyClassName="divide-y divide-border px-5 py-2"
                    >
                        <DetailRow
                            icon={<User className="size-4" />}
                            label={t.contact_person}
                        >
                            {vendor.contact_person ?? '—'}
                        </DetailRow>
                        <DetailRow
                            icon={<Phone className="size-4" />}
                            label={t.phone}
                        >
                            {vendor.phone ? (
                                <a
                                    href={`tel:${vendor.phone}`}
                                    className="tabular-nums hover:text-olive-700 hover:underline"
                                >
                                    {vendor.phone}
                                </a>
                            ) : (
                                '—'
                            )}
                        </DetailRow>
                        <DetailRow
                            icon={<Mail className="size-4" />}
                            label={t.email}
                        >
                            {vendor.email ? (
                                <a
                                    href={`mailto:${vendor.email}`}
                                    className="hover:text-olive-700 hover:underline"
                                >
                                    {vendor.email}
                                </a>
                            ) : (
                                '—'
                            )}
                        </DetailRow>
                        <DetailRow
                            icon={<Globe className="size-4" />}
                            label={t.website}
                        >
                            {vendor.website ? (
                                <a
                                    href={normalizeUrl(vendor.website)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-olive-700 hover:underline"
                                >
                                    {vendor.website}
                                </a>
                            ) : (
                                '—'
                            )}
                        </DetailRow>
                        <DetailRow
                            icon={<Building2 className="size-4" />}
                            label={t.address}
                        >
                            {vendor.address ? (
                                <span className="whitespace-pre-line">
                                    {vendor.address}
                                </span>
                            ) : (
                                '—'
                            )}
                        </DetailRow>
                    </SectionCard>

                    <SectionCard
                        title={t.billing_label}
                        titleIcon={<Receipt className="size-4" />}
                        bodyClassName="divide-y divide-border px-5 py-2"
                    >
                        <DetailRow
                            icon={<Building2 className="size-4" />}
                            label={t.col_category}
                        >
                            {enumLabel(t.vendor_category_opts, vendor.category)}
                        </DetailRow>
                        <DetailRow
                            icon={<Receipt className="size-4" />}
                            label={t.tax_number}
                        >
                            <span className="tabular-nums">
                                {vendor.tax_number ?? '—'}
                            </span>
                        </DetailRow>
                        <DetailRow
                            icon={<Receipt className="size-4" />}
                            label={t.payment_terms}
                        >
                            {humanize(vendor.payment_terms)}
                        </DetailRow>
                        <DetailRow
                            icon={<Banknote className="size-4" />}
                            label={t.bank_account}
                        >
                            <span className="tabular-nums">
                                {vendor.bank_account ?? '—'}
                            </span>
                        </DetailRow>
                    </SectionCard>
                </div>

                {vendor.notes && (
                    <SectionCard title={t.notes_label} className="mt-5">
                        <p className="text-[13px] whitespace-pre-line text-foreground">
                            {vendor.notes}
                        </p>
                    </SectionCard>
                )}

                <div className="mt-5 flex flex-wrap gap-x-8 gap-y-1 text-[12px] text-muted-foreground">
                    <span>
                        {t.added_label}: {vendor.created_at?.slice(0, 10) ?? '—'}
                    </span>
                    <span>
                        {t.updated_label}:{' '}
                        {vendor.updated_at?.slice(0, 10) ?? '—'}
                    </span>
                </div>
            </div>
        </>
    );
}
