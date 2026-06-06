import { useForm } from '@inertiajs/react';
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
import appointments from '@/routes/appointments';

export type AppointmentEditable = {
    id: string;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
    priority: string | null;
    notes: string | null;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const STATUS_OPTIONS: ReadonlyArray<string> = [
    'scheduled',
    'confirmed',
    'arrived',
    'in_progress',
    'completed',
    'no_show',
];

const PRIORITY_OPTIONS: ReadonlyArray<string> = [
    'low',
    'normal',
    'high',
    'emergency',
];

/**
 * Inline "edit appointment" Sheet. Prefilled from the row; posts via PATCH and
 * stays on the page. Mirrors the edit page's fields (start/end/status/priority/
 * notes) and reuses its i18n keys.
 */
export function EditAppointmentsSheet({
    children,
    appointment,
}: {
    children: ReactNode;
    appointment: AppointmentEditable;
}) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();
    const [open, setOpen] = useState(false);

    const form = useForm({
        scheduled_start: appointment.scheduled_start
            ? String(appointment.scheduled_start).slice(0, 16)
            : '',
        scheduled_end: appointment.scheduled_end
            ? String(appointment.scheduled_end).slice(0, 16)
            : '',
        status: appointment.status ?? 'scheduled',
        priority: appointment.priority ?? 'normal',
        notes: appointment.notes ?? '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.patch(
            appointments.update.url({ locale, appointment: appointment.id }),
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            },
        );
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
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.edit}</SheetTitle>
                    <SheetDescription>{t.appointments}</SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="space-y-4 px-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_scheduled_start">
                                {t.appt_start}
                            </Label>
                            <input
                                id="edit_scheduled_start"
                                type="datetime-local"
                                value={form.data.scheduled_start}
                                onChange={(e) =>
                                    form.setData(
                                        'scheduled_start',
                                        e.target.value,
                                    )
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.scheduled_start} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_scheduled_end">
                                {t.appt_end}
                            </Label>
                            <input
                                id="edit_scheduled_end"
                                type="datetime-local"
                                value={form.data.scheduled_end}
                                onChange={(e) =>
                                    form.setData(
                                        'scheduled_end',
                                        e.target.value,
                                    )
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.scheduled_end} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_status">
                                {t.status_label}
                            </Label>
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
                                        {enumLabel(t.appt_status_opts, value)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.status} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_priority">
                                {t.priority_label}
                            </Label>
                            <select
                                id="edit_priority"
                                value={form.data.priority}
                                onChange={(e) =>
                                    form.setData('priority', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                {PRIORITY_OPTIONS.map((value) => (
                                    <option key={value} value={value}>
                                        {enumLabel(t.appt_priority_opts, value)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.priority} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit_notes">{t.notes_label}</Label>
                        <textarea
                            id="edit_notes"
                            rows={3}
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData('notes', e.target.value)
                            }
                            className={TEXTAREA_CLASS}
                        />
                        <InputError message={form.errors.notes} />
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
