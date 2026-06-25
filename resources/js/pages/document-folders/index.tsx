import { Head, router, useForm } from '@inertiajs/react';
import { FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
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
import documentFolders from '@/routes/document-folders';

type Row = {
    id: string;
    folder_name: string;
    parent_folder_id: string | null;
    is_system: boolean;
    documents_count: number;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

function CreateFolderSheet({ folders }: { folders: Row[] }) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm({
        folder_name: '',
        parent_folder_id: '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(documentFolders.store.url({ locale }), {
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
            <SheetTrigger asChild>
                <Button
                    size="sm"
                    className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                >
                    <Plus className="size-3.5" />
                    {t.new_folder}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.new_folder}</SheetTitle>
                    <SheetDescription>{t.folders}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="folder_name">{t.folder}</Label>
                            <input
                                id="folder_name"
                                value={form.data.folder_name}
                                onChange={(e) =>
                                    form.setData('folder_name', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.folder_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="parent_folder_id">
                                {t.folder}
                            </Label>
                            <select
                                id="parent_folder_id"
                                value={form.data.parent_folder_id}
                                onChange={(e) =>
                                    form.setData(
                                        'parent_folder_id',
                                        e.target.value,
                                    )
                                }
                                className={FIELD_CLASS}
                            >
                                <option value="">{t.none_label}</option>
                                {folders
                                    .filter((folder) => !folder.parent_folder_id)
                                    .map((folder) => (
                                        <option key={folder.id} value={folder.id}>
                                            {folder.folder_name}
                                        </option>
                                    ))}
                            </select>
                            <InputError
                                message={form.errors.parent_folder_id}
                            />
                        </div>
                    </div>

                    <div className="border-t px-4 py-4">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                        >
                            {t.create_label}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}

export default function DocumentFoldersIndex({
    folders,
}: {
    folders: Paginated<Row>;
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const destroyFolder = (folder: Row): void => {
        if (!confirm(`${t.cancel_label}?`)) {
            return;
        }

        router.delete(
            documentFolders.destroy.url({
                locale,
                document_folder: folder.id,
            }),
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={t.folders} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.folders}
                    description={`${folders.total}`}
                    actions={<CreateFolderSheet folders={folders.data} />}
                />

                <SectionCard
                    titleIcon={<FolderOpen className="size-4" />}
                    title={t.folders}
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.folder}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.documents}
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    {t.system_label}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {folders.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_folders}
                                    </TableCell>
                                </TableRow>
                            )}
                            {folders.data.map((folder) => (
                                <TableRow
                                    key={folder.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <span className="flex items-center gap-2 text-[13px] font-medium">
                                            <FolderOpen className="size-3.5 text-muted-foreground" />
                                            {folder.folder_name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-[13px] tabular-nums text-muted-foreground">
                                        {folder.documents_count}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            {folder.is_system ? (
                                                <StatusPill tone="navy">
                                                    {t.system_label}
                                                </StatusPill>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="size-7 p-0 text-danger hover:text-danger"
                                                    onClick={() =>
                                                        destroyFolder(folder)
                                                    }
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={folders} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
