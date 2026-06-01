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
            <Head title={`${isEdit ? 'Edit' : 'New'} item — ${clinic.name}`} />

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
                            Inventory
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">
                        {isEdit ? 'Edit' : 'New item'}
                    </span>
                </div>

                <PageHeader
                    title={isEdit ? 'Edit item' : 'New item'}
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
                                            Item name
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
                                            Category
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
                                            Item code
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
                                        <Label htmlFor="unit">Unit</Label>
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
                                                Opening stock
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
                                            Min stock level
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
                                            Status
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
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
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
                                    {isEdit ? 'Save changes' : 'Create item'}
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
