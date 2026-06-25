import { Head, Link, router } from '@inertiajs/react';
import { Download, FileText, Plus, Trash2 } from 'lucide-react';

import { CreateDocumentSheet } from '@/components/blue-dome/create-document-sheet';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
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
import documents from '@/routes/documents';

type Person = {
    id: string;
    first_name: string | null;
    last_name: string | null;
} | null;

type Folder = {
    id: string;
    folder_name: string | null;
} | null;

type Row = {
    id: string;
    document_name: string | null;
    document_type: string;
    mime_type: string | null;
    file_size: number | null;
    folder?: Folder;
    uploader?: Person;
    entity_type: string | null;
    entity_id: string | null;
    uploaded_at: string | null;
    is_private: boolean;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type PatientOption = {
    id: string;
    first_name: string | null;
    last_name: string | null;
};

type FolderOption = {
    id: string;
    folder_name: string | null;
};

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

function personName(p?: Person): string {
    return p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';
}

function formatBytes(bytes: number | null): string {
    if (!bytes || bytes <= 0) {
        return '—';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const value = bytes / Math.pow(1024, exponent);

    return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export default function DocumentsIndex({
    documents: paginated,
    patients,
    folders,
    filters,
}: {
    documents: Paginated<Row>;
    patients: PatientOption[];
    folders: FolderOption[];
    filters: { folder_id: string | null };
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const setFolder = (folder_id: string): void => {
        router.get(
            documents.index.url({ locale }),
            { folder_id: folder_id || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const remove = (id: string): void => {
        if (!window.confirm(t.delete_action)) {
            return;
        }

        router.delete(documents.destroy.url({ locale, document: id }), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t.documents} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.documents}
                    description={`${paginated.total}`}
                    actions={
                        <CreateDocumentSheet
                            patients={patients}
                            folders={folders}
                        >
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                {t.new_document}
                            </Button>
                        </CreateDocumentSheet>
                    }
                />

                <SectionCard
                    titleIcon={<FileText className="size-4" />}
                    title={t.documents}
                    actions={
                        <select
                            value={filters.folder_id ?? ''}
                            onChange={(e) => setFolder(e.target.value)}
                            className={selectClass}
                        >
                            <option value="">{t.all_folders}</option>
                            {folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>
                                    {folder.folder_name ?? folder.id}
                                </option>
                            ))}
                        </select>
                    }
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.document}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.document_type}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.folder}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.uploaded_by}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.size}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_date}
                                </TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_documents}
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginated.data.map((d) => (
                                <TableRow
                                    key={d.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <Link
                                            href={documents.show.url({
                                                locale,
                                                document: d.id,
                                            })}
                                            className="text-[13px] font-medium"
                                        >
                                            {d.document_name ||
                                                enumLabel(
                                                    t.document_type_opts,
                                                    d.document_type,
                                                )}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {enumLabel(
                                            t.document_type_opts,
                                            d.document_type,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {d.folder?.folder_name ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {personName(d.uploader)}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {formatBytes(d.file_size)}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {d.uploaded_at
                                            ?.slice(0, 16)
                                            .replace('T', ' ') ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <a
                                                href={documents.download.url({
                                                    locale,
                                                    document: d.id,
                                                })}
                                                title={t.download}
                                                className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                                            >
                                                <Download className="size-3.5" />
                                            </a>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-danger"
                                                title={t.delete_action}
                                                onClick={() => remove(d.id)}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={paginated} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
