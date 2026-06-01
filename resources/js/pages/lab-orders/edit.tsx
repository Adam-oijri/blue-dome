import { Form, Head } from '@inertiajs/react';

import LabOrderController from '@/actions/App/Http/Controllers/LabOrderController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/lib/i18n/use-locale';
import documents from '@/routes/documents';

type LabImage = {
    id: string;
    document_name: string | null;
    file_name: string | null;
    mime_type: string | null;
    file_size: number | null;
    uploaded_at: string | null;
};

type LabOrderData = {
    id: string;
    lab_order_number: string | null;
    order_date: string | null;
    status: string;
    urgency: string | null;
    fasting_required: boolean;
    clinical_diagnosis: string | null;
    notes: string | null;
};

interface Props {
    lab_order: LabOrderData;
    images: LabImage[];
}

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

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

const URGENCY_OPTIONS: ReadonlyArray<string> = ['routine', 'urgent', 'stat'];

export default function LabOrderEdit({ lab_order, images }: Props) {
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title="Edit lab order" />

            <div className="mx-auto w-full max-w-2xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">
                    Edit lab order
                    {lab_order.lab_order_number
                        ? ` · ${lab_order.lab_order_number}`
                        : ''}
                </h1>

                {images.length > 0 && (
                    <section className="mb-6">
                        <h2 className="mb-2 text-sm font-semibold">
                            Attached images ({images.length})
                        </h2>
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {images.map((image) => {
                                const href = documents.download.url({
                                    locale,
                                    document: image.id,
                                });

                                return (
                                    <a
                                        key={image.id}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group block overflow-hidden rounded-lg border border-border"
                                        title={image.file_name ?? undefined}
                                    >
                                        <img
                                            src={href}
                                            alt={
                                                image.document_name ??
                                                'Lab image'
                                            }
                                            className="aspect-square w-full object-cover transition group-hover:opacity-90"
                                        />
                                    </a>
                                );
                            })}
                        </div>
                    </section>
                )}

                <Form
                    {...LabOrderController.update.form({
                        locale,
                        lab_order: lab_order.id,
                    })}
                    options={{ preserveScroll: true }}
                    className="space-y-4"
                >
                    {({
                        processing,
                        errors,
                    }: {
                        processing: boolean;
                        errors: Record<string, string>;
                    }) => (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="order_date">
                                        Order date
                                    </Label>
                                    <input
                                        id="order_date"
                                        name="order_date"
                                        type="date"
                                        defaultValue={
                                            lab_order.order_date?.slice(0, 10) ??
                                            ''
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <InputError message={errors.order_date} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="urgency">Urgency</Label>
                                    <select
                                        id="urgency"
                                        name="urgency"
                                        defaultValue={
                                            lab_order.urgency ?? 'routine'
                                        }
                                        className={FIELD_CLASS}
                                    >
                                        {URGENCY_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.urgency} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        name="status"
                                        defaultValue={lab_order.status}
                                        className={FIELD_CLASS}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fasting_required">
                                        Fasting required
                                    </Label>
                                    <select
                                        id="fasting_required"
                                        name="fasting_required"
                                        defaultValue={
                                            lab_order.fasting_required
                                                ? '1'
                                                : '0'
                                        }
                                        className={FIELD_CLASS}
                                    >
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                    <InputError
                                        message={errors.fasting_required}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="clinical_diagnosis">
                                    Clinical diagnosis
                                </Label>
                                <textarea
                                    id="clinical_diagnosis"
                                    name="clinical_diagnosis"
                                    rows={2}
                                    defaultValue={
                                        lab_order.clinical_diagnosis ?? ''
                                    }
                                    className={TEXTAREA_CLASS}
                                />
                                <InputError
                                    message={errors.clinical_diagnosis}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={2}
                                    defaultValue={lab_order.notes ?? ''}
                                    className={TEXTAREA_CLASS}
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="images">Add images</Label>
                                <input
                                    id="images"
                                    name="images[]"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="text-sm file:me-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm"
                                />
                                <InputError
                                    message={errors['images.0'] ?? errors.images}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-olive-600 text-white hover:bg-olive-700"
                            >
                                Save changes
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
