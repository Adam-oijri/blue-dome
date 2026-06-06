import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    FilePieChart,
    LayoutGrid,
    MessageCircle,
    Phone,
    Receipt,
    Settings as SettingsIcon,
    Stethoscope,
    UserPlus,
    Users,
    Wallet,
} from 'lucide-react';
import type { ComponentType } from 'react';

import { BrandIconMark } from '@/components/blue-dome/brand-icon-mark';
import { SidebarUserCard } from '@/components/blue-dome/sidebar-user-card';
import { useMessagesPoller } from '@/components/blue-dome/use-messages-poller';
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
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import messages from '@/routes/messages';
import secretary from '@/routes/secretary';

type NavEntry = {
    key: string;
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    badge?: string;
    exact?: boolean;
};

function isActive(url: string, target: string, exact = false): boolean {
    const path = url.split('?')[0];

    if (exact || target === '/' || target === '') {
        return path === target;
    }

    return path === target || path.startsWith(target + '/');
}

export function SecretarySidebar() {
    const { t } = useSecretaryLang();
    const { url } = usePage();
    const { slug: locale } = useLocale();
    const unreadMessages = usePage().props.messages?.unread ?? 0;

    useMessagesPoller();

    const overview: NavEntry[] = [
        {
            key: 'dashboard',
            label: t.nav_dashboard,
            href: secretary.dashboard.url({ locale }),
            icon: LayoutGrid,
            exact: true,
        },
    ];

    const operations: NavEntry[] = [
        {
            key: 'appointments',
            label: t.nav_appointments,
            href: secretary.appointments.url({ locale }),
            icon: Calendar,
        },
        {
            key: 'patients',
            label: t.nav_patients,
            href: secretary.patients.url({ locale }),
            icon: Users,
        },
        {
            key: 'walkins',
            label: t.nav_walkins,
            href: secretary.walkins.url({ locale }),
            icon: UserPlus,
        },
        {
            key: 'messages',
            label: t.nav_messages,
            href: messages.index.url({ locale }),
            icon: MessageCircle,
            badge:
                unreadMessages > 0
                    ? unreadMessages > 99
                        ? '99+'
                        : String(unreadMessages)
                    : undefined,
        },
        {
            key: 'whatsapp',
            label: t.nav_whatsapp,
            href: secretary.whatsapp.url({ locale }),
            icon: MessageCircle,
        },
        {
            key: 'followups',
            label: t.nav_followups,
            href: secretary.followUp.url({ locale }),
            icon: Phone,
        },
    ];

    const admin: NavEntry[] = [
        {
            key: 'billing',
            label: t.nav_billing,
            href: secretary.billing.url({ locale }),
            icon: Receipt,
        },
        {
            key: 'payments',
            label: t.nav_payments,
            href: secretary.payments.url({ locale }),
            icon: Wallet,
        },
        {
            key: 'doctors',
            label: t.nav_doctors,
            href: secretary.doctors.url({ locale }),
            icon: Stethoscope,
        },
        {
            key: 'branches',
            label: t.nav_branches,
            href: secretary.branches.url({ locale }),
            icon: Building2,
        },
        {
            key: 'reports',
            label: t.nav_reports,
            href: secretary.reports.url({ locale }),
            icon: FilePieChart,
        },
        {
            key: 'settings',
            label: t.nav_settings,
            href: secretary.settings.url({ locale }),
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
                            {t.brand_line1}
                        </span>
                        <span className="text-[11px] text-sidebar-foreground/70">
                            {t.brand_line2}
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavSection
                    label={t.nav_overview}
                    items={overview}
                    currentUrl={url}
                />
                <NavSection
                    label={t.nav_operations}
                    items={operations}
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
