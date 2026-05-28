import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Building2,
    Calendar,
    FileBarChart,
    LayoutGrid,
    Settings as SettingsIcon,
    Stethoscope,
    Trash2,
    Users,
} from 'lucide-react';
import type { ComponentType } from 'react';

import { BrandIconMark } from '@/components/blue-dome/brand-icon-mark';
import { SidebarUserCard } from '@/components/blue-dome/sidebar-user-card';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import superAdmin from '@/routes/super-admin';

type NavEntry = {
    key: string;
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    exact?: boolean;
};

function isActive(url: string, target: string, exact = false): boolean {
    const path = url.split('?')[0];

    if (exact || target === '/' || target === '') {
        return path === target;
    }

    return path === target || path.startsWith(target + '/');
}

export function SuperAdminSidebar() {
    const { t } = useSuperAdminLang();
    const { url } = usePage();
    const { slug: locale } = useLocale();

    const workspace: NavEntry[] = [
        {
            key: 'dashboard',
            label: t.nav_dashboard,
            href: superAdmin.dashboard.url({ locale }),
            icon: LayoutGrid,
            exact: true,
        },
        {
            key: 'clinics',
            label: t.nav_clinics,
            href: superAdmin.clinics.index.url({ locale }),
            icon: Building2,
        },
        {
            key: 'users',
            label: t.nav_users,
            href: superAdmin.users.url({ locale }),
            icon: Users,
        },
    ];

    const clinical: NavEntry[] = [
        {
            key: 'appointments',
            label: t.nav_appointments,
            href: superAdmin.appointments.url({ locale }),
            icon: Calendar,
        },
        {
            key: 'doctors',
            label: 'Doctors',
            href: superAdmin.doctors.url({ locale }),
            icon: Stethoscope,
        },
    ];

    const admin: NavEntry[] = [
        {
            key: 'audit',
            label: t.nav_audit,
            href: superAdmin.activityLog.url({ locale }),
            icon: Activity,
        },
        {
            key: 'finance',
            label: t.nav_finance,
            href: superAdmin.finance.url({ locale }),
            icon: FileBarChart,
        },
        {
            key: 'recycle',
            label: t.nav_recycle,
            href: superAdmin.recycle.url({ locale }),
            icon: Trash2,
        },
        {
            key: 'settings',
            label: t.nav_settings,
            href: superAdmin.settings.url({ locale }),
            icon: SettingsIcon,
        },
    ];

    return (
        <Sidebar collapsible="icon" className="border-sidebar-border">
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2.5 px-2 py-1.5">
                    <BrandIconMark />
                    <div className="grid min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="text-[15px] font-bold tracking-wide text-white">
                            {t.brand_name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                            {t.brand_sub}
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavSection
                    label={t.nav_workspace}
                    items={workspace}
                    currentUrl={url}
                />
                <NavSection
                    label={t.nav_clinical}
                    items={clinical}
                    currentUrl={url}
                />
                <NavSection
                    label={t.nav_admin}
                    items={admin}
                    currentUrl={url}
                />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarUserCard />
            </SidebarFooter>
        </Sidebar>
    );
}

function NavSection({
    label,
    items,
    currentUrl,
}: {
    label: string;
    items: NavEntry[];
    currentUrl: string;
}) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] tracking-[0.08em] text-slate-500 uppercase">
                {label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((entry) => {
                        const Icon = entry.icon;
                        const active = isActive(
                            currentUrl,
                            entry.href,
                            entry.exact,
                        );

                        return (
                            <SidebarMenuItem key={entry.key}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={active}
                                    tooltip={entry.label}
                                    className={cn(
                                        'text-slate-300 hover:bg-navy-900 hover:text-white',
                                        'data-[active=true]:bg-navy-800 data-[active=true]:text-white',
                                        'data-[active=true]:before:absolute data-[active=true]:before:start-0 data-[active=true]:before:top-2 data-[active=true]:before:bottom-2 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-e data-[active=true]:before:bg-olive-500',
                                        'group-data-[collapsible=icon]:before:hidden',
                                    )}
                                >
                                    <Link href={entry.href} prefetch>
                                        <Icon className="size-4" />
                                        <span>{entry.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
