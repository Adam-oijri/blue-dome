import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export interface ClinicFormData {
    id?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    postal_code?: string | null;
    currency?: string | null;
    timezone?: string | null;
    locale?: string | null;
    date_format?: string | null;
    subscription_plan?: string | null;
    subscription_status?: string | null;
    subscription_expiry?: string | null;
    max_users?: number | null;
    max_branches?: number | null;
    max_storage_mb?: number | null;
    is_active?: boolean;
}

const PLANS = ['free', 'basic', 'professional', 'enterprise'];
const STATUSES = ['active', 'trial', 'expired', 'suspended', 'cancelled'];

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

function Field({
    label,
    name,
    error,
    type = 'text',
    defaultValue = '',
    required = false,
}: {
    label: string;
    name: string;
    error?: string;
    type?: string;
    defaultValue?: string | number;
    required?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                defaultValue={defaultValue}
                required={required}
                autoComplete="off"
            />
            <InputError message={error} />
        </div>
    );
}

function GroupHeading({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-[13px] font-semibold tracking-wider text-muted-foreground uppercase">
            {children}
        </h3>
    );
}

export function ClinicFormFields({
    clinic,
    processing,
    errors,
    submitLabel,
}: {
    clinic?: ClinicFormData;
    processing: boolean;
    errors: Partial<Record<string, string>>;
    submitLabel: string;
}) {
    const isActive = clinic ? (clinic.is_active ? '1' : '0') : '1';

    return (
        <>
            <div className="space-y-4">
                <GroupHeading>Profile</GroupHeading>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                        label="Clinic name"
                        name="name"
                        required
                        defaultValue={clinic?.name ?? ''}
                        error={errors.name}
                    />
                    <Field
                        label="Email"
                        name="email"
                        type="email"
                        defaultValue={clinic?.email ?? ''}
                        error={errors.email}
                    />
                    <Field
                        label="Phone"
                        name="phone"
                        defaultValue={clinic?.phone ?? ''}
                        error={errors.phone}
                    />
                    <Field
                        label="City"
                        name="city"
                        defaultValue={clinic?.city ?? ''}
                        error={errors.city}
                    />
                    <Field
                        label="Country (ISO-2)"
                        name="country"
                        defaultValue={clinic?.country ?? 'MA'}
                        error={errors.country}
                    />
                    <Field
                        label="Postal code"
                        name="postal_code"
                        defaultValue={clinic?.postal_code ?? ''}
                        error={errors.postal_code}
                    />
                </div>
                <Field
                    label="Address"
                    name="address"
                    defaultValue={clinic?.address ?? ''}
                    error={errors.address}
                />
            </div>

            <div className="space-y-4">
                <GroupHeading>Localization</GroupHeading>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                        label="Currency (ISO-3)"
                        name="currency"
                        defaultValue={clinic?.currency ?? 'MAD'}
                        error={errors.currency}
                    />
                    <Field
                        label="Timezone"
                        name="timezone"
                        defaultValue={clinic?.timezone ?? 'Africa/Casablanca'}
                        error={errors.timezone}
                    />
                    <Field
                        label="Locale"
                        name="locale"
                        defaultValue={clinic?.locale ?? 'ar-MA'}
                        error={errors.locale}
                    />
                    <Field
                        label="Date format"
                        name="date_format"
                        defaultValue={clinic?.date_format ?? 'DD/MM/YYYY'}
                        error={errors.date_format}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <GroupHeading>Subscription</GroupHeading>
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="subscription_plan">Plan</Label>
                        <select
                            id="subscription_plan"
                            name="subscription_plan"
                            defaultValue={clinic?.subscription_plan ?? 'free'}
                            className={selectClass}
                        >
                            {PLANS.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.subscription_plan} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="subscription_status">Status</Label>
                        <select
                            id="subscription_status"
                            name="subscription_status"
                            defaultValue={
                                clinic?.subscription_status ?? 'trial'
                            }
                            className={selectClass}
                        >
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.subscription_status} />
                    </div>
                    <Field
                        label="Renews on"
                        name="subscription_expiry"
                        type="date"
                        defaultValue={
                            clinic?.subscription_expiry?.slice(0, 10) ?? ''
                        }
                        error={errors.subscription_expiry}
                    />
                    <div className="grid gap-2">
                        <Label htmlFor="is_active">Active</Label>
                        <select
                            id="is_active"
                            name="is_active"
                            defaultValue={isActive}
                            className={selectClass}
                        >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                        <InputError message={errors.is_active} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <GroupHeading>Limits</GroupHeading>
                <div className="grid gap-5 sm:grid-cols-3">
                    <Field
                        label="Max users"
                        name="max_users"
                        type="number"
                        defaultValue={clinic?.max_users ?? ''}
                        error={errors.max_users}
                    />
                    <Field
                        label="Max branches"
                        name="max_branches"
                        type="number"
                        defaultValue={clinic?.max_branches ?? ''}
                        error={errors.max_branches}
                    />
                    <Field
                        label="Storage (MB)"
                        name="max_storage_mb"
                        type="number"
                        defaultValue={clinic?.max_storage_mb ?? ''}
                        error={errors.max_storage_mb}
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={processing}
                className="bg-navy-900 text-white hover:bg-navy-800"
            >
                {processing && <Spinner />}
                {submitLabel}
            </Button>
        </>
    );
}
