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
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { ClinicFormFields } from '@/pages/panels/super-admin/clinics/clinic-form-fields';

/**
 * Inline "new clinic" Sheet (super-admin). Reuses the same declarative
 * <Form> + shared ClinicFormFields used by the create page; the Sheet's
 * content unmounts on close, so the form resets naturally on reopen.
 */
export function CreateClinicsSheet({ children }: { children: ReactNode }) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>{t.clinics_create_title}</SheetTitle>
                    <SheetDescription>
                        {t.clinics_create_desc}
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
                            submitLabel={t.clinics_create_submit}
                        />
                    )}
                </Form>
            </SheetContent>
        </Sheet>
    );
}
