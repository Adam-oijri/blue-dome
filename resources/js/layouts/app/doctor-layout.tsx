import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { DoctorSidebar } from '@/components/blue-dome/doctor-sidebar';
import { DoctorTopbar } from '@/components/blue-dome/doctor-topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DoctorLangProvider } from '@/lib/i18n/doctor-context';

const DOCTOR_SIDEBAR_TOKENS: React.CSSProperties = {
    // Override shadcn sidebar tokens — scoped to this layout only.
    '--sidebar': '#0a1628',
    '--sidebar-foreground': '#cbd5e1',
    '--sidebar-border': '#15294a',
    '--sidebar-accent': '#15294a',
    '--sidebar-accent-foreground': '#ffffff',
    '--sidebar-primary': '#869e47',
    '--sidebar-primary-foreground': '#ffffff',
    '--sidebar-ring': '#869e47',
} as React.CSSProperties;

export default function DoctorLayout({ children }: { children: ReactNode }) {
    const isOpen = usePage<{ sidebarOpen?: boolean }>().props.sidebarOpen;

    return (
        <DoctorLangProvider>
            <SidebarProvider
                defaultOpen={isOpen ?? true}
                style={DOCTOR_SIDEBAR_TOKENS}
            >
                <DoctorSidebar />
                <SidebarInset className="bg-background">
                    <DoctorTopbar />
                    <div className="flex-1 overflow-x-hidden">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </DoctorLangProvider>
    );
}
