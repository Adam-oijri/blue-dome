import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Pill, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { CreateMedicationsSheet } from '@/components/blue-dome/create-medications-sheet';
import { EditMedicationsSheet } from '@/components/blue-dome/edit-medications-sheet';
import type { EditableMedication } from '@/components/blue-dome/edit-medications-sheet';
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
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
import medications from '@/routes/medications';

type MedicationRow = EditableMedication;

/** Roles allowed to create/edit/delete medications (doctors are read-only). */
const EDIT_ROLES = ['super_admin', 'secretary'];

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function MedicationsIndex({
    medications: medicationList,
    filters,
}: {
    medications: Paginated<MedicationRow>;
    filters: { q: string | null };
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const role = usePage().props.auth.user.role;
    const canEdit = EDIT_ROLES.includes(role);
    const [q, setQ] = useState(filters.q ?? '');

    const search = (e: React.FormEvent): void => {
        e.preventDefault();
        router.get(
            medications.index.url({ locale }),
            { q: q || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const destroy = (med: MedicationRow): void => {
        if (
            !window.confirm(
                `Delete "${med.trade_name ?? 'this medication'}"? It can be restored from the recycle bin.`,
            )
        ) {
            return;
        }

        router.delete(
            medications.destroy.url({ locale, medication: med.id }),
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={t.medications} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.medications}
                    description={`${medicationList.total} in formulary`}
                    actions={
                        canEdit ? (
                            <CreateMedicationsSheet>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                                >
                                    <Plus className="size-3.5" />
                                    {t.new_medication}
                                </Button>
                            </CreateMedicationsSheet>
                        ) : undefined
                    }
                />

                <SectionCard
                    title={t.formulary}
                    titleIcon={<Pill className="size-4" />}
                    actions={
                        <form onSubmit={search} className="relative max-w-[240px]">
                            <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder={t.search_medications_ph}
                                className="h-8 w-full rounded-md border border-transparent bg-muted ps-8 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </form>
                    }
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.medication}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {`${t.form_label} · ${t.strength}`}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_category}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.dispensing}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_status}
                                </TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {medicationList.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_medications}
                                    </TableCell>
                                </TableRow>
                            )}
                            {medicationList.data.map((med) => (
                                <TableRow
                                    key={med.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <div className="text-[13px] font-medium">
                                            {med.trade_name ?? '—'}
                                        </div>
                                        {med.generic_name && (
                                            <div className="text-[11px] text-muted-foreground">
                                                {med.generic_name}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {[med.form, med.strength]
                                            .filter(Boolean)
                                            .join(' · ') || '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {med.category ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                med.requires_prescription
                                                    ? 'info'
                                                    : 'neutral'
                                            }
                                        >
                                            {med.requires_prescription
                                                ? t.rx_badge
                                                : t.otc}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                med.is_active
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                            withDot
                                        >
                                            {med.is_active
                                                ? t.active_label
                                                : t.inactive_label}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        {canEdit && (
                                            <div className="flex items-center gap-1">
                                                <EditMedicationsSheet
                                                    medication={med}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7"
                                                        aria-label={
                                                            t.edit_medication
                                                        }
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                </EditMedicationsSheet>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-danger hover:text-danger"
                                                    aria-label={t.delete_action}
                                                    onClick={() => destroy(med)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={medicationList} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
