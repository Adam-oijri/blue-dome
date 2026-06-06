import { router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { CreateAppointmentSheet } from '@/components/blue-dome/create-appointment-sheet';
import { NotificationBell } from '@/components/blue-dome/notification-bell';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { patients as patientsRoute } from '@/routes/secretary';

export function SecretaryTopbar() {
    const { t } = useSecretaryLang();
    const { slug: locale } = useLocale();
    const [searchQuery, setSearchQuery] = useState('');

    // Global search resolves to the patient directory filtered by the query —
    // the front desk's most common lookup.
    const submitSearch = (event: FormEvent): void => {
        event.preventDefault();
        const q = searchQuery.trim();

        if (q === '') {
            return;
        }

        router.get(patientsRoute.url({ locale }), { q });
    };

    return (
        <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-card px-6">
            <SidebarTrigger className="-ms-1 md:hidden" />

            <form onSubmit={submitSearch} className="relative max-w-[320px] flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.search_placeholder}
                    className={cn(
                        'h-9 w-full rounded-md border border-transparent bg-muted ps-9 pe-3 text-sm transition-[border-color,box-shadow] outline-none',
                        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    )}
                />
            </form>

            <div className="ms-auto flex items-center gap-2">
                <NotificationBell />

                <CreateAppointmentSheet>
                    <Button className="bg-olive-600 text-white hover:bg-olive-700">
                        <Plus className="size-4" />
                        {t.new_appointment}
                    </Button>
                </CreateAppointmentSheet>
            </div>
        </header>
    );
}
