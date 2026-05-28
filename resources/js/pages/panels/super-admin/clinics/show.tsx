import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    ChevronLeft,
    Mail,
    MessageCircle,
    Pause,
    Phone,
    Play,
    Shield,
    Users,
} from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import superAdmin from '@/routes/super-admin';

interface Clinic {
    id: string;
    name: string;
    slug?: string;
    country?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    currency?: string | null;
    timezone?: string | null;
    locale?: string | null;
    subscription_plan?: string;
    subscription_status?: string;
    subscription_expiry?: string | null;
    is_active?: boolean;
    users_count?: number;
    patients_count?: number;
    max_users?: number;
    max_branches?: number;
    max_storage_mb?: number;
    created_at?: string;
}

interface ClinicManager {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
}

interface ClinicShowProps {
    clinic: Clinic;
    manager: ClinicManager | null;
}

const STATUS_TONE: Record<string, StatusTone> = {
    active: 'success',
    trialing: 'olive',
    past_due: 'warning',
    suspended: 'danger',
    cancelled: 'neutral',
};

export default function SuperAdminClinicShow({
    clinic,
    manager,
}: ClinicShowProps) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();
    const status = clinic.subscription_status ?? 'active';
    const suspended = status === 'suspended';

    return (
        <>
            <Head title={`${clinic.name} — ${t.nav_clinics}`} />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link href={superAdmin.clinics.index.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            {t.nav_clinics}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">
                        {clinic.name}
                    </span>
                </div>

                <PageHeader
                    title={clinic.name}
                    description={
                        <span className="flex items-center gap-2.5">
                            <StatusPill
                                tone={STATUS_TONE[status] ?? 'neutral'}
                                withDot
                            >
                                {status.replace('_', ' ')}
                            </StatusPill>
                            <span className="text-[13px] text-muted-foreground">
                                {clinic.subscription_plan ?? 'free'} plan
                                {clinic.subscription_expiry &&
                                    ` · renews ${clinic.subscription_expiry}`}
                            </span>
                        </span>
                    }
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                asChild
                            >
                                <Link
                                    href={superAdmin.clinics.whatsapp.edit.url({
                                        locale,
                                        clinic: clinic.id,
                                    })}
                                >
                                    <MessageCircle className="size-3.5" />
                                    WhatsApp
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                asChild
                            >
                                <Link
                                    href={superAdmin.clinics.email.edit.url({
                                        locale,
                                        clinic: clinic.id,
                                    })}
                                >
                                    <Mail className="size-3.5" />
                                    Email
                                </Link>
                            </Button>
                            {suspended ? (
                                <Button
                                    className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                                    asChild
                                >
                                    <Link
                                        href={superAdmin.clinics.restore.url({
                                            locale,
                                            clinic: clinic.id,
                                        })}
                                        method="post"
                                        as="button"
                                    >
                                        <Play className="size-3.5" />
                                        Restore clinic
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="gap-2 border-danger text-danger hover:bg-danger-soft"
                                    asChild
                                >
                                    <Link
                                        href={superAdmin.clinics.suspend.url({
                                            locale,
                                            clinic: clinic.id,
                                        })}
                                        method="post"
                                        as="button"
                                    >
                                        <Pause className="size-3.5" />
                                        Suspend clinic
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label="Staff"
                        value={`${clinic.users_count ?? 0} / ${clinic.max_users ?? '—'}`}
                        icon={Users}
                        tone="navy"
                    />
                    <KpiCard
                        label="Patients"
                        value={clinic.patients_count ?? 0}
                        icon={Users}
                        tone="navy"
                    />
                    <KpiCard
                        label="Branches"
                        value={clinic.max_branches ?? '—'}
                        icon={Building2}
                        tone="olive"
                    />
                    <KpiCard
                        label="Storage cap"
                        value={`${clinic.max_storage_mb ?? '—'} MB`}
                        icon={Shield}
                        tone="navy"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    <SectionCard
                        title="Clinic profile"
                        titleIcon={<Building2 className="size-4" />}
                        bodyClassName="grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-2"
                    >
                        <Field label="Name" value={clinic.name} />
                        <Field label="Slug" value={clinic.slug ?? '—'} mono />
                        <Field label="Country" value={clinic.country ?? '—'} />
                        <Field
                            label="Timezone"
                            value={clinic.timezone ?? '—'}
                        />
                        <Field
                            label="Currency"
                            value={clinic.currency ?? '—'}
                        />
                        <Field
                            label="Default locale"
                            value={clinic.locale ?? '—'}
                        />
                        <Field
                            label="Phone"
                            value={clinic.phone ?? '—'}
                            icon={<Phone className="size-3.5" />}
                            mono
                        />
                        <Field
                            label="Email"
                            value={clinic.email ?? '—'}
                            icon={<Mail className="size-3.5" />}
                            mono
                        />
                        <Field
                            label="Address"
                            value={clinic.address ?? '—'}
                            className="sm:col-span-2"
                        />
                    </SectionCard>

                    <SectionCard
                        title="Subscription"
                        bodyClassName="space-y-3 p-4 text-[13px]"
                    >
                        <Row
                            label="Plan"
                            value={clinic.subscription_plan ?? '—'}
                        />
                        <Row
                            label="Status"
                            value={
                                <StatusPill
                                    tone={STATUS_TONE[status] ?? 'neutral'}
                                    withDot
                                >
                                    {status.replace('_', ' ')}
                                </StatusPill>
                            }
                        />
                        <Row
                            label="Renews"
                            value={clinic.subscription_expiry ?? '—'}
                        />
                        <Row
                            label="Created"
                            value={
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="size-3" />
                                    {clinic.created_at ?? '—'}
                                </span>
                            }
                        />
                        <div className="border-t border-border pt-3">
                            <div className="mb-1.5 text-[11px] tracking-wider text-muted-foreground uppercase">
                                Manager
                            </div>
                            {manager ? (
                                <div className="flex items-center gap-2">
                                    <Shield className="size-3.5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0">
                                        <div className="truncate text-[13px] font-semibold">
                                            {[
                                                manager.first_name,
                                                manager.last_name,
                                            ]
                                                .filter(Boolean)
                                                .join(' ') || manager.email}
                                        </div>
                                        <div className="truncate font-mono text-[12px] text-muted-foreground">
                                            {manager.email}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-[12px] text-muted-foreground">
                                    No manager assigned.
                                </div>
                            )}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}

function Field({
    label,
    value,
    icon,
    mono,
    className,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
    mono?: boolean;
    className?: string;
}) {
    return (
        <div className={className}>
            <div className="text-[11px] tracking-wider text-muted-foreground uppercase">
                {label}
            </div>
            <div
                className={cn(
                    'mt-1 flex items-center gap-1.5 text-[14px]',
                    mono && 'font-mono text-[13px]',
                )}
            >
                {icon}
                <span>{value}</span>
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}
