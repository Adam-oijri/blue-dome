import {
    Activity,
    BarChart3,
    Building2,
    Calendar,
    Globe2,
    MessageCircle,
    Receipt,
    Stethoscope,
    UserPlus,
} from 'lucide-react';
import type { ComponentType } from 'react';

import type { LangPair } from '@/components/landing/shared/types';

export const NAV: { label: LangPair; href: string }[] = [
    {
        label: { en: 'Product', fr: 'Produit', ar: 'المنتج' },
        href: '#features',
    },
    {
        label: { en: 'Workflow', fr: 'Workflow', ar: 'سير العمل' },
        href: '#workflow',
    },
    { label: { en: 'Pricing', fr: 'Tarifs', ar: 'الأسعار' }, href: '#pricing' },
    {
        label: { en: 'Customers', fr: 'Témoignages', ar: 'العملاء' },
        href: '#stories',
    },
];

export type FeatureTone = 'navy' | 'olive' | 'warm' | 'cool';

export const FEATURES: {
    icon: ComponentType<{ className?: string }>;
    title: LangPair;
    body: LangPair;
    tone: FeatureTone;
}[] = [
    {
        icon: Calendar,
        title: {
            en: 'Smart scheduling',
            fr: 'Planning intelligent',
            ar: 'جدولة ذكية',
        },
        body: {
            en: 'Multi-doctor, multi-branch calendar with drag-and-drop, recurring slots, and conflict detection out of the box.',
            fr: 'Calendrier multi-médecins, multi-cabinets, glisser-déposer, créneaux récurrents et détection de conflits.',
            ar: 'تقويم متعدد الأطباء والفروع مع السحب والإفلات، والمواعيد المتكررة، وكشف التعارضات تلقائيًا.',
        },
        tone: 'navy',
    },
    {
        icon: MessageCircle,
        title: {
            en: 'WhatsApp first',
            fr: 'WhatsApp d’abord',
            ar: 'واتساب أولًا',
        },
        body: {
            en: 'Confirm appointments, deliver prescriptions, share lab results — natively on the channel your patients already use.',
            fr: 'Confirmez les RDV, envoyez ordonnances et résultats — sur le canal que vos patients utilisent déjà.',
            ar: 'أكّد المواعيد، وأرسل الوصفات، وشارك نتائج التحاليل — مباشرة عبر القناة التي يستخدمها مرضاك بالفعل.',
        },
        tone: 'olive',
    },
    {
        icon: Stethoscope,
        title: {
            en: 'Clinical workspace',
            fr: 'Espace clinique',
            ar: 'مساحة عمل سريرية',
        },
        body: {
            en: 'SOAP notes, vitals, drug-interaction checks, lab orders. Built for the way doctors actually think.',
            fr: 'Notes SOAP, signes vitaux, interactions médicamenteuses, analyses. Pensé pour les médecins.',
            ar: 'ملاحظات SOAP، والعلامات الحيوية، وفحص التفاعلات الدوائية، وطلبات التحاليل. مصمّمة وفق طريقة تفكير الأطباء.',
        },
        tone: 'warm',
    },
    {
        icon: Receipt,
        title: {
            en: 'Billing that holds up',
            fr: 'Facturation solide',
            ar: 'فوترة موثوقة',
        },
        body: {
            en: 'Cash, card, insurance, transfer. Aging analysis, partial payments, automatic reminders.',
            fr: 'Espèces, carte, assurance, virement. Analyse des soldes, paiements partiels, rappels auto.',
            ar: 'نقدًا أو ببطاقة أو تأمين أو تحويل. تحليل المستحقات، والدفعات الجزئية، والتذكيرات التلقائية.',
        },
        tone: 'cool',
    },
    {
        icon: Building2,
        title: {
            en: 'Multi-branch by design',
            fr: 'Multi-cabinets natif',
            ar: 'تعدّد الفروع بالتصميم',
        },
        body: {
            en: 'One clinic, several branches, shared patients, isolated data. Postgres row-level security keeps tenants apart.',
            fr: 'Une clinique, plusieurs cabinets, patients partagés, données isolées. RLS Postgres garantit l’isolement.',
            ar: 'عيادة واحدة، عدّة فروع، مرضى مشتركون، وبيانات معزولة. أمان مستوى الصفوف في Postgres يفصل بين المستأجرين.',
        },
        tone: 'navy',
    },
    {
        icon: Globe2,
        title: {
            en: 'Trilingual + RTL',
            fr: 'Trilingue + RTL',
            ar: 'ثلاثي اللغات + RTL',
        },
        body: {
            en: 'EN, FR, AR everywhere — interface, documents, patient messages. Arabic flows right-to-left, naturally.',
            fr: 'EN, FR, AR partout — interface, documents, messages patients. L’arabe en RTL, naturellement.',
            ar: 'الإنجليزية والفرنسية والعربية في كل مكان — الواجهة والمستندات ورسائل المرضى. العربية من اليمين إلى اليسار بشكل طبيعي.',
        },
        tone: 'olive',
    },
];

