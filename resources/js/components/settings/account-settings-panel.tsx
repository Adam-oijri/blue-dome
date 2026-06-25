import { Head } from '@inertiajs/react';
import {
    Languages,
    Palette,
    ShieldCheck,
    User as UserIcon,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useState } from 'react';

import { AppearanceCard } from '@/components/appearance-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import Heading from '@/components/heading';
import ProfileInformationForm from '@/components/settings/profile-information-form';
import TwoFactorSection from '@/components/settings/two-factor-section';
import UpdatePasswordForm from '@/components/settings/update-password-form';
import { useSettingsLang } from '@/lib/i18n/settings';
import { useLocale, useSwapLang } from '@/lib/i18n/use-locale';
import type { AppLang } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';

type SectionId = 'profile' | 'security' | 'language' | 'appearance';
type IconComponent = ComponentType<{ className?: string }>;

const LANGUAGE_LABELS: Record<AppLang, string> = {
    en: 'English',
    fr: 'Français',
    ar: 'العربية',
};

export interface AccountSettingsPanelProps {
    /** Page title (localized per panel). */
    title: string;
    /** Localized label/description for the appearance section. */
    appearanceTitle: string;
    appearanceHelp: string;
    mustVerifyEmail: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    passwordRules: string;
}

/**
 * Shared account-settings page used by every role panel. Renders a left
 * section nav (Profile / Security / Language / Appearance) and the real,
 * working forms — each posts to the existing settings/Fortify routes.
 */
export function AccountSettingsPanel({
    title,
    appearanceTitle,
    appearanceHelp,
    mustVerifyEmail,
    status,
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
    passwordRules,
}: AccountSettingsPanelProps) {
    const [section, setSection] = useState<SectionId>('profile');
    const { lang, country, supported } = useLocale();
    const swapLang = useSwapLang();
    const { t } = useSettingsLang();

    const availableLangs = (Object.keys(LANGUAGE_LABELS) as AppLang[]).filter(
        (l) => supported.includes(`${country.toLowerCase()}-${l}`),
    );

    const SECTIONS: { id: SectionId; label: string; icon: IconComponent }[] = [
        { id: 'profile', label: t.section_profile, icon: UserIcon },
        { id: 'security', label: t.section_security, icon: ShieldCheck },
        { id: 'language', label: t.section_language, icon: Languages },
        { id: 'appearance', label: appearanceTitle, icon: Palette },
    ];

    return (
        <>
            <Head title={title} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader title={title} />

                <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <nav
                        className="self-start rounded-xl border border-border bg-card p-2"
                        aria-label={t.nav_aria}
                    >
                        {SECTIONS.map((s) => {
                            const active = section === s.id;

                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setSection(s.id)}
                                    className={cn(
                                        'mb-0.5 flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                                        active
                                            ? 'bg-navy-900 text-white'
                                            : 'text-foreground hover:bg-muted',
                                    )}
                                >
                                    <s.icon className="size-3.5" />
                                    {s.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="rounded-xl border border-border bg-card p-6">
                        {section === 'profile' && (
                            <div className="space-y-6">
                                <Heading
                                    variant="small"
                                    title={t.profile_heading}
                                    description={t.profile_desc}
                                />

                                <ProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>
                        )}

                        {section === 'security' && (
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <Heading
                                        variant="small"
                                        title={t.password_heading}
                                        description={t.password_desc}
                                    />

                                    <UpdatePasswordForm
                                        passwordRules={passwordRules}
                                    />
                                </div>

                                {canManageTwoFactor && (
                                    <div className="space-y-6">
                                        <Heading
                                            variant="small"
                                            title={t.twofa_heading}
                                            description={t.twofa_desc}
                                        />

                                        <TwoFactorSection
                                            requiresConfirmation={
                                                requiresConfirmation
                                            }
                                            twoFactorEnabled={twoFactorEnabled}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {section === 'language' && (
                            <div className="space-y-6">
                                <Heading
                                    variant="small"
                                    title={t.language_heading}
                                    description={t.language_desc}
                                />

                                <div className="flex flex-wrap gap-2">
                                    {availableLangs.map((l) => {
                                        const active = l === lang;

                                        return (
                                            <button
                                                key={l}
                                                type="button"
                                                onClick={() => swapLang(l)}
                                                aria-pressed={active}
                                                className={cn(
                                                    'rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                                                    active
                                                        ? 'border-navy-900 bg-navy-900 text-white'
                                                        : 'border-border hover:bg-muted',
                                                )}
                                            >
                                                {LANGUAGE_LABELS[l]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {section === 'appearance' && (
                            <AppearanceCard
                                title={appearanceTitle}
                                description={appearanceHelp}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
