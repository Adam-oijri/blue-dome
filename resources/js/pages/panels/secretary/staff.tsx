import { Head, router } from '@inertiajs/react';
import { Stethoscope, Trash2, UserCog, UserPlus, X } from 'lucide-react';

import { InviteStaffSecretarySheet } from '@/components/blue-dome/invite-staff-secretary-sheet';
import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { destroy as destroyStaff } from '@/routes/secretary/staff';
import { revoke as revokeInvitation } from '@/routes/secretary/staff/invitations';

type StaffMember = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    role: 'doctor' | 'secretary';
    is_active: boolean;
    is_self: boolean;
};

type PendingInvite = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: 'doctor' | 'secretary';
    expires_at: string | null;
};

interface Props {
    staff: StaffMember[];
    pending: PendingInvite[];
    caps: { doctor: number; secretary: number };
    counts: { doctor: number; secretary: number };
}

const fullName = (p: {
    first_name: string | null;
    last_name: string | null;
}): string => `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—';

const initials = (p: {
    first_name: string | null;
    last_name: string | null;
}): string =>
    `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() || '?';

export default function SecretaryStaff({
    staff,
    pending,
    caps,
    counts,
}: Props) {
    const { t } = useSecretaryLang();
    const { slug: locale } = useLocale();

    const roleLabel = (role: 'doctor' | 'secretary'): string =>
        role === 'doctor' ? t.staff_role_doctor : t.staff_role_secretary;
    const roleTone = (role: 'doctor' | 'secretary'): StatusTone =>
        role === 'doctor' ? 'navy' : 'olive';

    const remove = (member: StaffMember): void => {
        router.delete(destroyStaff.url({ locale, user: member.id }), {
            preserveScroll: true,
            onBefore: () =>
                confirm(
                    t.staff_remove_confirm.replace('{name}', fullName(member)),
                ),
        });
    };

    const revoke = (invite: PendingInvite): void => {
        router.delete(revokeInvitation.url({ locale, invitation: invite.id }), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t.staff_title} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.staff_title}
                    description={t.staff_desc}
                    actions={
                        <InviteStaffSecretarySheet>
                            <Button className="gap-2 bg-olive-600 text-white hover:bg-olive-700">
                                <UserPlus className="size-4" />
                                {t.staff_invite}
                            </Button>
                        </InviteStaffSecretarySheet>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                    <KpiCard
                        label={t.staff_count_doctors}
                        value={`${counts.doctor} / ${caps.doctor}`}
                        icon={Stethoscope}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.staff_count_secretaries}
                        value={`${counts.secretary} / ${caps.secretary}`}
                        icon={UserCog}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.staff_pending_title}
                        value={pending.length}
                        icon={UserPlus}
                        tone="warn"
                    />
                </div>

                <SectionCard title={t.staff_title} bodyClassName="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.staff_col_name}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.staff_col_role}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.staff_col_email}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.staff_col_status}
                                </TableHead>
                                <TableHead className="w-16" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        {t.staff_no_staff}
                                    </TableCell>
                                </TableRow>
                            )}
                            {staff.map((member) => (
                                <TableRow
                                    key={member.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                    member.role === 'doctor'
                                                        ? 'bg-navy-700'
                                                        : 'bg-olive-600',
                                                )}
                                            >
                                                {initials(member)}
                                            </div>
                                            <div className="text-[13px] font-semibold">
                                                {fullName(member)}
                                                {member.is_self && (
                                                    <span className="ms-1.5 text-[11px] font-normal text-muted-foreground">
                                                        ({t.staff_you})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={roleTone(member.role)}
                                        >
                                            {roleLabel(member.role)}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell className="text-[13px] text-muted-foreground">
                                        {member.email ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                member.is_active
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                            withDot
                                        >
                                            {member.is_active
                                                ? t.staff_status_active
                                                : t.staff_status_inactive}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell>
                                        {!member.is_self && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 gap-1.5 text-danger"
                                                onClick={() => remove(member)}
                                            >
                                                <Trash2 className="size-3.5" />
                                                {t.staff_remove}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </SectionCard>

                {pending.length > 0 && (
                    <SectionCard
                        title={t.staff_pending_title}
                        bodyClassName="p-0"
                        className="mt-5"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        {t.staff_pending_invitee}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.staff_col_role}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.staff_pending_expires}
                                    </TableHead>
                                    <TableHead className="w-16" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pending.map((invite) => (
                                    <TableRow
                                        key={invite.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3 text-[13px] font-semibold">
                                            {fullName(invite)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={roleTone(invite.role)}
                                            >
                                                {roleLabel(invite.role)}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {invite.expires_at?.slice(0, 10) ??
                                                '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 gap-1.5 text-danger"
                                                onClick={() => revoke(invite)}
                                            >
                                                <X className="size-3.5" />
                                                {t.staff_revoke}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </SectionCard>
                )}
            </div>
        </>
    );
}
