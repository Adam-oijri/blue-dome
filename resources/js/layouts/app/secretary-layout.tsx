import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { SecretarySidebar } from '@/components/blue-dome/secretary-sidebar';
import { SecretaryTopbar } from '@/components/blue-dome/secretary-topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SecretaryLangProvider } from '@/lib/i18n/secretary-context';

const SECRETARY_SIDEBAR_TOKENS: React.CSSProperties = {
    '--sidebar': '#0a1628',
    '--sidebar-foreground': '#cbd5e1',
    '--sidebar-border': '#15294a',
    '--sidebar-accent': '#15294a',
    '--sidebar-accent-foreground': '#ffffff',
    '--sidebar-primary': '#869e47',
    '--sidebar-primary-foreground': '#ffffff',
    '--sidebar-ring': '#869e47',
} as React.CSSProperties;

export default function SecretaryLayout({ children }: { children: ReactNode }) {
    const isOpen = usePage<{ sidebarOpen?: boolean }>().props.sidebarOpen;

    return (
        <SecretaryLangProvider>
            <SidebarProvider
                defaultOpen={isOpen ?? true}
                style={SECRETARY_SIDEBAR_TOKENS}
            >
                <SecretarySidebar />
                <SidebarInset className="bg-background">
                    <SecretaryTopbar />
                    <div className="flex-1 overflow-x-hidden">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </SecretaryLangProvider>
    );
}
