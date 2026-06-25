import { useEffect } from 'react';

import type { AppLang } from '@/lib/i18n/use-locale';
import { useLocale } from '@/lib/i18n/use-locale';

/**
 * Shared i18n dictionary for the account-settings UI (profile, security,
 * language, appearance). These screens are role-agnostic — the same forms are
 * rendered for doctor / secretary / super-admin — so the strings live in a
 * single dictionary keyed off the URL locale rather than the role dictionaries.
 */
export type SettingsDictionary = {
    dir: 'ltr' | 'rtl';

    // Section nav
    nav_aria: string;
    section_profile: string;
    section_security: string;
    section_language: string;
    section_appearance: string;

    // Profile section
    profile_heading: string;
    profile_desc: string;
    name_label: string;
    name_ph: string;
    email_label: string;
    email_ph: string;
    email_unverified: string;
    resend_verification_link: string;
    verification_sent: string;
    save_btn: string;

    // Security section
    password_heading: string;
    password_desc: string;
    current_password_label: string;
    current_password_ph: string;
    new_password_label: string;
    new_password_ph: string;
    confirm_password_label: string;
    confirm_password_ph: string;
    save_password_btn: string;

    // Two-factor
    twofa_heading: string;
    twofa_desc: string;
    twofa_enabled_help: string;
    twofa_disabled_help: string;
    twofa_disable_btn: string;
    twofa_enable_btn: string;
    twofa_continue_setup_btn: string;

    // Language section
    language_heading: string;
    language_desc: string;

    // Appearance section
    appearance_heading: string;
    appearance_desc: string;

    // Standalone page titles (Head + sr-only headings)
    profile_settings_title: string;
    security_settings_title: string;
    appearance_settings_title: string;
    appearance_settings_desc: string;
};

const en: SettingsDictionary = {
    dir: 'ltr',

    nav_aria: 'Settings sections',
    section_profile: 'Profile',
    section_security: 'Security',
    section_language: 'Language',
    section_appearance: 'Appearance',

    profile_heading: 'Profile information',
    profile_desc: 'Update your name and email address',
    name_label: 'Name',
    name_ph: 'Full name',
    email_label: 'Email address',
    email_ph: 'Email address',
    email_unverified: 'Your email address is unverified.',
    resend_verification_link: 'Click here to resend the verification email.',
    verification_sent:
        'A new verification link has been sent to your email address.',
    save_btn: 'Save',

    password_heading: 'Update password',
    password_desc:
        'Ensure your account is using a long, random password to stay secure',
    current_password_label: 'Current password',
    current_password_ph: 'Current password',
    new_password_label: 'New password',
    new_password_ph: 'New password',
    confirm_password_label: 'Confirm password',
    confirm_password_ph: 'Confirm password',
    save_password_btn: 'Save password',

    twofa_heading: 'Two-factor authentication',
    twofa_desc: 'Manage your two-factor authentication settings',
    twofa_enabled_help:
        'You will be prompted for a secure, random pin during login, which you can retrieve from the TOTP-supported application on your phone.',
    twofa_disabled_help:
        'When you enable two-factor authentication, you will be prompted for a secure pin during login. This pin can be retrieved from a TOTP-supported application on your phone.',
    twofa_disable_btn: 'Disable 2FA',
    twofa_enable_btn: 'Enable 2FA',
    twofa_continue_setup_btn: 'Continue setup',

    language_heading: 'Language',
    language_desc: 'Choose the interface language. Applies across the app.',

    appearance_heading: 'Appearance',
    appearance_desc: 'Choose how the interface looks. Applies everywhere.',

    profile_settings_title: 'Profile settings',
    security_settings_title: 'Security settings',
    appearance_settings_title: 'Appearance settings',
    appearance_settings_desc: "Update your account's appearance settings",
};

