import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import UserController from '@/actions/App/Http/Controllers/SuperAdmin/UserController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

interface UserData {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
    role: string;
    is_active: boolean;
}

const ROLES = ['super_admin', 'doctor', 'secretary'];

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

export default function SuperAdminUserEdit({
    user,
    clinic,
    isSelf,
}: {
    user: UserData;
    clinic: { id: string; name: string } | null;
    isSelf: boolean;
}) {
    const { slug: locale } = useLocale();

    return (
        <>
            <Head
                title={`Edit — ${user.first_name ?? ''} ${user.last_name ?? ''}`}
            />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link href={superAdmin.users.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            Users
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">Edit user</span>
                </div>

                <PageHeader
                    title={
                        `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() ||
                        user.email
                    }
                    description={
                        clinic
                            ? `Staff member at ${clinic.name}`
                            : 'Staff member'
                    }
                />

                <SectionCard className="mt-6">
                    <Form
                        {...UserController.update.form({
                            locale,
                            user: user.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="space-y-6 p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name">
                                            First name
                                        </Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            defaultValue={user.first_name ?? ''}
                                            required
                                        />
                                        <InputError
                                            message={errors.first_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">
                                            Last name
                                        </Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            defaultValue={user.last_name ?? ''}
                                            required
                                        />
                                        <InputError
                                            message={errors.last_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={user.email}
                                            required
                                            autoComplete="off"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            defaultValue={user.phone ?? ''}
                                            autoComplete="off"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Role</Label>
                                        <select
                                            id="role"
                                            name={isSelf ? undefined : 'role'}
                                            defaultValue={user.role}
                                            disabled={isSelf}
                                            className={selectClass}
                                        >
                                            {ROLES.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                        {isSelf && (
                                            <input
                                                type="hidden"
                                                name="role"
                                                value={user.role}
                                            />
                                        )}
                                        <InputError message={errors.role} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="is_active">
                                            Status
                                        </Label>
                                        <select
                                            id="is_active"
                                            name={
                                                isSelf ? undefined : 'is_active'
                                            }
                                            defaultValue={
                                                user.is_active ? '1' : '0'
                                            }
                                            disabled={isSelf}
                                            className={selectClass}
                                        >
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                        {isSelf && (
                                            <input
                                                type="hidden"
                                                name="is_active"
                                                value={
                                                    user.is_active ? '1' : '0'
                                                }
                                            />
                                        )}
                                        <InputError
                                            message={errors.is_active}
                                        />
                                    </div>
                                </div>

                                {isSelf && (
                                    <p className="text-[12px] text-muted-foreground">
                                        You cannot change your own role or
                                        deactivate your own account.
                                    </p>
                                )}

                                <div className="border-t border-border pt-6">
                                    <p className="mb-4 text-[13px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Reset password (optional)
                                    </p>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">
                                                New password
                                            </Label>
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                autoComplete="new-password"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">
                                                Confirm password
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-navy-900 text-white hover:bg-navy-800"
                                >
                                    {processing && <Spinner />}
                                    Save changes
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
