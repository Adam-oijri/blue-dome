import { useForm } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

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
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import documents from '@/routes/documents';
import labOrders from '@/routes/lab-orders';

export type LabOrderEditable = {
    id: string;
    order_date: string | null;
    urgency: string | null;
    status: string;
    fasting_required: boolean | null;
    clinical_diagnosis: string | null;
    notes: string | null;
    external_lab_id: string | null;
    external_lab?: { lab_name: string | null } | null;
};

export type LabOrderImage = {
    id: string;
    file_name: string | null;
    document_name: string | null;
    mime_type: string | null;
};

export type ExternalLabOption = {
    id: string;
    lab_name: string | null;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const URGENCY_OPTIONS: ReadonlyArray<string> = ['routine', 'urgent', 'stat'];

const STATUS_OPTIONS: ReadonlyArray<string> = [
    'draft',
    'pending',
    'sample_collected',
    'in_progress',
    'completed',
    'partially_completed',
    'cancelled',
    'rejected',
];

/**
 * Inline "edit lab order" Sheet. Prefilled from the order; edits the scalar
 * fields the update endpoint accepts and appends newly selected images. Submits
 * a multipart PATCH via POST method-spoofing (the update route is a PUT) so the
 * file upload survives, stays on the page, and shows the order's existing
 * images as a read-only gallery of download links.
 */
export function EditLabOrdersSheet({
    children,
    lab_order,
    images,
    external_labs,
}: {
    children: ReactNode;
    lab_order: LabOrderEditable;
    images: LabOrderImage[];
    external_labs: ExternalLabOption[];
}) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();
    const [open, setOpen] = useState(false);
    const initialLabType: 'internal' | 'external' = lab_order.external_lab_id
        ? 'external'
        : 'internal';
    const [labType, setLabType] = useState<'internal' | 'external'>(
        initialLabType,
    );

    const form = useForm<{
        order_date: string;
        urgency: string;
        status: string;
        fasting_required: boolean;
        clinical_diagnosis: string;
        notes: string;
        external_lab_name: string;
        images: File[];
    }>({
        order_date: lab_order.order_date
            ? String(lab_order.order_date).slice(0, 10)
            : '',
        urgency: lab_order.urgency ?? 'routine',
        status: lab_order.status ?? 'draft',
        fasting_required: lab_order.fasting_required ?? false,
        clinical_diagnosis: lab_order.clinical_diagnosis ?? '',
        notes: lab_order.notes ?? '',
        external_lab_name: lab_order.external_lab?.lab_name ?? '',
        images: [],
    });

    const err = form.errors as Record<string, string | undefined>;

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post(labOrders.update.url({ locale, lab_order: lab_order.id }), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setOpen(false),
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
                    setLabType(initialLabType);
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.edit_lab_order}</SheetTitle>
                    <SheetDescription>{t.order_date}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex-1 space-y-4 overflow-y-auto px-4 pb-4"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_order_date">
                                {t.order_date}
                            </Label>
                            <input
                                id="edit_order_date"
                                type="date"
                                value={form.data.order_date}
                                onChange={(e) =>
                                    form.setData('order_date', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={err.order_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_urgency">
                                {t.urgency_col}
                            </Label>
                            <select
                                id="edit_urgency"
                                value={form.data.urgency}
                                onChange={(e) =>
                                    form.setData('urgency', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                {URGENCY_OPTIONS.map((value) => (
                                    <option key={value} value={value}>
                                        {enumLabel(t.urgency_opts, value)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={err.urgency} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_status">{t.col_status}</Label>
                            <select
                                id="edit_status"
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData('status', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                {STATUS_OPTIONS.map((value) => (
                                    <option key={value} value={value}>
                                        {enumLabel(t.lab_status_opts, value)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={err.status} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_lab_type">{t.lab_col}</Label>
                            <select
                                id="edit_lab_type"
                                value={labType}
                                onChange={(e) => {
                                    const next = e.target.value as
                                        | 'internal'
                                        | 'external';
                                    setLabType(next);

                                    if (next === 'internal') {
                                        form.setData('external_lab_name', '');
                                    }
                                }}
                                className={FIELD_CLASS}
                            >
                                <option value="internal">{t.in_house}</option>
                                <option value="external">
                                    {t.lab_external}
                                </option>
                            </select>
                        </div>
                    </div>

                    {labType === 'external' && (
                        <div className="grid gap-2">
                            <Label htmlFor="edit_external_lab_name">
                                {t.external_lab_name}
                            </Label>
                            <input
                                id="edit_external_lab_name"
                                list="edit-external-lab-options"
                                value={form.data.external_lab_name}
                                onChange={(e) =>
                                    form.setData(
                                        'external_lab_name',
                                        e.target.value,
                                    )
                                }
                                className={FIELD_CLASS}
                            />
                            <datalist id="edit-external-lab-options">
                                {external_labs.map((lab) =>
                                    lab.lab_name ? (
                                        <option
                                            key={lab.id}
                                            value={lab.lab_name}
                                        />
                                    ) : null,
                                )}
                            </datalist>
                            <InputError message={err.external_lab_name} />
                        </div>
                    )}

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.fasting_required}
                            onChange={(e) =>
                                form.setData(
                                    'fasting_required',
                                    e.target.checked,
                                )
                            }
                            className="size-4 rounded border-input"
                        />
                        {t.fasting_required}
                    </label>
                    <InputError message={err.fasting_required} />

                    <div className="grid gap-2">
                        <Label htmlFor="edit_clinical_diagnosis">
                            {t.clinical_diagnosis}
                        </Label>
                        <textarea
                            id="edit_clinical_diagnosis"
                            rows={2}
                            value={form.data.clinical_diagnosis}
                            onChange={(e) =>
                                form.setData(
                                    'clinical_diagnosis',
                                    e.target.value,
                                )
                            }
                            className={TEXTAREA_CLASS}
                        />
                        <InputError message={err.clinical_diagnosis} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit_notes">{t.notes_label}</Label>
                        <textarea
                            id="edit_notes"
                            rows={2}
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData('notes', e.target.value)
                            }
                            className={TEXTAREA_CLASS}
                        />
                        <InputError message={err.notes} />
                    </div>

                    {images.length > 0 && (
                        <div className="grid gap-2">
                            <Label>
                                {t.attached_images} ({images.length})
                            </Label>
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {images.map((image) => {
                                    const href = documents.download.url({
                                        locale,
                                        document: image.id,
                                    });
                                    const isImage = (
                                        image.mime_type ?? ''
                                    ).startsWith('image/');
                                    const name =
                                        image.file_name ??
                                        image.document_name ??
                                        t.images_label;

                                    return (
                                        <a
                                            key={image.id}
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group block overflow-hidden rounded-lg border border-border"
                                            title={name}
                                        >
                                            {isImage ? (
                                                <img
                                                    src={href}
                                                    alt={name}
                                                    className="aspect-square w-full object-cover transition group-hover:opacity-90"
                                                />
                                            ) : (
                                                <div className="flex aspect-square w-full items-center justify-center bg-muted">
                                                    <FileText className="size-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <span className="block truncate px-2 py-1 text-[11px] text-muted-foreground">
                                                {name}
                                            </span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="edit_images">{t.add_images}</Label>
                        <input
                            id="edit_images"
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            onChange={(e) =>
                                form.setData(
                                    'images',
                                    Array.from(e.target.files ?? []),
                                )
                            }
                            className="text-sm file:me-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm"
                        />
                        {form.data.images.length > 0 && (
                            <p className="text-[12px] text-muted-foreground">
                                {form.data.images.length} file(s) selected
                            </p>
                        )}
                        <InputError message={err['images.0'] ?? err.images} />
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="w-full bg-olive-600 text-white hover:bg-olive-700"
                    >
                        {t.save_changes}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
