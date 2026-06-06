import { Head, Link } from '@inertiajs/react';
import { Building2, ChevronRight, Plus } from 'lucide-react';

import { CreateVendorsSheet } from '@/components/blue-dome/create-vendors-sheet';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
import vendors from '@/routes/vendors';

type Row = {
    id: string;
    vendor_name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    category: string | null;
    is_active: boolean;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function VendorsIndex({
    vendors: paginated,
}: {
    vendors: Paginated<Row>;
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={t.vendors} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.vendors}
                    description={`${paginated.total} ${t.vendors}`}
                    actions={
                        <CreateVendorsSheet>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                {t.new_vendor}
                            </Button>
                        </CreateVendorsSheet>
                    }
                />

                <SectionCard
                    titleIcon={<Building2 className="size-4" />}
                    title={t.vendors}
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.vendor_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.contact_col}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.phone}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.email}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_category}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_status}
                                </TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_vendors}
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginated.data.map((vendor) => (
                                <TableRow
                                    key={vendor.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <Link
                                            href={vendors.show.url({
                                                locale,
                                                vendor: vendor.id,
                                            })}
                                            className="text-[13px] font-medium"
                                        >
                                            {vendor.vendor_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {vendor.contact_person || '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {vendor.phone || '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {vendor.email || '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground capitalize">
                                        {enumLabel(
                                            t.vendor_category_opts,
                                            vendor.category,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                vendor.is_active
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                            withDot
                                        >
                                            {vendor.is_active
                                                ? t.active_label
                                                : t.inactive_label}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={vendors.show.url({
                                                locale,
                                                vendor: vendor.id,
                                            })}
                                        >
                                            <ChevronRight className="size-3.5 text-muted-foreground" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={paginated} t={{}} />
                </SectionCard>
            </div>
        </>
    );
}