export const TONE_BG: Record<FeatureTone, string> = {
    navy: 'bg-navy-50 text-navy-700',
    olive: 'bg-olive-50 text-olive-700',
    warm: 'bg-amber-50 text-amber-700',
    cool: 'bg-sky-50 text-sky-700',
};

export const STATS: { value: number; suffix: string; label: LangPair }[] = [
    {
        value: 3000,
        suffix: '+',
        label: {
            en: 'Patients managed',
            fr: 'Patients suivis',
            ar: 'مريض تتم متابعته',
        },
    },
    {
        value: 87,
        suffix: '%',
        label: {
            en: 'WhatsApp delivery',
            fr: 'Livraison WhatsApp',
            ar: 'تسليم واتساب',
        },
    },
    {
        value: 12,
        suffix: ' min',
        label: {
            en: 'Saved per visit',
            fr: 'Économisées / visite',
            ar: 'موفّرة لكل زيارة',
        },
    },
    {
        value: 4.9,
        suffix: '/5',
        label: { en: 'Doctor rating', fr: 'Note médecin', ar: 'تقييم الأطباء' },
    },
];

export const STEPS: {
    n: string;
    title: LangPair;
    body: LangPair;
    icon: ComponentType<{ className?: string }>;
}[] = [
    {
        n: '01',
        icon: UserPlus,
        title: {
            en: 'Onboard in minutes',
            fr: 'Démarrez en minutes',
            ar: 'انطلق في دقائق',
        },
        body: {
            en: 'Import patients via CSV or start fresh. Invite your team with role-based access in three clicks.',
            fr: 'Importez vos patients en CSV ou démarrez à zéro. Invitez votre équipe en trois clics.',
            ar: 'استورد المرضى عبر ملف CSV أو ابدأ من الصفر. ادعُ فريقك بصلاحيات حسب الدور في ثلاث نقرات.',
        },
    },
    {
        n: '02',
        icon: Activity,
        title: {
            en: 'Run your day',
            fr: 'Pilotez votre journée',
            ar: 'أدِر يومك',
        },
        body: {
            en: 'Walk-ins, appointments, SOAP notes, prescriptions, payments — every gesture in one place.',
            fr: 'Sans RDV, consultations, ordonnances, paiements — tous les gestes au même endroit.',
            ar: 'المرضى دون موعد، والمواعيد، وملاحظات SOAP، والوصفات، والمدفوعات — كل إجراء في مكان واحد.',
        },
    },
    {
        n: '03',
        icon: BarChart3,
        title: {
            en: 'Grow with insight',
            fr: 'Grandissez avec data',
            ar: 'انمُ بالبيانات',
        },
        body: {
            en: 'Real-time KPIs, aging reports, no-show analysis, revenue trends. Decisions backed by facts.',
            fr: 'KPIs en temps réel, créances, no-shows, tendances de revenus. Décidez sur des faits.',
            ar: 'مؤشرات أداء فورية، وتقارير المستحقات، وتحليل التغيّب، واتجاهات الإيرادات. قرارات مبنية على الحقائق.',
        },
    },
];

