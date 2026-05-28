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
    { label: { en: 'Product', fr: 'Produit' }, href: '#features' },
    { label: { en: 'Workflow', fr: 'Workflow' }, href: '#workflow' },
    { label: { en: 'Pricing', fr: 'Tarifs' }, href: '#pricing' },
    { label: { en: 'Customers', fr: 'Témoignages' }, href: '#stories' },
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
        title: { en: 'Smart scheduling', fr: 'Planning intelligent' },
        body: {
            en: 'Multi-doctor, multi-branch calendar with drag-and-drop, recurring slots, and conflict detection out of the box.',
            fr: 'Calendrier multi-médecins, multi-cabinets, glisser-déposer, créneaux récurrents et détection de conflits.',
        },
        tone: 'navy',
    },
    {
        icon: MessageCircle,
        title: { en: 'WhatsApp first', fr: 'WhatsApp d’abord' },
        body: {
            en: 'Confirm appointments, deliver prescriptions, share lab results — natively on the channel your patients already use.',
            fr: 'Confirmez les RDV, envoyez ordonnances et résultats — sur le canal que vos patients utilisent déjà.',
        },
        tone: 'olive',
    },
    {
        icon: Stethoscope,
        title: { en: 'Clinical workspace', fr: 'Espace clinique' },
        body: {
            en: 'SOAP notes, vitals, drug-interaction checks, lab orders. Built for the way doctors actually think.',
            fr: 'Notes SOAP, signes vitaux, interactions médicamenteuses, analyses. Pensé pour les médecins.',
        },
        tone: 'warm',
    },
    {
        icon: Receipt,
        title: { en: 'Billing that holds up', fr: 'Facturation solide' },
        body: {
            en: 'Cash, card, insurance, transfer. Aging analysis, partial payments, automatic reminders.',
            fr: 'Espèces, carte, assurance, virement. Analyse des soldes, paiements partiels, rappels auto.',
        },
        tone: 'cool',
    },
    {
        icon: Building2,
        title: { en: 'Multi-branch by design', fr: 'Multi-cabinets natif' },
        body: {
            en: 'One clinic, several branches, shared patients, isolated data. Postgres row-level security keeps tenants apart.',
            fr: 'Une clinique, plusieurs cabinets, patients partagés, données isolées. RLS Postgres garantit l’isolement.',
        },
        tone: 'navy',
    },
    {
        icon: Globe2,
        title: { en: 'Trilingual + RTL', fr: 'Trilingue + RTL' },
        body: {
            en: 'EN, FR, AR everywhere — interface, documents, patient messages. Arabic flows right-to-left, naturally.',
            fr: 'EN, FR, AR partout — interface, documents, messages patients. L’arabe en RTL, naturellement.',
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
        label: { en: 'Patients managed', fr: 'Patients suivis' },
    },
    {
        value: 87,
        suffix: '%',
        label: { en: 'WhatsApp delivery', fr: 'Livraison WhatsApp' },
    },
    {
        value: 12,
        suffix: ' min',
        label: { en: 'Saved per visit', fr: 'Économisées / visite' },
    },
    {
        value: 4.9,
        suffix: '/5',
        label: { en: 'Doctor rating', fr: 'Note médecin' },
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
        title: { en: 'Onboard in minutes', fr: 'Démarrez en minutes' },
        body: {
            en: 'Import patients via CSV or start fresh. Invite your team with role-based access in three clicks.',
            fr: 'Importez vos patients en CSV ou démarrez à zéro. Invitez votre équipe en trois clics.',
        },
    },
    {
        n: '02',
        icon: Activity,
        title: { en: 'Run your day', fr: 'Pilotez votre journée' },
        body: {
            en: 'Walk-ins, appointments, SOAP notes, prescriptions, payments — every gesture in one place.',
            fr: 'Sans RDV, consultations, ordonnances, paiements — tous les gestes au même endroit.',
        },
    },
    {
        n: '03',
        icon: BarChart3,
        title: { en: 'Grow with insight', fr: 'Grandissez avec data' },
        body: {
            en: 'Real-time KPIs, aging reports, no-show analysis, revenue trends. Decisions backed by facts.',
            fr: 'KPIs en temps réel, créances, no-shows, tendances de revenus. Décidez sur des faits.',
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
        name: { en: 'Starter', fr: 'Starter' },
        price: '290',
        period: { en: '/month', fr: '/mois' },
        blurb: {
            en: 'For solo practitioners getting their first clinic online.',
            fr: 'Pour les praticiens solo qui démarrent.',
        },
        cta: { en: 'Start free trial', fr: 'Essai gratuit' },
        features: [
            { en: '1 doctor · 1 branch', fr: '1 médecin · 1 cabinet' },
            { en: 'Up to 500 patients', fr: 'Jusqu’à 500 patients' },
            { en: 'WhatsApp confirmations', fr: 'Confirmations WhatsApp' },
            { en: 'Email support', fr: 'Support email' },
        ],
    },
    {
        name: { en: 'Professional', fr: 'Professionnel' },
        price: '890',
        period: { en: '/month', fr: '/mois' },
        blurb: {
            en: 'Multi-doctor, multi-branch, with full clinical + billing workflows.',
            fr: 'Multi-médecins, multi-sites, workflows cliniques + facturation complets.',
        },
        cta: { en: 'Get started', fr: 'Commencer' },
        features: [
            {
                en: 'Up to 15 staff · 3 branches',
                fr: 'Jusqu’à 15 utilisateurs · 3 cabinets',
            },
            { en: 'Unlimited patients', fr: 'Patients illimités' },
            {
                en: 'Lab integrations · Inventory',
                fr: 'Intégrations labo · Stock',
            },
            { en: 'Reports + activity audit', fr: 'Rapports + audit' },
            { en: 'Priority support', fr: 'Support prioritaire' },
        ],
        featured: true,
    },
    {
        name: { en: 'Enterprise', fr: 'Enterprise' },
        price: '2,400',
        period: { en: '/month', fr: '/mois' },
        blurb: {
            en: 'Group practices, hospitals, custom integrations, dedicated success.',
            fr: 'Groupes, hôpitaux, intégrations sur mesure, accompagnement dédié.',
        },
        cta: { en: 'Talk to sales', fr: 'Parler à un commercial' },
        features: [
            {
                en: 'Unlimited staff + branches',
                fr: 'Utilisateurs et cabinets illimités',
            },
            { en: 'SSO · Custom roles', fr: 'SSO · Rôles personnalisés' },
            { en: 'HL7 / FHIR connectors', fr: 'Connecteurs HL7 / FHIR' },
            { en: 'Dedicated CSM', fr: 'Customer Success dédié' },
            { en: '99.95% SLA', fr: 'SLA 99,95%' },
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
        },
        name: 'Dr. Karim Lahlou',
        role: {
            en: 'Cardiologist · Cabinet Dr. Lahlou, Casablanca',
            fr: 'Cardiologue · Cabinet Dr. Lahlou, Casablanca',
        },
        initials: 'KL',
        avatarTone: 'navy',
    },
    {
        quote: {
            en: '"Patients confirm their appointments before I even arrive in the morning. WhatsApp delivery rate sits above 90%."',
            fr: '« Les patients confirment leurs rendez-vous avant même mon arrivée au cabinet. Le taux de livraison WhatsApp dépasse les 90 %. »',
        },
        name: 'Salma Idrissi',
        role: {
            en: 'Practice Manager · Polyclinique Atlas, Rabat',
            fr: 'Gérante · Polyclinique Atlas, Rabat',
        },
        initials: 'SI',
        avatarTone: 'olive',
    },
    {
        quote: {
            en: '"Closing the books used to take two days. Now it’s one click. The aging report alone paid for the year of subscription."',
            fr: '« La clôture comptable prenait deux jours. Désormais : un clic. Le rapport des créances a remboursé l’abonnement annuel. »',
        },
        name: 'Omar Tazi',
        role: {
            en: 'Accountant · Clinique Bennani, Marrakech',
            fr: 'Comptable · Clinique Bennani, Marrakech',
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
        },
        old: {
            en: 'Call 18 patients yourself',
            fr: 'Appeler 18 patients vous-même',
        },
        blueDome: {
            en: 'WhatsApp template, 1 click',
            fr: 'Modèle WhatsApp, 1 clic',
        },
    },
    {
        label: { en: 'Multi-doctor calendar', fr: 'Calendrier multi-médecins' },
        old: {
            en: 'Three notebooks, one secretary',
            fr: 'Trois cahiers, une secrétaire',
        },
        blueDome: {
            en: 'Unified view, conflict alerts',
            fr: 'Vue unifiée, alertes de conflits',
        },
    },
    {
        label: {
            en: 'Close the day’s cash drawer',
            fr: 'Clôturer la caisse du jour',
        },
        old: {
            en: 'Excel + receipts + prayer',
            fr: 'Excel + reçus + une prière',
        },
        blueDome: {
            en: 'Reconciled to the dirham',
            fr: 'Réconcilié au dirham près',
        },
    },
    {
        label: { en: 'Send a prescription', fr: 'Envoyer une ordonnance' },
        old: {
            en: 'Photo + personal WhatsApp',
            fr: 'Photo + WhatsApp personnel',
        },
        blueDome: {
            en: 'Branded PDF over Cloud API',
            fr: 'PDF signé via Cloud API',
        },
    },
    {
        label: {
            en: 'Aging report on overdue bills',
            fr: 'Créances en retard',
        },
        old: {
            en: 'Two days, headache, regret',
            fr: 'Deux jours, mal de tête, regret',
        },
        blueDome: {
            en: 'Real-time, bucketed by age',
            fr: 'Temps réel, par tranche d’âge',
        },
    },
    {
        label: {
            en: 'Hand off to next secretary',
            fr: 'Transmettre à la secrétaire suivante',
        },
        old: { en: 'A Post-it', fr: 'Un Post-it' },
        blueDome: {
            en: 'Activity log, every change',
            fr: 'Journal d’audit, chaque action',
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
        category: { en: 'Messaging', fr: 'Messagerie' },
        status: 'live',
        initial: 'W',
        tint: 'emerald',
    },
    {
        name: 'Meta Business Suite',
        category: { en: 'Messaging', fr: 'Messagerie' },
        status: 'live',
        initial: 'M',
        tint: 'sky',
    },
    {
        name: 'CMI Maroc',
        category: { en: 'Payments', fr: 'Paiements' },
        status: 'live',
        initial: 'C',
        tint: 'navy',
    },
    {
        name: 'Stripe',
        category: { en: 'Payments', fr: 'Paiements' },
        status: 'beta',
        initial: 'S',
        tint: 'olive',
    },
    {
        name: 'Lab Biocenter',
        category: { en: 'Lab orders', fr: 'Analyses' },
        status: 'live',
        initial: 'B',
        tint: 'amber',
    },
    {
        name: 'Pasteur Maroc',
        category: { en: 'Lab orders', fr: 'Analyses' },
        status: 'live',
        initial: 'P',
        tint: 'rose',
    },
    {
        name: 'CNSS',
        category: { en: 'Insurance', fr: 'Assurance' },
        status: 'live',
        initial: 'N',
        tint: 'navy',
    },
    {
        name: 'CNOPS',
        category: { en: 'Insurance', fr: 'Assurance' },
        status: 'live',
        initial: 'O',
        tint: 'olive',
    },
    {
        name: 'HL7 / FHIR',
        category: { en: 'Interop', fr: 'Interopérabilité' },
        status: 'beta',
        initial: 'H',
        tint: 'amber',
    },
    {
        name: 'Google Calendar',
        category: { en: 'Calendar', fr: 'Calendrier' },
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
        title: { en: 'GDPR · Law 09-08', fr: 'GDPR · Loi 09-08' },
        description: {
            en: 'Patient data residency in EU and Morocco-compliant data centers, with clinic-scoped row-level security.',
            fr: 'Hébergement patient en centres conformes UE et Maroc, isolation par cabinet via RLS.',
        },
        icon: 'shield',
    },
    {
        title: { en: 'Encrypted end-to-end', fr: 'Chiffré bout en bout' },
        description: {
            en: 'AES-256 at rest, TLS 1.3 in transit. Two-factor secrets and access tokens stored separately.',
            fr: 'AES-256 au repos, TLS 1.3 en transit. Secrets 2FA et tokens isolés.',
        },
        icon: 'lock',
    },
    {
        title: { en: '2FA · WebAuthn ready', fr: '2FA · WebAuthn ready' },
        description: {
            en: 'TOTP today, hardware keys and passkeys on Enterprise. Recovery codes always available.',
            fr: 'TOTP aujourd’hui, clés matérielles et passkeys en Enterprise. Codes de récupération inclus.',
        },
        icon: 'key',
    },
    {
        title: {
            en: 'Daily encrypted backups',
            fr: 'Sauvegardes chiffrées quotidiennes',
        },
        description: {
            en: 'Point-in-time recovery over 30 days. Tested monthly. Exportable to your own S3 on Enterprise.',
            fr: 'Restauration ponctuelle sur 30 jours. Testée mensuellement. Export S3 dédié en Enterprise.',
        },
        icon: 'database',
    },
    {
        title: { en: 'ISO 27001 — in progress', fr: 'ISO 27001 — en cours' },
        description: {
            en: 'Audit kicked off Q2 2026. SOC 2 Type II planned for early 2027.',
            fr: 'Audit lancé T2 2026. SOC 2 Type II prévu début 2027.',
        },
        icon: 'flag',
    },
    {
        title: { en: 'Full activity audit', fr: 'Audit complet des actions' },
        description: {
            en: 'Every clinical, financial and admin action is logged with actor, timestamp, before/after — for years.',
            fr: 'Chaque action est tracée avec auteur, horodatage, avant/après — sur des années.',
        },
        icon: 'eye',
    },
];

export const FAQ: { q: LangPair; a: LangPair }[] = [
    {
        q: {
            en: 'How long does the migration take?',
            fr: 'Combien de temps prend la migration ?',
        },
        a: {
            en: 'Most clinics are live in under a week. We import your patient list, set up your branches and users, and walk you through your first day on the platform — included in every plan.',
            fr: 'La plupart des cabinets sont opérationnels en moins d’une semaine. Nous importons vos patients, configurons vos cabinets et utilisateurs, et vous accompagnons sur votre premier jour — inclus dans tous les plans.',
        },
    },
    {
        q: {
            en: 'Is patient data stored in Morocco?',
            fr: 'Les données patients sont-elles hébergées au Maroc ?',
        },
        a: {
            en: 'Yes. All clinical data is hosted on EU and Morocco-compliant infrastructure, encrypted at rest, and isolated per clinic with Postgres row-level security. GDPR and Law 09-08 compliant.',
            fr: 'Oui. Toutes les données cliniques sont hébergées sur une infrastructure conforme UE/Maroc, chiffrées au repos, et isolées par cabinet via RLS Postgres. Conformes GDPR et Loi 09-08.',
        },
    },
    {
        q: {
            en: 'Can my secretaries and doctors use it in Arabic?',
            fr: 'Mes secrétaires et médecins peuvent-ils l’utiliser en arabe ?',
        },
        a: {
            en: 'Yes. Every interface, document and patient message supports English, French, and Arabic — with full right-to-left rendering. Switch per user, per document, or per patient.',
            fr: 'Oui. Toute l’interface, les documents et messages patients supportent l’anglais, le français et l’arabe — avec RTL complet. Changement par utilisateur, document ou patient.',
        },
    },
    {
        q: {
            en: 'What happens to my data if I cancel?',
            fr: 'Que devient mes données si j’annule ?',
        },
        a: {
            en: 'You own your data. Export everything to CSV or PDF at any time. After cancellation we keep your data available for 60 days, then permanently delete it.',
            fr: 'Vous restez propriétaire de vos données. Exportez tout en CSV ou PDF à tout moment. Après annulation nous conservons les données 60 jours, puis suppression définitive.',
        },
    },
    {
        q: {
            en: 'Does the WhatsApp integration require my own Cloud API account?',
            fr: 'L’intégration WhatsApp nécessite-t-elle mon propre compte Cloud API ?',
        },
        a: {
            en: 'Either works. Use the bundled Blue Dome number on Starter and Professional, or bring your own Meta Business account on Enterprise for fully white-labelled patient messaging.',
            fr: 'Au choix. Utilisez le numéro Blue Dome sur Starter et Professionnel, ou apportez votre compte Meta Business sur Enterprise pour une messagerie patient entièrement personnalisée.',
        },
    },
    {
        q: {
            en: 'How do you handle insurance, partial payments and refunds?',
            fr: 'Comment gérez-vous l’assurance, les paiements partiels et les remboursements ?',
        },
        a: {
            en: 'Every invoice supports mixed payments (cash + insurance + card), aging analysis, partial payment tracking, and refunds. Default workflows match Moroccan CNSS, CNOPS, and private insurer conventions.',
            fr: 'Chaque facture gère les paiements mixtes (espèces + assurance + carte), l’analyse des créances, les paiements partiels et les remboursements. Workflows par défaut compatibles CNSS, CNOPS et assureurs privés.',
        },
    },
];
