import type { AppLang } from '@/lib/i18n/use-locale';

/**
 * Standalone i18n dictionary for the pre-login auth screens. The post-login
 * dictionaries are role-scoped (doctor/secretary/super-admin); auth runs before
 * a role exists, so it gets its own small dictionary keyed off the URL locale.
 */
export type AuthDictionary = {
    dir: 'ltr' | 'rtl';

    // Brand panel
    brand_tagline: string;
    feature_secure: string;
    feature_appointments: string;
    feature_bilingual: string;

    // Shared form
    email_label: string;
    email_ph: string;
    password_label: string;
    password_ph: string;
    confirm_password_label: string;
    confirm_password_ph: string;
    log_in_link: string;

    // Login
    login_title: string;
    login_desc: string;
    forgot_link: string;
    remember_me: string;
    log_in_btn: string;
    no_account: string;
    sign_up: string;

    // Register
    register_title: string;
    register_desc: string;
    first_name_label: string;
    first_name_ph: string;
    last_name_label: string;
    last_name_ph: string;
    clinic_name_label: string;
    clinic_name_ph: string;
    have_account: string;
    trial_badge: string;

    // Trial expired
    trial_expired_title: string;
    trial_expired_desc: string;
    trial_expired_body: string;
    trial_contact_btn: string;

    // Forgot password
    forgot_title: string;
    forgot_desc: string;
    send_reset_btn: string;
    or_return_to: string;

    // Reset password
    reset_title: string;
    reset_desc: string;
    reset_btn: string;

    // Verify email
    verify_title: string;
    verify_desc: string;
    verify_sent: string;
    resend_btn: string;
    log_out: string;

    // Confirm password
    confirm_title: string;
    confirm_desc: string;
    confirm_btn: string;

    // Two-factor challenge
    twofa_code_title: string;
    twofa_code_desc: string;
    twofa_recovery_title: string;
    twofa_recovery_desc: string;
    twofa_recovery_ph: string;
    twofa_toggle_to_recovery: string;
    twofa_toggle_to_code: string;
    continue_btn: string;
    twofa_or_you_can: string;

    // Accept invite
    invite_title: string;
    invite_desc: string;
    invited_as: string;
    role_doctor: string;
    role_secretary: string;
    create_account_btn: string;

    // Invite invalid
    invite_invalid_title: string;
    invite_invalid_desc: string;
    invite_invalid_body: string;
    go_home: string;
};

const en: AuthDictionary = {
    dir: 'ltr',
    brand_tagline: 'Modern clinic management',
    feature_secure: 'Secure patient records',
    feature_appointments: 'Smart appointment scheduling',
    feature_bilingual: 'Bilingual — French & Arabic',

    email_label: 'Email address',
    email_ph: 'email@example.com',
    password_label: 'Password',
    password_ph: 'Password',
    confirm_password_label: 'Confirm password',
    confirm_password_ph: 'Confirm password',
    log_in_link: 'log in',

    login_title: 'Log in to your account',
    login_desc: 'Enter your email and password below to log in',
    forgot_link: 'Forgot password?',
    remember_me: 'Remember me',
    log_in_btn: 'Log in',
    no_account: "Don't have an account?",
    sign_up: 'Sign up',

    register_title: 'Start your free trial',
    register_desc: 'Create your clinic account in a minute',
    first_name_label: 'First name',
    first_name_ph: 'First name',
    last_name_label: 'Last name',
    last_name_ph: 'Last name',
    clinic_name_label: 'Clinic name (optional)',
    clinic_name_ph: 'My Clinic',
    have_account: 'Already have an account?',
    trial_badge: '3-day free trial — no credit card required',

    trial_expired_title: 'Your free trial has ended',
    trial_expired_desc: 'Reactivate your clinic to continue',
    trial_expired_body:
        'Your 3-day free trial is over. Get in touch to upgrade your clinic and pick up right where you left off — your data is safe.',
    trial_contact_btn: 'Contact us to upgrade',

    forgot_title: 'Forgot password',
    forgot_desc: 'Enter your email to receive a password reset link',
    send_reset_btn: 'Email password reset link',
    or_return_to: 'Or, return to',

    reset_title: 'Reset password',
    reset_desc: 'Please enter your new password below',
    reset_btn: 'Reset password',

    verify_title: 'Verify email',
    verify_desc:
        'Please verify your email address by clicking the link we just emailed you.',
    verify_sent: 'A new verification link has been sent to your email address.',
    resend_btn: 'Resend verification email',
    log_out: 'Log out',

    confirm_title: 'Confirm your password',
    confirm_desc:
        'This is a secure area. Please confirm your password before continuing.',
    confirm_btn: 'Confirm password',

    twofa_code_title: 'Authentication code',
    twofa_code_desc:
        'Enter the authentication code provided by your authenticator application.',
    twofa_recovery_title: 'Recovery code',
    twofa_recovery_desc:
        'Confirm access to your account by entering one of your emergency recovery codes.',
    twofa_recovery_ph: 'Enter recovery code',
    twofa_toggle_to_recovery: 'login using a recovery code',
    twofa_toggle_to_code: 'login using an authentication code',
    continue_btn: 'Continue',
    twofa_or_you_can: 'or you can',

    invite_title: 'Accept your invitation',
    invite_desc: 'Set your email and password to activate your account',
    invited_as: "You're invited as",
    role_doctor: 'Doctor',
    role_secretary: 'Secretary',
    create_account_btn: 'Create my account',

    invite_invalid_title: 'Invitation unavailable',
    invite_invalid_desc: 'This link can no longer be used',
    invite_invalid_body:
        'This invitation link is invalid, has expired, or has already been used. Ask your administrator to send a new one.',
    go_home: 'Go to homepage',
};