export const TIERS: {
    name: LangPair;
    price: string;
    period: LangPair;
    blurb: LangPair;
    cta: LangPair;
    features: LangPair[];
    featured?: boolean;
}[] = [
    {
        name: { en: 'Starter', fr: 'Starter', ar: 'Starter' },
        price: '290',
        period: { en: '/month', fr: '/mois', ar: '/شهريًا' },
        blurb: {
            en: 'For solo practitioners getting their first clinic online.',
            fr: 'Pour les praticiens solo qui démarrent.',
            ar: 'للأطباء المستقلين الذين يطلقون عيادتهم الأولى على الإنترنت.',
        },
        cta: {
            en: 'Start free trial',
            fr: 'Essai gratuit',
            ar: 'ابدأ التجربة المجانية',
        },
        features: [
            {
                en: '1 doctor · 1 branch',
                fr: '1 médecin · 1 cabinet',
                ar: 'طبيب واحد · فرع واحد',
            },
            {
                en: 'Up to 500 patients',
                fr: 'Jusqu’à 500 patients',
                ar: 'حتى 500 مريض',
            },
            {
                en: 'WhatsApp confirmations',
                fr: 'Confirmations WhatsApp',
                ar: 'تأكيدات عبر واتساب',
            },
            {
                en: 'Email support',
                fr: 'Support email',
                ar: 'دعم عبر البريد الإلكتروني',
            },
        ],
    },
    {
        name: { en: 'Professional', fr: 'Professionnel', ar: 'احترافي' },
        price: '890',
        period: { en: '/month', fr: '/mois', ar: '/شهريًا' },
        blurb: {
            en: 'Multi-doctor, multi-branch, with full clinical + billing workflows.',
            fr: 'Multi-médecins, multi-sites, workflows cliniques + facturation complets.',
            ar: 'متعدد الأطباء والفروع، مع سير عمل سريري وفوترة كاملين.',
        },
        cta: { en: 'Get started', fr: 'Commencer', ar: 'ابدأ الآن' },
        features: [
            {
                en: 'Up to 15 staff · 3 branches',
                fr: 'Jusqu’à 15 utilisateurs · 3 cabinets',
                ar: 'حتى 15 مستخدمًا · 3 فروع',
            },
            {
                en: 'Unlimited patients',
                fr: 'Patients illimités',
                ar: 'مرضى بلا حدود',
            },
            {
                en: 'Lab integrations · Inventory',
                fr: 'Intégrations labo · Stock',
                ar: 'تكاملات المختبرات · المخزون',
            },
            {
                en: 'Reports + activity audit',
                fr: 'Rapports + audit',
                ar: 'التقارير + سجل النشاط',
            },
            {
                en: 'Priority support',
                fr: 'Support prioritaire',
                ar: 'دعم ذو أولوية',
            },
        ],
        featured: true,
    },
    {
        name: { en: 'Enterprise', fr: 'Enterprise', ar: 'Enterprise' },
        price: '2,400',
        period: { en: '/month', fr: '/mois', ar: '/شهريًا' },
        blurb: {
            en: 'Group practices, hospitals, custom integrations, dedicated success.',
            fr: 'Groupes, hôpitaux, intégrations sur mesure, accompagnement dédié.',
            ar: 'المجموعات الطبية والمستشفيات، وتكاملات مخصّصة، ومرافقة مخصّصة لنجاحك.',
        },
        cta: {
            en: 'Talk to sales',
            fr: 'Parler à un commercial',
            ar: 'تواصل مع المبيعات',
        },
        features: [
            {
                en: 'Unlimited staff + branches',
                fr: 'Utilisateurs et cabinets illimités',
                ar: 'مستخدمون وفروع بلا حدود',
            },
            {
                en: 'SSO · Custom roles',
                fr: 'SSO · Rôles personnalisés',
                ar: 'تسجيل دخول موحّد · أدوار مخصّصة',
            },
            {
                en: 'HL7 / FHIR connectors',
                fr: 'Connecteurs HL7 / FHIR',
                ar: 'موصّلات HL7 / FHIR',
            },
            {
                en: 'Dedicated CSM',
                fr: 'Customer Success dédié',
                ar: 'مدير نجاح عملاء مخصّص',
            },
            {
                en: '99.95% SLA',
                fr: 'SLA 99,95%',
                ar: 'اتفاقية مستوى خدمة 99.95%',
            },
        ],
    },
];

