import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    FlaskConical,
    Home,
    Pill,
    Settings as SettingsIcon,
    Stethoscope,
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
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import doctor from '@/routes/doctor';
import labOrders from '@/routes/lab-orders';
import medicalRecords from '@/routes/medical-records';
import patients from '@/routes/patients';
import prescriptions from '@/routes/prescriptions';

type NavEntry = {
    key: string;
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    badge?: string;
    matchPrefix?: string;
    exact?: boolean;
};

function isActive(url: string, entry: NavEntry): boolean {
    const target = entry.matchPrefix ?? entry.href;
    const path = url.split('?')[0];

    if (entry.exact || target === '/' || target === '') {
        return path === target;
    }

    return path === target || path.startsWith(target + '/');
}

export function DoctorSidebar() {
    const { t } = useDoctorLang();
    const { url } = usePage();
    const { slug: locale } = useLocale();
    const calendarUrl = doctor.calendar.url({ locale });

    const workspace: NavEntry[] = [
        {
            key: 'dashboard',
            label: t.dashboard,
            href: doctor.dashboard.url({ locale }),
            icon: Home,
            exact: true,
        },
        {
            key: 'calendar',
            label: t.appointments,
            href: calendarUrl,
            icon: Calendar,
            matchPrefix: calendarUrl,
        },
        {
            key: 'patients',
            label: t.patients,
            href: patients.index.url({ locale }),
            icon: Users,
        },
        {
            key: 'confirmations',
            label: t.confirmations,
            href: doctor.confirmations.url({ locale }),
            icon: Activity,
        },
    ];

    const clinical: NavEntry[] = [
        {
            key: 'consultations',
            label: t.consultations,
            href: medicalRecords.index.url({ locale }),
            icon: Stethoscope,
        },
        {
            key: 'rx',
            label: t.prescriptions,
            href: prescriptions.index.url({ locale }),
            icon: Pill,
        },
        {
            key: 'labs',
            label: t.lab_orders,
            href: labOrders.index.url({ locale }),
            icon: FlaskConical,
        },
    ];

    const admin: NavEntry[] = [
        {
            key: 'settings',
            label: t.settings,
            href: doctor.settings.url({ locale }),
            icon: SettingsIcon,
        },
    ];

    return (
        <Sidebar collapsible="icon" className="border-sidebar-border">
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2.5 px-2 py-1.5">
                    <BrandIconMark />
                    <div className="grid min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="text-[15px] font-bold tracking-wide text-sidebar-foreground">
                            {t.brand}
                        </span>
                        <span className="text-[11px] text-sidebar-foreground/70">
                            {t.brand_sub}
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavSection
                    label={t.nav_main}
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
            <SidebarGroupLabel className="text-[10px] tracking-[0.08em] uppercase">
                {label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((entry) => {
                        const Icon = entry.icon;
                        const active = isActive(currentUrl, entry);

                        return (
                            <SidebarMenuItem key={entry.key}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={active}
                                    tooltip={entry.label}
                                    className={cn(
                                        'text-sidebar-foreground/80',
                                        'data-[active=true]:bg-navy-100 data-[active=true]:font-medium data-[active=true]:text-navy-800',
                                        'dark:data-[active=true]:bg-navy-900 dark:data-[active=true]:text-white',
                                        'data-[active=true]:before:absolute data-[active=true]:before:start-0 data-[active=true]:before:top-2 data-[active=true]:before:bottom-2 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-e data-[active=true]:before:bg-olive-500',
                                        'group-data-[collapsible=icon]:before:hidden',
                                    )}
                                >
                                    <Link href={entry.href} prefetch>
                                        <Icon className="size-4" />
                                        <span>{entry.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {entry.badge && (
                                    <SidebarMenuBadge
                                        className={cn(
                                            'bg-navy-100 text-[11px] text-navy-700 dark:bg-navy-800 dark:text-slate-300',
                                            active &&
                                                'bg-olive-600 text-white dark:bg-olive-600 dark:text-white',
                                        )}
                                    >
                                        {entry.badge}
                                    </SidebarMenuBadge>
                                )}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