const fr: AuthDictionary = {
    dir: 'ltr',
    brand_tagline: 'Gestion moderne de clinique',
    feature_secure: 'Dossiers patients sécurisés',
    feature_appointments: 'Planification intelligente des rendez-vous',
    feature_bilingual: 'Bilingue — français et arabe',

    email_label: 'Adresse e-mail',
    email_ph: 'email@example.com',
    password_label: 'Mot de passe',
    password_ph: 'Mot de passe',
    confirm_password_label: 'Confirmer le mot de passe',
    confirm_password_ph: 'Confirmer le mot de passe',
    log_in_link: 'se connecter',

    login_title: 'Connectez-vous à votre compte',
    login_desc: 'Saisissez votre e-mail et votre mot de passe pour vous connecter',
    forgot_link: 'Mot de passe oublié ?',
    remember_me: 'Se souvenir de moi',
    log_in_btn: 'Se connecter',
    no_account: "Vous n'avez pas de compte ?",
    sign_up: "S'inscrire",

    register_title: 'Démarrez votre essai gratuit',
    register_desc: 'Créez le compte de votre clinique en une minute',
    first_name_label: 'Prénom',
    first_name_ph: 'Prénom',
    last_name_label: 'Nom',
    last_name_ph: 'Nom',
    clinic_name_label: 'Nom de la clinique (facultatif)',
    clinic_name_ph: 'Ma Clinique',
    have_account: 'Vous avez déjà un compte ?',
    trial_badge: 'Essai gratuit de 3 jours — sans carte bancaire',

    trial_expired_title: 'Votre essai gratuit est terminé',
    trial_expired_desc: 'Réactivez votre clinique pour continuer',
    trial_expired_body:
        "Votre essai gratuit de 3 jours est terminé. Contactez-nous pour mettre à niveau votre clinique et reprendre là où vous vous êtes arrêté — vos données sont en sécurité.",
    trial_contact_btn: 'Contactez-nous pour passer à la version supérieure',

    forgot_title: 'Mot de passe oublié',
    forgot_desc:
        'Saisissez votre e-mail pour recevoir un lien de réinitialisation',
    send_reset_btn: 'Envoyer le lien de réinitialisation',
    or_return_to: 'Ou, revenir à',

    reset_title: 'Réinitialiser le mot de passe',
    reset_desc: 'Veuillez saisir votre nouveau mot de passe ci-dessous',
    reset_btn: 'Réinitialiser le mot de passe',

    verify_title: "Vérifier l'e-mail",
    verify_desc:
        'Veuillez vérifier votre adresse e-mail en cliquant sur le lien que nous venons de vous envoyer.',
    verify_sent:
        'Un nouveau lien de vérification a été envoyé à votre adresse e-mail.',
    resend_btn: "Renvoyer l'e-mail de vérification",
    log_out: 'Se déconnecter',

    confirm_title: 'Confirmez votre mot de passe',
    confirm_desc:
        'Ceci est une zone sécurisée. Veuillez confirmer votre mot de passe avant de continuer.',
    confirm_btn: 'Confirmer le mot de passe',

    twofa_code_title: "Code d'authentification",
    twofa_code_desc:
        "Saisissez le code d'authentification fourni par votre application.",
    twofa_recovery_title: 'Code de récupération',
    twofa_recovery_desc:
        "Confirmez l'accès à votre compte en saisissant l'un de vos codes de récupération.",
    twofa_recovery_ph: 'Saisir le code de récupération',
    twofa_toggle_to_recovery: 'se connecter avec un code de récupération',
    twofa_toggle_to_code: "se connecter avec un code d'authentification",
    continue_btn: 'Continuer',
    twofa_or_you_can: 'ou vous pouvez',

    invite_title: 'Acceptez votre invitation',
    invite_desc: 'Définissez votre e-mail et mot de passe pour activer votre compte',
    invited_as: 'Vous êtes invité en tant que',
    role_doctor: 'Médecin',
    role_secretary: 'Secrétaire',
    create_account_btn: 'Créer mon compte',

    invite_invalid_title: 'Invitation indisponible',
    invite_invalid_desc: 'Ce lien ne peut plus être utilisé',
    invite_invalid_body:
        "Ce lien d'invitation est invalide, a expiré ou a déjà été utilisé. Demandez à votre administrateur d'en envoyer un nouveau.",
    go_home: "Aller à l'accueil",
};