export const TRUSTED_NAMES = [
    'Cabinet Dr. Lahlou',
    'Hôpital Cheikh Zaid',
    'Polyclinique Atlas',
    'Lab Biocenter',
    'Pasteur Maroc',
    'Cabinet Idrissi',
];

export const TESTIMONIALS: {
    quote: LangPair;
    name: string;
    role: LangPair;
    initials: string;
    avatarTone: 'navy' | 'olive';
}[] = [
    {
        quote: {
            en: '"We cut administrative time in half and no-shows dropped 28%. The team can finally breathe."',
            fr: '« Nous avons divisé le temps administratif par deux et nos no-shows ont chuté de 28 %. L’équipe respire enfin. »',
            ar: '«قلّصنا الوقت الإداري إلى النصف وانخفض عدد المتغيّبين بنسبة 28٪. أصبح الفريق أخيرًا يتنفّس بارتياح.»',
        },
        name: 'Dr. Karim Lahlou',
        role: {
            en: 'Cardiologist · Cabinet Dr. Lahlou, Casablanca',
            fr: 'Cardiologue · Cabinet Dr. Lahlou, Casablanca',
            ar: 'طبيب قلب · عيادة د. لحلو، الدار البيضاء',
        },
        initials: 'KL',
        avatarTone: 'navy',
    },
    {
        quote: {
            en: '"Patients confirm their appointments before I even arrive in the morning. WhatsApp delivery rate sits above 90%."',
            fr: '« Les patients confirment leurs rendez-vous avant même mon arrivée au cabinet. Le taux de livraison WhatsApp dépasse les 90 %. »',
            ar: '«يؤكّد المرضى مواعيدهم قبل وصولي إلى العيادة صباحًا. ويتجاوز معدّل تسليم واتساب 90٪.»',
        },
        name: 'Salma Idrissi',
        role: {
            en: 'Practice Manager · Polyclinique Atlas, Rabat',
            fr: 'Gérante · Polyclinique Atlas, Rabat',
            ar: 'مديرة العيادة · بوليكلينيك أطلس، الرباط',
        },
        initials: 'SI',
        avatarTone: 'olive',
    },
    {
        quote: {
            en: '"Closing the books used to take two days. Now it’s one click. The aging report alone paid for the year of subscription."',
            fr: '« La clôture comptable prenait deux jours. Désormais : un clic. Le rapport des créances a remboursé l’abonnement annuel. »',
            ar: '«كان إقفال الحسابات يستغرق يومين. أما الآن فبنقرة واحدة. ووحده تقرير المستحقات غطّى قيمة اشتراك السنة.»',
        },
        name: 'Omar Tazi',
        role: {
            en: 'Accountant · Clinique Bennani, Marrakech',
            fr: 'Comptable · Clinique Bennani, Marrakech',
            ar: 'محاسب · عيادة بناني، مراكش',
        },
        initials: 'OT',
        avatarTone: 'navy',
    },
];

