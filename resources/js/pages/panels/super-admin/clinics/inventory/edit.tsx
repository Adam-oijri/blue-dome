import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import InventoryController from '@/actions/App/Http/Controllers/SuperAdmin/InventoryController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

interface Item {
    id: string;
    item_name: string;
    category: string;
    item_code: string | null;
    unit: string | null;
    min_stock_level: number | string | null;
    is_active: boolean;
}

const CATEGORIES = ['medication', 'supplies', 'equipment', 'office_supplies'];

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function SuperAdminClinicInventoryEdit({
    clinic,
    inventory,
}: {
    clinic: { id: string; name: string };
    inventory: Item | null;
}) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();
    const isEdit = inventory !== null;

    const formProps = isEdit
        ? InventoryController.update.form({
              locale,
              clinic: clinic.id,
              inventory: inventory.id,
          })
        : InventoryController.store.form({ locale, clinic: clinic.id });

    return (
        <>
            <Head
                title={(isEdit
                    ? t.cl_inv_head_edit
                    : t.cl_inv_head_new
                ).replace('{clinic}', clinic.name)}
            />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link
                            href={superAdmin.clinics.inventory.index.url({
                                locale,
                                clinic: clinic.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            {t.cl_inv_crumb}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">
                        {isEdit ? t.cl_invoice_crumb_edit : t.cl_inv_crumb_new}
                    </span>
                </div>

                <PageHeader
                    title={isEdit ? t.cl_inv_title_edit : t.cl_inv_title_new}
                    description={clinic.name}
                />

                <SectionCard className="mt-6">
                    <Form
                        {...formProps}
                        options={{ preserveScroll: true }}
                        className="space-y-6 p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="item_name">
                                            {t.cl_inv_item_name}
                                        </Label>
                                        <Input
                                            id="item_name"
                                            name="item_name"
                                            defaultValue={
                                                inventory?.item_name ?? ''
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.item_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">
                                            {t.cl_inv_category}
                                        </Label>
                                        <select
                                            id="category"
                                            name="category"
                                            defaultValue={
                                                inventory?.category ??
                                                'supplies'
                                            }
                                            className={selectClass}
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.category} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="item_code">
                                            {t.cl_inv_item_code}
                                        </Label>
                                        <Input
                                            id="item_code"
                                            name="item_code"
                                            defaultValue={
                                                inventory?.item_code ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.item_code}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="unit">
                                            {t.cl_inv_unit}
                                        </Label>
                                        <Input
                                            id="unit"
                                            name="unit"
                                            defaultValue={inventory?.unit ?? ''}
                                        />
                                        <InputError message={errors.unit} />
                                    </div>
                                    {!isEdit && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="quantity_in_stock">
                                                {t.cl_inv_opening_stock}
                                            </Label>
                                            <Input
                                                id="quantity_in_stock"
                                                name="quantity_in_stock"
                                                type="number"
                                                defaultValue="0"
                                            />
                                            <InputError
                                                message={
                                                    errors.quantity_in_stock
                                                }
                                            />
                                        </div>
                                    )}
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_stock_level">
                                            {t.cl_inv_min_stock}
                                        </Label>
                                        <Input
                                            id="min_stock_level"
                                            name="min_stock_level"
                                            type="number"
                                            defaultValue={
                                                inventory?.min_stock_level ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.min_stock_level}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="is_active">
                                            {t.cl_inv_status}
                                        </Label>
                                        <select
                                            id="is_active"
                                            name="is_active"
                                            defaultValue={
                                                inventory
                                                    ? inventory.is_active
                                                        ? '1'
                                                        : '0'
                                                    : '1'
                                            }
                                            className={selectClass}
                                        >
                                            <option value="1">
                                                {t.status_active}
                                            </option>
                                            <option value="0">
                                                {t.status_inactive}
                                            </option>
                                        </select>
                                        <InputError
                                            message={errors.is_active}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-navy-900 text-white hover:bg-navy-800"
                                >
                                    {processing && <Spinner />}
                                    {isEdit
                                        ? t.cl_inv_submit_save
                                        : t.cl_inv_submit_create}
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