const fr: SettingsDictionary = {
    dir: 'ltr',

    nav_aria: 'Sections des paramètres',
    section_profile: 'Profil',
    section_security: 'Sécurité',
    section_language: 'Langue',
    section_appearance: 'Apparence',

    profile_heading: 'Informations du profil',
    profile_desc: 'Mettez à jour votre nom et votre adresse e-mail',
    name_label: 'Nom',
    name_ph: 'Nom complet',
    email_label: 'Adresse e-mail',
    email_ph: 'Adresse e-mail',
    email_unverified: "Votre adresse e-mail n'est pas vérifiée.",
    resend_verification_link:
        "Cliquez ici pour renvoyer l'e-mail de vérification.",
    verification_sent:
        'Un nouveau lien de vérification a été envoyé à votre adresse e-mail.',
    save_btn: 'Enregistrer',

    password_heading: 'Modifier le mot de passe',
    password_desc:
        'Assurez-vous que votre compte utilise un mot de passe long et aléatoire pour rester sécurisé',
    current_password_label: 'Mot de passe actuel',
    current_password_ph: 'Mot de passe actuel',
    new_password_label: 'Nouveau mot de passe',
    new_password_ph: 'Nouveau mot de passe',
    confirm_password_label: 'Confirmer le mot de passe',
    confirm_password_ph: 'Confirmer le mot de passe',
    save_password_btn: 'Enregistrer le mot de passe',

    twofa_heading: 'Authentification à deux facteurs',
    twofa_desc: "Gérez vos paramètres d'authentification à deux facteurs",
    twofa_enabled_help:
        "Un code PIN sécurisé et aléatoire vous sera demandé lors de la connexion ; vous pouvez l'obtenir depuis l'application compatible TOTP sur votre téléphone.",
    twofa_disabled_help:
        "Lorsque vous activez l'authentification à deux facteurs, un code PIN sécurisé vous sera demandé lors de la connexion. Ce code peut être obtenu depuis une application compatible TOTP sur votre téléphone.",
    twofa_disable_btn: "Désactiver l'A2F",
    twofa_enable_btn: "Activer l'A2F",
    twofa_continue_setup_btn: 'Poursuivre la configuration',

    language_heading: 'Langue',
    language_desc:
        "Choisissez la langue de l'interface. S'applique à toute l'application.",

    appearance_heading: 'Apparence',
    appearance_desc:
        "Choisissez l'apparence de l'interface. S'applique partout.",

    profile_settings_title: 'Paramètres du profil',
    security_settings_title: 'Paramètres de sécurité',
    appearance_settings_title: "Paramètres d'apparence",
    appearance_settings_desc:
        "Mettez à jour les paramètres d'apparence de votre compte",
};

const ar: SettingsDictionary = {
    dir: 'rtl',

    nav_aria: 'أقسام الإعدادات',
    section_profile: 'الملف الشخصي',
    section_security: 'الأمان',
    section_language: 'اللغة',
    section_appearance: 'المظهر',

    profile_heading: 'معلومات الملف الشخصي',
    profile_desc: 'حدّث اسمك وعنوان بريدك الإلكتروني',
    name_label: 'الاسم',
    name_ph: 'الاسم الكامل',
    email_label: 'البريد الإلكتروني',
    email_ph: 'البريد الإلكتروني',
    email_unverified: 'لم يتم التحقق من عنوان بريدك الإلكتروني.',
    resend_verification_link: 'انقر هنا لإعادة إرسال بريد التحقق.',
    verification_sent: 'تم إرسال رابط تحقق جديد إلى عنوان بريدك الإلكتروني.',
    save_btn: 'حفظ',

    password_heading: 'تغيير كلمة المرور',
    password_desc:
        'تأكد من أن حسابك يستخدم كلمة مرور طويلة وعشوائية للحفاظ على الأمان',
    current_password_label: 'كلمة المرور الحالية',
    current_password_ph: 'كلمة المرور الحالية',
    new_password_label: 'كلمة المرور الجديدة',
    new_password_ph: 'كلمة المرور الجديدة',
    confirm_password_label: 'تأكيد كلمة المرور',
    confirm_password_ph: 'تأكيد كلمة المرور',
    save_password_btn: 'حفظ كلمة المرور',

    twofa_heading: 'المصادقة الثنائية',
    twofa_desc: 'إدارة إعدادات المصادقة الثنائية الخاصة بك',
    twofa_enabled_help:
        'سيُطلب منك رمز PIN آمن وعشوائي عند تسجيل الدخول، يمكنك الحصول عليه من تطبيق المصادقة المتوافق مع TOTP على هاتفك.',
    twofa_disabled_help:
        'عند تفعيل المصادقة الثنائية، سيُطلب منك رمز PIN آمن عند تسجيل الدخول. يمكن الحصول على هذا الرمز من تطبيق متوافق مع TOTP على هاتفك.',
    twofa_disable_btn: 'تعطيل المصادقة الثنائية',
    twofa_enable_btn: 'تفعيل المصادقة الثنائية',
    twofa_continue_setup_btn: 'متابعة الإعداد',

    language_heading: 'اللغة',
    language_desc: 'اختر لغة الواجهة. تُطبّق على كامل التطبيق.',

    appearance_heading: 'المظهر',
    appearance_desc: 'اختر شكل الواجهة. يُطبّق في كل مكان.',

    profile_settings_title: 'إعدادات الملف الشخصي',
    security_settings_title: 'إعدادات الأمان',
    appearance_settings_title: 'إعدادات المظهر',
    appearance_settings_desc: 'حدّث إعدادات مظهر حسابك',
};

export const SETTINGS_I18N: Record<AppLang, SettingsDictionary> = {
    en,
    fr,
    ar,
};

/**
 * Language hook for the account-settings UI. Reads the locale from the URL
 * (`/{country}-{lang}/…`) and returns the matching dictionary, syncing the
 * document direction/lang so RTL (Arabic) renders correctly.
 */
export function useSettingsLang(): { t: SettingsDictionary } {
    const { lang } = useLocale();
    const t = SETTINGS_I18N[lang];

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        document.documentElement.dir = t.dir;
        document.documentElement.lang = lang;
    }, [lang, t.dir]);

    return { t };
}