export const COMPARE_ROWS: {
    label: LangPair;
    old: LangPair;
    blueDome: LangPair;
}[] = [
    {
        label: {
            en: 'Confirm tomorrow’s appointments',
            fr: 'Confirmer les RDV de demain',
            ar: 'تأكيد مواعيد الغد',
        },
        old: {
            en: 'Call 18 patients yourself',
            fr: 'Appeler 18 patients vous-même',
            ar: 'الاتصال بـ 18 مريضًا بنفسك',
        },
        blueDome: {
            en: 'WhatsApp template, 1 click',
            fr: 'Modèle WhatsApp, 1 clic',
            ar: 'قالب واتساب بنقرة واحدة',
        },
    },
    {
        label: {
            en: 'Multi-doctor calendar',
            fr: 'Calendrier multi-médecins',
            ar: 'تقويم متعدد الأطباء',
        },
        old: {
            en: 'Three notebooks, one secretary',
            fr: 'Trois cahiers, une secrétaire',
            ar: 'ثلاثة دفاتر وسكرتيرة واحدة',
        },
        blueDome: {
            en: 'Unified view, conflict alerts',
            fr: 'Vue unifiée, alertes de conflits',
            ar: 'عرض موحّد وتنبيهات للتعارضات',
        },
    },
    {
        label: {
            en: 'Close the day’s cash drawer',
            fr: 'Clôturer la caisse du jour',
            ar: 'إقفال صندوق اليوم',
        },
        old: {
            en: 'Excel + receipts + prayer',
            fr: 'Excel + reçus + une prière',
            ar: 'إكسل + إيصالات + دعاء',
        },
        blueDome: {
            en: 'Reconciled to the dirham',
            fr: 'Réconcilié au dirham près',
            ar: 'تسوية دقيقة حتى الدرهم',
        },
    },
    {
        label: {
            en: 'Send a prescription',
            fr: 'Envoyer une ordonnance',
            ar: 'إرسال وصفة طبية',
        },
        old: {
            en: 'Photo + personal WhatsApp',
            fr: 'Photo + WhatsApp personnel',
            ar: 'صورة + واتساب شخصي',
        },
        blueDome: {
            en: 'Branded PDF over Cloud API',
            fr: 'PDF signé via Cloud API',
            ar: 'ملف PDF موسوم عبر Cloud API',
        },
    },
    {
        label: {
            en: 'Aging report on overdue bills',
            fr: 'Créances en retard',
            ar: 'تقرير المستحقات المتأخرة',
        },
        old: {
            en: 'Two days, headache, regret',
            fr: 'Deux jours, mal de tête, regret',
            ar: 'يومان من الصداع والندم',
        },
        blueDome: {
            en: 'Real-time, bucketed by age',
            fr: 'Temps réel, par tranche d’âge',
            ar: 'فوري، مصنّف حسب مدّة التأخير',
        },
    },
    {
        label: {
            en: 'Hand off to next secretary',
            fr: 'Transmettre à la secrétaire suivante',
            ar: 'التسليم إلى السكرتيرة التالية',
        },
        old: { en: 'A Post-it', fr: 'Un Post-it', ar: 'ورقة ملاحظات لاصقة' },
        blueDome: {
            en: 'Activity log, every change',
            fr: 'Journal d’audit, chaque action',
            ar: 'سجل نشاط يوثّق كل تغيير',
        },
    },
];

export type IntegrationStatus = 'live' | 'beta' | 'planned';
export type IntegrationTint =
    | 'navy'
    | 'olive'
    | 'amber'
    | 'emerald'
    | 'sky'
    | 'rose';

export type Integration = {
    name: string;
    category: LangPair;
    status: IntegrationStatus;
    initial: string;
    tint: IntegrationTint;
};

