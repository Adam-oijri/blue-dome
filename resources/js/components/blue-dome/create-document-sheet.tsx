import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import documents from '@/routes/documents';

type PatientOption = {
    id: string;
    first_name: string | null;
    last_name: string | null;
};

type FolderOption = {
    id: string;
    folder_name: string | null;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

function patientLabel(patient: PatientOption): string {
    return (
        `${patient.first_name ?? ''} ${patient.last_name ?? ''}`.trim() ||
        patient.id
    );
}

/**
 * Inline "upload document" Sheet. Drop it anywhere and pass the trigger as
 * `children`; the host page supplies the `patients` and `folders` option
 * lists. A single File is attached to `file`, so Inertia automatically sends
 * the request as multipart/form-data.
 */
export function CreateDocumentSheet({
    children,
    patients,
    folders,
}: {
    children: ReactNode;
    patients: PatientOption[];
    folders: FolderOption[];
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm<{
        file: File | null;
        document_name: string;
        document_type: string;
        entity_type: string;
        entity_id: string;
        folder_id: string;
        description: string;
        is_private: string;
    }>({
        file: null,
        document_name: '',
        document_type: 'patient_record',
        entity_type: 'Patient',
        entity_id: '',
        folder_id: '',
        description: '',
        is_private: '0',
    });

    const err = form.errors as Record<string, string | undefined>;

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(documents.store.url({ locale }), {
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
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>{t.new_document}</SheetTitle>
                    <SheetDescription>{t.upload}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex-1 space-y-4 overflow-y-auto px-4 pb-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="file">{t.file}</Label>
                        <input
                            id="file"
                            type="file"
                            onChange={(e) =>
                                form.setData(
                                    'file',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                            className="text-sm file:me-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm"
                        />
                        <InputError message={err.file} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="document_name">{t.document}</Label>
                        <Input
                            id="document_name"
                            value={form.data.document_name}
                            onChange={(e) =>
                                form.setData('document_name', e.target.value)
                            }
                        />
                        <InputError message={err.document_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="document_type">
                            {t.document_type}
                        </Label>
                        <select
                            id="document_type"
                            value={form.data.document_type}
                            onChange={(e) =>
                                form.setData('document_type', e.target.value)
                            }
                            className={FIELD_CLASS}
                        >
                            {Object.keys(t.document_type_opts).map((key) => (
                                <option key={key} value={key}>
                                    {enumLabel(t.document_type_opts, key)}
                                </option>
                            ))}
                        </select>
                        <InputError message={err.document_type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="entity_id">{t.col_patient}</Label>
                        <select
                            id="entity_id"
                            value={form.data.entity_id}
                            onChange={(e) =>
                                form.setData('entity_id', e.target.value)
                            }
                            className={FIELD_CLASS}
                        >
                            <option value="">—</option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patientLabel(patient)}
                                </option>
                            ))}
                        </select>
                        <InputError message={err.entity_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="folder_id">{t.folder}</Label>
                        <select
                            id="folder_id"
                            value={form.data.folder_id}
                            onChange={(e) =>
                                form.setData('folder_id', e.target.value)
                            }
                            className={FIELD_CLASS}
                        >
                            <option value="">{t.all_folders}</option>
                            {folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>
                                    {folder.folder_name ?? folder.id}
                                </option>
                            ))}
                        </select>
                        <InputError message={err.folder_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="is_private">{t.private_label}</Label>
                        <select
                            id="is_private"
                            value={form.data.is_private}
                            onChange={(e) =>
                                form.setData('is_private', e.target.value)
                            }
                            className={FIELD_CLASS}
                        >
                            <option value="0">{t.no_label}</option>
                            <option value="1">{t.yes}</option>
                        </select>
                        <InputError message={err.is_private} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            {t.col_description}
                        </Label>
                        <textarea
                            id="description"
                            rows={2}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            className={TEXTAREA_CLASS}
                        />
                        <InputError message={err.description} />
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="w-full bg-olive-600 text-white hover:bg-olive-700"
                    >
                        {t.upload}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
