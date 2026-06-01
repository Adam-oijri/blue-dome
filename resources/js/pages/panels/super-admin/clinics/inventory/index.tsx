import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react';

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
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
import superAdmin from '@/routes/super-admin';

type Item = {
    id: string;
    item_code: string | null;
    item_name: string;
    category: string;
    quantity_in_stock: number | string;
    min_stock_level: number | string | null;
    unit: string | null;
    is_active: boolean;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function SuperAdminClinicInventory({
    clinic,
    inventory,
}: {
    clinic: { id: string; name: string };
    inventory: Paginated<Item>;
}) {
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={`Inventory — ${clinic.name}`} />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link
                            href={superAdmin.clinics.show.url({
                                locale,
                                clinic: clinic.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            {clinic.name}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">Inventory</span>
                </div>

                <PageHeader
                    title="Inventory"
                    description={`${inventory.total} items at ${clinic.name}`}
                    actions={
                        <Button
                            asChild
                            size="sm"
                            className="gap-2 bg-navy-900 text-white hover:bg-navy-800"
                        >
                            <Link
                                href={superAdmin.clinics.inventory.create.url({
                                    locale,
                                    clinic: clinic.id,
                                })}
                            >
                                <Plus className="size-3.5" />
                                New item
                            </Link>
                        </Button>
                    }
                />

                <SectionCard bodyClassName="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    Item
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Category
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    In stock
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Status
                                </TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        No inventory items.
                                    </TableCell>
                                </TableRow>
                            )}
                            {inventory.data.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <div className="text-[13px] font-semibold">
                                            {item.item_name}
                                        </div>
                                        {item.item_code && (
                                            <div className="text-[11px] text-muted-foreground">
                                                {item.item_code}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {item.category}
                                    </TableCell>
                                    <TableCell className="text-end text-[13px] tabular-nums">
                                        {item.quantity_in_stock}{' '}
                                        {item.unit ?? ''}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                item.is_active
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                            withDot
                                        >
                                            {item.is_active
                                                ? 'active'
                                                : 'inactive'}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="size-7 p-0"
                                                title="Edit"
                                            >
                                                <Link
                                                    href={superAdmin.clinics.inventory.edit.url(
                                                        {
                                                            locale,
                                                            clinic: clinic.id,
                                                            inventory: item.id,
                                                        },
                                                    )}
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="size-7 p-0 text-danger"
                                                title="Delete"
                                            >
                                                <Link
                                                    href={superAdmin.clinics.inventory.destroy.url(
                                                        {
                                                            locale,
                                                            clinic: clinic.id,
                                                            inventory: item.id,
                                                        },
                                                    )}
                                                    method="delete"
                                                    as="button"
                                                    onBefore={() =>
                                                        confirm(
                                                            'Delete this item?',
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={inventory} t={{}} />
                </SectionCard>
            </div>
        </>
    );
}