export const INTEGRATIONS: Integration[] = [
    {
        name: 'WhatsApp Cloud API',
        category: { en: 'Messaging', fr: 'Messagerie', ar: 'المراسلة' },
        status: 'live',
        initial: 'W',
        tint: 'emerald',
    },
    {
        name: 'Meta Business Suite',
        category: { en: 'Messaging', fr: 'Messagerie', ar: 'المراسلة' },
        status: 'live',
        initial: 'M',
        tint: 'sky',
    },
    {
        name: 'CMI Maroc',
        category: { en: 'Payments', fr: 'Paiements', ar: 'المدفوعات' },
        status: 'live',
        initial: 'C',
        tint: 'navy',
    },
    {
        name: 'Stripe',
        category: { en: 'Payments', fr: 'Paiements', ar: 'المدفوعات' },
        status: 'beta',
        initial: 'S',
        tint: 'olive',
    },
    {
        name: 'Lab Biocenter',
        category: { en: 'Lab orders', fr: 'Analyses', ar: 'طلبات التحاليل' },
        status: 'live',
        initial: 'B',
        tint: 'amber',
    },
    {
        name: 'Pasteur Maroc',
        category: { en: 'Lab orders', fr: 'Analyses', ar: 'طلبات التحاليل' },
        status: 'live',
        initial: 'P',
        tint: 'rose',
    },
    {
        name: 'CNSS',
        category: { en: 'Insurance', fr: 'Assurance', ar: 'التأمين' },
        status: 'live',
        initial: 'N',
        tint: 'navy',
    },
    {
        name: 'CNOPS',
        category: { en: 'Insurance', fr: 'Assurance', ar: 'التأمين' },
        status: 'live',
        initial: 'O',
        tint: 'olive',
    },
    {
        name: 'HL7 / FHIR',
        category: {
            en: 'Interop',
            fr: 'Interopérabilité',
            ar: 'قابلية التشغيل البيني',
        },
        status: 'beta',
        initial: 'H',
        tint: 'amber',
    },
    {
        name: 'Google Calendar',
        category: { en: 'Calendar', fr: 'Calendrier', ar: 'التقويم' },
        status: 'planned',
        initial: 'G',
        tint: 'sky',
    },
];

export type SecurityIcon =
    | 'shield'
    | 'lock'
    | 'key'
    | 'database'
    | 'flag'
    | 'eye';

