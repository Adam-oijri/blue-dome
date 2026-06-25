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
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
import superAdmin from '@/routes/super-admin';

type Patient = {
    id: string;
    patient_code: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    gender: string | null;
    is_active: boolean;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function SuperAdminClinicPatients({
    clinic,
    patients,
}: {
    clinic: { id: string; name: string };
    patients: Paginated<Patient>;
}) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={t.cl_patients_head.replace('{clinic}', clinic.name)} />

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
                    <span className="text-[13px] font-semibold">
                        {t.cl_patients_crumb}
                    </span>
                </div>

                <PageHeader
                    title={t.cl_patients_title}
                    description={t.cl_patients_desc
                        .replace('{total}', String(patients.total))
                        .replace('{clinic}', clinic.name)}
                    actions={
                        <Button
                            asChild
                            size="sm"
                            className="gap-2 bg-navy-900 text-white hover:bg-navy-800"
                        >
                            <Link
                                href={superAdmin.clinics.patients.create.url({
                                    locale,
                                    clinic: clinic.id,
                                })}
                            >
                                <Plus className="size-3.5" />
                                {t.cl_patients_new}
                            </Link>
                        </Button>
                    }
                />

                <SectionCard bodyClassName="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.cl_patient_th_name}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.cl_patient_th_code}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.cl_patient_th_phone}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_status}
                                </TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.cl_patients_empty}
                                    </TableCell>
                                </TableRow>
                            )}
                            {patients.data.map((p) => (
                                <TableRow
                                    key={p.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3 text-[13px] font-semibold">
                                        {`${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() ||
                                            '—'}
                                    </TableCell>
                                    <TableCell className="font-mono text-[12px]">
                                        {p.patient_code ?? '—'}
                                    </TableCell>
                                    <TableCell className="font-mono text-[12px]">
                                        {p.phone ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                p.is_active
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                            withDot
                                        >
                                            {p.is_active
                                                ? t.status_active
                                                : t.status_inactive}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="size-7 p-0"
                                                title={t.action_edit}
                                            >
                                                <Link
                                                    href={superAdmin.clinics.patients.edit.url(
                                                        {
                                                            locale,
                                                            clinic: clinic.id,
                                                            patient: p.id,
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
                                                title={t.action_remove}
                                            >
                                                <Link
                                                    href={superAdmin.clinics.patients.destroy.url(
                                                        {
                                                            locale,
                                                            clinic: clinic.id,
                                                            patient: p.id,
                                                        },
                                                    )}
                                                    method="delete"
                                                    as="button"
                                                    onBefore={() =>
                                                        confirm(
                                                            t.cl_patient_confirm_delete,
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

                    <Pagination paginated={patients} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
