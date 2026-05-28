import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { SuperAdminSidebar } from '@/components/blue-dome/super-admin-sidebar';
import { SuperAdminTopbar } from '@/components/blue-dome/super-admin-topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SuperAdminLangProvider } from '@/lib/i18n/super-admin-context';

const SUPER_ADMIN_SIDEBAR_TOKENS: React.CSSProperties = {
    '--sidebar': '#0a1628',
    '--sidebar-foreground': '#cbd5e1',
    '--sidebar-border': '#15294a',
    '--sidebar-accent': '#15294a',
    '--sidebar-accent-foreground': '#ffffff',
    '--sidebar-primary': '#869e47',
    '--sidebar-primary-foreground': '#ffffff',
    '--sidebar-ring': '#869e47',
} as React.CSSProperties;

export default function SuperAdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    const isOpen = usePage<{ sidebarOpen?: boolean }>().props.sidebarOpen;

    return (
        <SuperAdminLangProvider>
            <SidebarProvider
                defaultOpen={isOpen ?? true}
                style={SUPER_ADMIN_SIDEBAR_TOKENS}
            >
                <SuperAdminSidebar />
                <SidebarInset className="bg-background">
                    <SuperAdminTopbar />
                    <div className="flex-1 overflow-x-hidden">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </SuperAdminLangProvider>
    );
}
