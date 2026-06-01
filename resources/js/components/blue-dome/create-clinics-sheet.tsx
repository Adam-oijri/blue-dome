import { Form } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import ClinicController from '@/actions/App/Http/Controllers/SuperAdmin/ClinicController';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useLocale } from '@/lib/i18n/use-locale';
import { ClinicFormFields } from '@/pages/panels/super-admin/clinics/clinic-form-fields';

/**
 * Inline "new clinic" Sheet (super-admin). Reuses the same declarative
 * <Form> + shared ClinicFormFields used by the create page; the Sheet's
 * content unmounts on close, so the form resets naturally on reopen.
 */
export function CreateClinicsSheet({ children }: { children: ReactNode }) {
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>New clinic</SheetTitle>
                    <SheetDescription>
                        Provision a new clinic tenant.
                    </SheetDescription>
                </SheetHeader>

                <Form
                    {...ClinicController.store.form({ locale })}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-8 px-4 pb-4"
                >
                    {({ processing, errors }) => (
                        <ClinicFormFields
                            processing={processing}
                            errors={errors}
                            submitLabel="Create clinic"
                        />
                    )}
                </Form>
            </SheetContent>
        </Sheet>
    );
}
