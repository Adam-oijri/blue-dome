// TRANSIENT — replace with Inertia props in phase 2.
// Source of truth: .claude/frontend/frontend doctor/data.js

import type { DoctorLang } from '@/lib/i18n/doctor';

export type Multilingual = Record<DoctorLang, string>;

export type DoctorProfile = {
    first: string;
    last: string;
    specialty: string;
    license: string;
};

export type AppointmentStatus =
    | 'completed'
    | 'in_progress'
    | 'arrived'
    | 'confirmed'
    | 'pending'
    | 'cancelled';

export type ScheduleEntry = {
    time: string;
    duration: string;
    name: Multilingual;
    reason: Multilingual;
    status: AppointmentStatus;
    type: 'consultation' | 'follow_up';
};

export type PatientFlag = '' | 'new' | 'chronic';

export type PatientRecord = {
    id: string;
    name: Multilingual;
    age: number;
    gender: 'male' | 'female';
    blood: string;
    phone: string;
    last_visit: string;
    insurance: string;
    flag: PatientFlag;
};

export type KpiTrendIcon = 'users' | 'msg' | 'coin' | 'clock';
export type KpiTone = '' | 'warn' | 'olive' | 'success';

export type KpiEntry = {
    label: string;
    value: string;
    trend: string;
    icon: KpiTrendIcon;
    color: KpiTone;
};

