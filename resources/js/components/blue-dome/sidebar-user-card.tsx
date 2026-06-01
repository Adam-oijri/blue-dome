import { Link, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';

import { useLocale } from '@/lib/i18n/use-locale';
import { logout } from '@/routes';

const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    doctor: 'Doctor',
    secretary: 'Secretary',
};

/**
 * Shared sidebar footer card. Renders the real authenticated user (from the
 * shared `auth.user` Inertia prop) across every role panel.
 */
export function SidebarUserCard() {
    const { auth } = usePage().props;
    const { slug: locale } = useLocale();
    const user = auth.user;

    const fullName =
        `${user.first_name} ${user.last_name}`.trim() || user.email;
    const initials =
        `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() ||
        user.email.charAt(0).toUpperCase();
    const roleLabel = ROLE_LABELS[user.role] ?? user.role;

    return (
        <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-olive-600 text-xs font-semibold text-white">
                {initials}
            </div>
            <div className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                <div className="truncate text-[12px] font-semibold text-sidebar-foreground">
                    {fullName}
                </div>
                <div className="text-[11px] text-sidebar-foreground/70">
                    {roleLabel}
                </div>
            </div>
            <Link
                href={logout({ locale })}
                as="button"
                className="text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden hover:text-sidebar-foreground"
                aria-label="Sign out"
            >
                <LogOut className="size-4" />
            </Link>
        </div>
    );
}