export const SECURITY_BADGES: {
    title: LangPair;
    description: LangPair;
    icon: SecurityIcon;
}[] = [
    {
        title: {
            en: 'GDPR · Law 09-08',
            fr: 'GDPR · Loi 09-08',
            ar: 'النظام الأوروبي · القانون 09-08',
        },
        description: {
            en: 'Patient data residency in EU and Morocco-compliant data centers, with clinic-scoped row-level security.',
            fr: 'Hébergement patient en centres conformes UE et Maroc, isolation par cabinet via RLS.',
            ar: 'استضافة بيانات المرضى في مراكز بيانات متوافقة مع الاتحاد الأوروبي والمغرب، مع عزل أمني على مستوى الصفوف لكل عيادة.',
        },
        icon: 'shield',
    },
    {
        title: {
            en: 'Encrypted end-to-end',
            fr: 'Chiffré bout en bout',
            ar: 'تشفير من الطرف إلى الطرف',
        },
        description: {
            en: 'AES-256 at rest, TLS 1.3 in transit. Two-factor secrets and access tokens stored separately.',
            fr: 'AES-256 au repos, TLS 1.3 en transit. Secrets 2FA et tokens isolés.',
            ar: 'تشفير AES-256 للبيانات المخزّنة وTLS 1.3 أثناء النقل. تُخزَّن أسرار المصادقة الثنائية ورموز الوصول بمعزل عن بعضها.',
        },
        icon: 'lock',
    },
    {
        title: {
            en: '2FA · WebAuthn ready',
            fr: '2FA · WebAuthn ready',
            ar: 'مصادقة ثنائية · جاهز لـ WebAuthn',
        },
        description: {
            en: 'TOTP today, hardware keys and passkeys on Enterprise. Recovery codes always available.',
            fr: 'TOTP aujourd’hui, clés matérielles et passkeys en Enterprise. Codes de récupération inclus.',
            ar: 'رموز TOTP اليوم، ومفاتيح مادية ومفاتيح مرور في خطة Enterprise. رموز الاسترداد متاحة دائمًا.',
        },
        icon: 'key',
    },
    {
        title: {
            en: 'Daily encrypted backups',
            fr: 'Sauvegardes chiffrées quotidiennes',
            ar: 'نسخ احتياطية مشفّرة يوميًا',
        },
        description: {
            en: 'Point-in-time recovery over 30 days. Tested monthly. Exportable to your own S3 on Enterprise.',
            fr: 'Restauration ponctuelle sur 30 jours. Testée mensuellement. Export S3 dédié en Enterprise.',
            ar: 'استعادة لحظية تغطّي 30 يومًا. تُختبر شهريًا. وقابلة للتصدير إلى حساب S3 خاص بك في خطة Enterprise.',
        },
        icon: 'database',
    },
    {
        title: {
            en: 'ISO 27001 — in progress',
            fr: 'ISO 27001 — en cours',
            ar: 'ISO 27001 — قيد الإنجاز',
        },
        description: {
            en: 'Audit kicked off Q2 2026. SOC 2 Type II planned for early 2027.',
            fr: 'Audit lancé T2 2026. SOC 2 Type II prévu début 2027.',
            ar: 'انطلق التدقيق في الربع الثاني من 2026. ويُخطَّط لشهادة SOC 2 Type II مطلع 2027.',
        },
        icon: 'flag',
    },
    {
        title: {
            en: 'Full activity audit',
            fr: 'Audit complet des actions',
            ar: 'تدقيق كامل للنشاط',
        },
        description: {
            en: 'Every clinical, financial and admin action is logged with actor, timestamp, before/after — for years.',
            fr: 'Chaque action est tracée avec auteur, horodatage, avant/après — sur des années.',
            ar: 'يُسجَّل كل إجراء سريري ومالي وإداري مع الفاعل والطابع الزمني والحالة قبل/بعد — لسنوات.',
        },
        icon: 'eye',
    },
];