export const DOCTOR_MOCK: {
    doctor: DoctorProfile;
    kpis: Record<DoctorLang, KpiEntry[]>;
    schedule: ScheduleEntry[];
    patients: PatientRecord[];
} = {
    doctor: {
        first: 'Karim',
        last: 'Lahlou',
        specialty: 'Cardiology',
        license: 'MA-CD-1842',
    },

    kpis: {
        en: [
            {
                label: "Today's patients",
                value: '14',
                trend: '+3 vs avg',
                icon: 'users',
                color: '',
            },
            {
                label: 'Pending confirmations',
                value: '5',
                trend: 'WhatsApp sent',
                icon: 'msg',
                color: 'warn',
            },
            {
                label: 'Revenue today',
                value: '4,820 MAD',
                trend: '+12% vs Mon',
                icon: 'coin',
                color: 'olive',
            },
            {
                label: 'In waiting room',
                value: '3',
                trend: 'Avg wait 8 min',
                icon: 'clock',
                color: 'success',
            },
        ],
        fr: [
            {
                label: 'Patients du jour',
                value: '14',
                trend: '+3 vs moyenne',
                icon: 'users',
                color: '',
            },
            {
                label: 'Confirmations en attente',
                value: '5',
                trend: 'WhatsApp envoyé',
                icon: 'msg',
                color: 'warn',
            },
            {
                label: 'Revenu du jour',
                value: '4 820 MAD',
                trend: '+12% vs Lun',
                icon: 'coin',
                color: 'olive',
            },
            {
                label: "En salle d'attente",
                value: '3',
                trend: 'Attente moy. 8 min',
                icon: 'clock',
                color: 'success',
            },
        ],
        ar: [
            {
                label: 'مرضى اليوم',
                value: '١٤',
                trend: '+٣ عن المعدل',
                icon: 'users',
                color: '',
            },
            {
                label: 'تأكيدات معلقة',
                value: '٥',
                trend: 'تم إرسال واتساب',
                icon: 'msg',
                color: 'warn',
            },
            {
                label: 'إيرادات اليوم',
                value: '٤٬٨٢٠ درهم',
                trend: '+١٢٪ عن الإثنين',
                icon: 'coin',
                color: 'olive',
            },
            {
                label: 'في الانتظار',
                value: '٣',
                trend: 'متوسط الانتظار ٨ د',
                icon: 'clock',
                color: 'success',
            },
        ],
    },

    schedule: [
        {
            time: '08:30',
            duration: '30m',
            name: {
                en: 'Hassan El Amrani',
                fr: 'Hassan El Amrani',
                ar: 'حسن العمراني',
            },
            reason: {
                en: 'Follow-up — Hypertension',
                fr: 'Suivi — Hypertension',
                ar: 'متابعة — ارتفاع ضغط الدم',
            },
            status: 'completed',
            type: 'follow_up',
        },
        {
            time: '09:00',
            duration: '30m',
            name: {
                en: 'Fatima Bennani',
                fr: 'Fatima Bennani',
                ar: 'فاطمة بناني',
            },
            reason: {
                en: 'Echocardiogram review',
                fr: 'Examen échocardiogramme',
                ar: 'مراجعة تخطيط صدى القلب',
            },
            status: 'completed',
            type: 'consultation',
        },
        {
            time: '09:45',
            duration: '45m',
            name: { en: 'Youssef Tazi', fr: 'Youssef Tazi', ar: 'يوسف التازي' },
            reason: {
                en: 'Initial consultation — Chest pain',
                fr: 'Consultation initiale — Douleur thoracique',
                ar: 'استشارة أولى — ألم صدري',
            },
            status: 'in_progress',
            type: 'consultation',
        },
        {
            time: '10:30',
            duration: '30m',
            name: {
                en: 'Aicha Berrada',
                fr: 'Aicha Berrada',
                ar: 'عائشة برادة',
            },
            reason: {
                en: 'Follow-up — Arrhythmia',
                fr: 'Suivi — Arythmie',
                ar: 'متابعة — اضطراب نظم القلب',
            },
            status: 'arrived',
            type: 'follow_up',
        },
        {
            time: '11:00',
            duration: '30m',
            name: { en: 'Mehdi Saidi', fr: 'Mehdi Saidi', ar: 'مهدي سعيدي' },
            reason: {
                en: 'Pre-op cardiac assessment',
                fr: 'Bilan cardiaque pré-op',
                ar: 'تقييم القلب قبل العملية',
            },
            status: 'confirmed',
            type: 'consultation',
        },
        {
            time: '11:30',
            duration: '30m',
            name: {
                en: 'Salma Idrissi',
                fr: 'Salma Idrissi',
                ar: 'سلمى الإدريسي',
            },
            reason: {
                en: 'Lab results review',
                fr: 'Examen résultats labo',
                ar: 'مراجعة نتائج التحاليل',
            },
            status: 'confirmed',
            type: 'follow_up',
        },
        {
            time: '14:00',
            duration: '30m',
            name: {
                en: 'Omar Chraibi',
                fr: 'Omar Chraibi',
                ar: 'عمر الشرايبي',
            },
            reason: {
                en: 'ECG review',
                fr: 'Examen ECG',
                ar: 'مراجعة تخطيط القلب',
            },
            status: 'pending',
            type: 'consultation',
        },
        {
            time: '14:30',
            duration: '60m',
            name: {
                en: 'Latifa Ouazzani',
                fr: 'Latifa Ouazzani',
                ar: 'لطيفة الوزاني',
            },
            reason: {
                en: 'Stress test + consultation',
                fr: "Test d'effort + consultation",
                ar: 'اختبار الإجهاد + استشارة',
            },
            status: 'pending',
            type: 'consultation',
        },
        {
            time: '15:30',
            duration: '30m',
            name: { en: 'Karim Sabri', fr: 'Karim Sabri', ar: 'كريم الصبري' },
            reason: {
                en: 'Hypertension follow-up',
                fr: 'Suivi hypertension',
                ar: 'متابعة ارتفاع ضغط الدم',
            },
            status: 'pending',
            type: 'follow_up',
        },
        {
            time: '16:00',
            duration: '30m',
            name: {
                en: 'Nadia Filali',
                fr: 'Nadia Filali',
                ar: 'نادية الفيلالي',
            },
            reason: {
                en: 'Heart palpitations',
                fr: 'Palpitations cardiaques',
                ar: 'خفقان القلب',
            },
            status: 'pending',
            type: 'consultation',
        },
    ],

    patients: [
        {
            id: 'P-002841',
            name: {
                en: 'Hassan El Amrani',
                fr: 'Hassan El Amrani',
                ar: 'حسن العمراني',
            },
            age: 58,
            gender: 'male',
            blood: 'A+',
            phone: '+212 6 61 23 45 67',
            last_visit: '2026-05-05',
            insurance: 'CNSS',
            flag: 'chronic',
        },
        {
            id: 'P-002892',
            name: {
                en: 'Fatima Bennani',
                fr: 'Fatima Bennani',
                ar: 'فاطمة بناني',
            },
            age: 64,
            gender: 'female',
            blood: 'O-',
            phone: '+212 6 62 11 88 23',
            last_visit: '2026-05-05',
            insurance: 'CNOPS',
            flag: '',
        },
        {
            id: 'P-002910',
            name: { en: 'Youssef Tazi', fr: 'Youssef Tazi', ar: 'يوسف التازي' },
            age: 42,
            gender: 'male',
            blood: 'B+',
            phone: '+212 6 63 77 90 12',
            last_visit: '2026-05-05',
            insurance: 'Saham',
            flag: 'new',
        },
        {
            id: 'P-002654',
            name: {
                en: 'Aicha Berrada',
                fr: 'Aicha Berrada',
                ar: 'عائشة برادة',
            },
            age: 51,
            gender: 'female',
            blood: 'AB+',
            phone: '+212 6 64 32 11 09',
            last_visit: '2026-04-22',
            insurance: 'AXA',
            flag: '',
        },
        {
            id: 'P-002777',
            name: { en: 'Mehdi Saidi', fr: 'Mehdi Saidi', ar: 'مهدي سعيدي' },
            age: 67,
            gender: 'male',
            blood: 'A-',
            phone: '+212 6 65 44 55 66',
            last_visit: '2026-04-15',
            insurance: 'CNSS',
            flag: 'chronic',
        },
        {
            id: 'P-002801',
            name: {
                en: 'Salma Idrissi',
                fr: 'Salma Idrissi',
                ar: 'سلمى الإدريسي',
            },
            age: 38,
            gender: 'female',
            blood: 'O+',
            phone: '+212 6 66 18 27 36',
            last_visit: '2026-04-29',
            insurance: 'Wafa',
            flag: '',
        },
        {
            id: 'P-002715',
            name: {
                en: 'Omar Chraibi',
                fr: 'Omar Chraibi',
                ar: 'عمر الشرايبي',
            },
            age: 49,
            gender: 'male',
            blood: 'B-',
            phone: '+212 6 67 99 88 77',
            last_visit: '2026-03-30',
            insurance: 'CNOPS',
            flag: '',
        },
        {
            id: 'P-002688',
            name: {
                en: 'Latifa Ouazzani',
                fr: 'Latifa Ouazzani',
                ar: 'لطيفة الوزاني',
            },
            age: 56,
            gender: 'female',
            blood: 'A+',
            phone: '+212 6 68 12 34 56',
            last_visit: '2026-04-10',
            insurance: 'CNSS',
            flag: 'chronic',
        },
        {
            id: 'P-002923',
            name: { en: 'Karim Sabri', fr: 'Karim Sabri', ar: 'كريم الصبري' },
            age: 45,
            gender: 'male',
            blood: 'O+',
            phone: '+212 6 69 87 65 43',
            last_visit: '2026-04-25',
            insurance: 'Saham',
            flag: '',
        },
        {
            id: 'P-002901',
            name: {
                en: 'Nadia Filali',
                fr: 'Nadia Filali',
                ar: 'نادية الفيلالي',
            },
            age: 33,
            gender: 'female',
            blood: 'AB-',
            phone: '+212 6 60 11 22 33',
            last_visit: '2026-04-18',
            insurance: '—',
            flag: 'new',
        },
    ],
};