const ar: AuthDictionary = {
    dir: 'rtl',
    brand_tagline: 'إدارة عيادة حديثة',
    feature_secure: 'سجلات مرضى آمنة',
    feature_appointments: 'جدولة ذكية للمواعيد',
    feature_bilingual: 'ثنائي اللغة — الفرنسية والعربية',

    email_label: 'البريد الإلكتروني',
    email_ph: 'email@example.com',
    password_label: 'كلمة المرور',
    password_ph: 'كلمة المرور',
    confirm_password_label: 'تأكيد كلمة المرور',
    confirm_password_ph: 'تأكيد كلمة المرور',
    log_in_link: 'تسجيل الدخول',

    login_title: 'تسجيل الدخول إلى حسابك',
    login_desc: 'أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول',
    forgot_link: 'نسيت كلمة المرور؟',
    remember_me: 'تذكرني',
    log_in_btn: 'تسجيل الدخول',
    no_account: 'ليس لديك حساب؟',
    sign_up: 'إنشاء حساب',

    register_title: 'ابدأ تجربتك المجانية',
    register_desc: 'أنشئ حساب عيادتك في دقيقة',
    first_name_label: 'الاسم الأول',
    first_name_ph: 'الاسم الأول',
    last_name_label: 'اسم العائلة',
    last_name_ph: 'اسم العائلة',
    clinic_name_label: 'اسم العيادة (اختياري)',
    clinic_name_ph: 'عيادتي',
    have_account: 'لديك حساب بالفعل؟',
    trial_badge: 'تجربة مجانية لمدة 3 أيام — بدون بطاقة ائتمان',

    trial_expired_title: 'انتهت تجربتك المجانية',
    trial_expired_desc: 'أعد تفعيل عيادتك للمتابعة',
    trial_expired_body:
        'انتهت تجربتك المجانية لمدة 3 أيام. تواصل معنا لترقية عيادتك ومتابعة عملك من حيث توقفت — بياناتك آمنة.',
    trial_contact_btn: 'تواصل معنا للترقية',

    forgot_title: 'نسيت كلمة المرور',
    forgot_desc: 'أدخل بريدك الإلكتروني لتلقي رابط إعادة تعيين كلمة المرور',
    send_reset_btn: 'إرسال رابط إعادة التعيين',
    or_return_to: 'أو العودة إلى',

    reset_title: 'إعادة تعيين كلمة المرور',
    reset_desc: 'يرجى إدخال كلمة المرور الجديدة أدناه',
    reset_btn: 'إعادة تعيين كلمة المرور',

    verify_title: 'تأكيد البريد الإلكتروني',
    verify_desc:
        'يرجى تأكيد عنوان بريدك الإلكتروني بالنقر على الرابط الذي أرسلناه إليك للتو.',
    verify_sent: 'تم إرسال رابط تحقق جديد إلى عنوان بريدك الإلكتروني.',
    resend_btn: 'إعادة إرسال بريد التحقق',
    log_out: 'تسجيل الخروج',

    confirm_title: 'تأكيد كلمة المرور',
    confirm_desc: 'هذه منطقة آمنة. يرجى تأكيد كلمة المرور قبل المتابعة.',
    confirm_btn: 'تأكيد كلمة المرور',

    twofa_code_title: 'رمز المصادقة',
    twofa_code_desc: 'أدخل رمز المصادقة المقدم من تطبيق المصادقة الخاص بك.',
    twofa_recovery_title: 'رمز الاسترداد',
    twofa_recovery_desc: 'أكد الوصول إلى حسابك بإدخال أحد رموز الاسترداد الطارئة.',
    twofa_recovery_ph: 'أدخل رمز الاسترداد',
    twofa_toggle_to_recovery: 'تسجيل الدخول باستخدام رمز الاسترداد',
    twofa_toggle_to_code: 'تسجيل الدخول باستخدام رمز المصادقة',
    continue_btn: 'متابعة',
    twofa_or_you_can: 'أو يمكنك',

    invite_title: 'اقبل دعوتك',
    invite_desc: 'حدد بريدك الإلكتروني وكلمة المرور لتفعيل حسابك',
    invited_as: 'تمت دعوتك بصفة',
    role_doctor: 'طبيب',
    role_secretary: 'سكرتير',
    create_account_btn: 'إنشاء حسابي',

    invite_invalid_title: 'الدعوة غير متاحة',
    invite_invalid_desc: 'لم يعد من الممكن استخدام هذا الرابط',
    invite_invalid_body:
        'رابط الدعوة هذا غير صالح أو منتهي الصلاحية أو تم استخدامه بالفعل. اطلب من المسؤول إرسال رابط جديد.',
    go_home: 'الذهاب إلى الصفحة الرئيسية',
};

export const AUTH_I18N: Record<AppLang, AuthDictionary> = { en, fr, ar };