export const FAQ: { q: LangPair; a: LangPair }[] = [
    {
        q: {
            en: 'How long does the migration take?',
            fr: 'Combien de temps prend la migration ?',
            ar: 'كم تستغرق عملية الترحيل؟',
        },
        a: {
            en: 'Most clinics are live in under a week. We import your patient list, set up your branches and users, and walk you through your first day on the platform — included in every plan.',
            fr: 'La plupart des cabinets sont opérationnels en moins d’une semaine. Nous importons vos patients, configurons vos cabinets et utilisateurs, et vous accompagnons sur votre premier jour — inclus dans tous les plans.',
            ar: 'تصبح معظم العيادات جاهزة في أقل من أسبوع. نستورد قائمة مرضاك، ونعدّ فروعك ومستخدميك، ونرافقك خلال يومك الأول على المنصة — وهذا مشمول في كل الخطط.',
        },
    },
    {
        q: {
            en: 'Is patient data stored in Morocco?',
            fr: 'Les données patients sont-elles hébergées au Maroc ?',
            ar: 'هل تُخزَّن بيانات المرضى في المغرب؟',
        },
        a: {
            en: 'Yes. All clinical data is hosted on EU and Morocco-compliant infrastructure, encrypted at rest, and isolated per clinic with Postgres row-level security. GDPR and Law 09-08 compliant.',
            fr: 'Oui. Toutes les données cliniques sont hébergées sur une infrastructure conforme UE/Maroc, chiffrées au repos, et isolées par cabinet via RLS Postgres. Conformes GDPR et Loi 09-08.',
            ar: 'نعم. تُستضاف جميع البيانات السريرية على بنية تحتية متوافقة مع الاتحاد الأوروبي والمغرب، ومشفّرة أثناء التخزين، ومعزولة لكل عيادة عبر أمان مستوى الصفوف في Postgres. متوافقة مع النظام الأوروبي والقانون 09-08.',
        },
    },
    {
        q: {
            en: 'Can my secretaries and doctors use it in Arabic?',
            fr: 'Mes secrétaires et médecins peuvent-ils l’utiliser en arabe ?',
            ar: 'هل يستطيع سكرتيراتي وأطبائي استخدامه باللغة العربية؟',
        },
        a: {
            en: 'Yes. Every interface, document and patient message supports English, French, and Arabic — with full right-to-left rendering. Switch per user, per document, or per patient.',
            fr: 'Oui. Toute l’interface, les documents et messages patients supportent l’anglais, le français et l’arabe — avec RTL complet. Changement par utilisateur, document ou patient.',
            ar: 'نعم. تدعم كل واجهة ومستند ورسالة مريض الإنجليزية والفرنسية والعربية — مع عرض كامل من اليمين إلى اليسار. ويمكن التبديل لكل مستخدم أو مستند أو مريض.',
        },
    },
    {
        q: {
            en: 'What happens to my data if I cancel?',
            fr: 'Que devient mes données si j’annule ?',
            ar: 'ماذا يحدث لبياناتي إذا ألغيت الاشتراك؟',
        },
        a: {
            en: 'You own your data. Export everything to CSV or PDF at any time. After cancellation we keep your data available for 60 days, then permanently delete it.',
            fr: 'Vous restez propriétaire de vos données. Exportez tout en CSV ou PDF à tout moment. Après annulation nous conservons les données 60 jours, puis suppression définitive.',
            ar: 'أنت مالك بياناتك. صدّر كل شيء إلى CSV أو PDF في أي وقت. وبعد الإلغاء نُبقي بياناتك متاحة لمدة 60 يومًا، ثم نحذفها نهائيًا.',
        },
    },
    {
        q: {
            en: 'Does the WhatsApp integration require my own Cloud API account?',
            fr: 'L’intégration WhatsApp nécessite-t-elle mon propre compte Cloud API ?',
            ar: 'هل يتطلّب تكامل واتساب حساب Cloud API خاصًا بي؟',
        },
        a: {
            en: 'Either works. Use the bundled Blue Dome number on Starter and Professional, or bring your own Meta Business account on Enterprise for fully white-labelled patient messaging.',
            fr: 'Au choix. Utilisez le numéro Blue Dome sur Starter et Professionnel, ou apportez votre compte Meta Business sur Enterprise pour une messagerie patient entièrement personnalisée.',
            ar: 'كلاهما ممكن. استخدم رقم Blue Dome المُضمَّن في خطّتَي Starter وProfessional، أو اربط حساب Meta Business الخاص بك في خطة Enterprise للحصول على مراسلة مرضى تحمل علامتك بالكامل.',
        },
    },
    {
        q: {
            en: 'How do you handle insurance, partial payments and refunds?',
            fr: 'Comment gérez-vous l’assurance, les paiements partiels et les remboursements ?',
            ar: 'كيف تتعاملون مع التأمين والدفعات الجزئية والمستردات؟',
        },
        a: {
            en: 'Every invoice supports mixed payments (cash + insurance + card), aging analysis, partial payment tracking, and refunds. Default workflows match Moroccan CNSS, CNOPS, and private insurer conventions.',
            fr: 'Chaque facture gère les paiements mixtes (espèces + assurance + carte), l’analyse des créances, les paiements partiels et les remboursements. Workflows par défaut compatibles CNSS, CNOPS et assureurs privés.',
            ar: 'تدعم كل فاتورة المدفوعات المختلطة (نقدًا + تأمين + بطاقة)، وتحليل المستحقات، وتتبّع الدفعات الجزئية، والمستردات. وتتوافق مسارات العمل الافتراضية مع أعراف CNSS وCNOPS وشركات التأمين الخاصة في المغرب.',
        },
    },
];
