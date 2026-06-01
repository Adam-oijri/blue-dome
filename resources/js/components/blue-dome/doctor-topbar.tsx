import { router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { CreateAppointmentSheet } from '@/components/blue-dome/create-appointment-sheet';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import patients from '@/routes/patients';

export function DoctorTopbar() {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [query, setQuery] = useState('');

    const runSearch = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter' && query.trim() !== '') {
            router.get(patients.index.url({ locale }), { q: query.trim() });
        }
    };

    return (
        <header className="flex h-[60px] shrink-0 items-center gap-4 border-b border-border bg-card px-6">
            <SidebarTrigger className="-ms-1 md:hidden" />

            <div className="relative max-w-[480px] flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={runSearch}
                    placeholder={t.search_placeholder}
                    className={cn(
                        'h-9 w-full rounded-md border border-transparent bg-muted ps-9 pe-3 text-sm transition-[border-color,box-shadow] outline-none',
                        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    )}
                />
            </div>

            <div className="ms-auto flex items-center gap-2">
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
