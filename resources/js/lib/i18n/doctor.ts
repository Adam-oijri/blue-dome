// TRANSIENT — replace with usePage().props.translations in phase 2.
// Source of truth: .claude/frontend/frontend doctor/i18n.js

export type DoctorLang = 'en' | 'fr' | 'ar';

export type DoctorDictionary = {
    dir: 'ltr' | 'rtl';
    brand: string;
    brand_sub: string;

    nav_main: string;
    nav_clinical: string;
    nav_admin: string;
    dashboard: string;
    appointments: string;
    patients: string;
    consultations: string;
    prescriptions: string;
    lab_orders: string;
    invoices: string;
    inventory: string;
    staff: string;
    settings: string;
    follow_up: string;
    confirmations: string;
    no_appointments: string;
    all_confirmed: string;

    search_placeholder: string;
    new_appointment: string;

    good_morning: string;
    today_summary: string;
    todays_patients: string;
    pending_confirmations: string;
    revenue_today: string;
    waiting_room: string;
    todays_schedule: string;
    view_calendar: string;
    upcoming: string;
    in_progress: string;
    completed: string;
    no_show: string;
    quick_actions: string;
    recent_patients: string;
    notifications: string;
    waiting: string;
    confirmed: string;
    pending: string;
    arrived: string;
    cancelled: string;

    patient_id: string;
    age: string;
    blood_type: string;
    gender: string;
    phone: string;
    insurance: string;
    last_visit: string;
    overview: string;
    medical_history: string;
    visits: string;
    rx: string;
    labs: string;
    billing: string;
    vital_signs: string;
    allergies: string;
    chronic_diseases: string;
    current_meds: string;
    family_history: string;
    surgical_history: string;

    week: string;
    day: string;
    month: string;
    today: string;

    new_rx: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    save_send: string;

    male: string;
    female: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    settings_appearance_title: string;
    settings_appearance_help: string;
};

const en: DoctorDictionary = {
    dir: 'ltr',
    brand: 'BLUE DOME',
    brand_sub: 'Clinic Suite',
    nav_main: 'Workspace',
    nav_clinical: 'Clinical',
    nav_admin: 'Administration',
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    patients: 'Patients',
    consultations: 'Consultations',
    prescriptions: 'Prescriptions',
    lab_orders: 'Lab Orders',
    invoices: 'Invoices',
    inventory: 'Inventory',
    staff: 'Staff & Branches',
    settings: 'Settings',
    follow_up: 'Follow-up Calls',
    confirmations: 'Confirmations',
    no_appointments: 'No appointments',
    all_confirmed: 'All upcoming appointments are confirmed',
    search_placeholder: 'Search patients, appointments, prescriptions…',
    new_appointment: 'New appointment',
    good_morning: 'Good morning, Dr. Lahlou',
    today_summary: "Here's your day at a glance — Tuesday, May 5, 2026",
    todays_patients: "Today's patients",
    pending_confirmations: 'Pending confirmations',
    revenue_today: 'Revenue today',
    waiting_room: 'In waiting room',
    todays_schedule: "Today's schedule",
    view_calendar: 'View calendar',
    upcoming: 'Upcoming',
    in_progress: 'In progress',
    completed: 'Completed',
    no_show: 'No show',
    quick_actions: 'Quick actions',
    recent_patients: 'Recent patients',
    notifications: 'Notifications',
    waiting: 'Waiting',
    confirmed: 'Confirmed',
    pending: 'Pending',
    arrived: 'Arrived',
    cancelled: 'Cancelled',
    patient_id: 'Patient ID',
    age: 'Age',
    blood_type: 'Blood type',
    gender: 'Gender',
    phone: 'Phone',
    insurance: 'Insurance',
    last_visit: 'Last visit',
    overview: 'Overview',
    medical_history: 'Medical history',
    visits: 'Visits',
    rx: 'Prescriptions',
    labs: 'Lab results',
    billing: 'Billing',
    vital_signs: 'Vital signs',
    allergies: 'Allergies',
    chronic_diseases: 'Chronic conditions',
    current_meds: 'Current medications',
    family_history: 'Family history',
    surgical_history: 'Surgical history',
    week: 'Week',
    day: 'Day',
    month: 'Month',
    today: 'Today',
    new_rx: 'New prescription',
    medication: 'Medication',
    dosage: 'Dosage',
    frequency: 'Frequency',
    duration: 'Duration',
    save_send: 'Save & send via WhatsApp',
    male: 'Male',
    female: 'Female',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
    settings_appearance_title: 'Appearance',
    settings_appearance_help:
        'Choose how the interface looks. Applies everywhere.',
};

const fr: DoctorDictionary = {
    dir: 'ltr',
    brand: 'BLUE DOME',
    brand_sub: 'Suite Clinique',
    nav_main: 'Espace de travail',
    nav_clinical: 'Clinique',
    nav_admin: 'Administration',
    dashboard: 'Tableau de bord',
    appointments: 'Rendez-vous',
    patients: 'Patients',
    consultations: 'Consultations',
    prescriptions: 'Ordonnances',
    lab_orders: 'Analyses',
    invoices: 'Factures',
    inventory: 'Inventaire',
    staff: 'Personnel & Filiales',
    settings: 'Paramètres',
    follow_up: 'Appels de suivi',
    confirmations: 'Confirmations',
    no_appointments: 'Aucun rendez-vous',
    all_confirmed: 'Tous les rendez-vous à venir sont confirmés',
    search_placeholder: 'Rechercher patients, rendez-vous, ordonnances…',
    new_appointment: 'Nouveau rendez-vous',
    good_morning: 'Bonjour, Dr Lahlou',
    today_summary: 'Voici votre journée — Mardi 5 mai 2026',
    todays_patients: 'Patients du jour',
    pending_confirmations: 'Confirmations en attente',
    revenue_today: 'Revenu du jour',
    waiting_room: "En salle d'attente",
    todays_schedule: 'Programme du jour',
    view_calendar: 'Voir le calendrier',
    upcoming: 'À venir',
    in_progress: 'En cours',
    completed: 'Terminé',
    no_show: 'Absent',
    quick_actions: 'Actions rapides',
    recent_patients: 'Patients récents',
    notifications: 'Notifications',
    waiting: 'En attente',
    confirmed: 'Confirmé',
    pending: 'En attente',
    arrived: 'Arrivé',
    cancelled: 'Annulé',
    patient_id: 'ID patient',
    age: 'Âge',
    blood_type: 'Groupe sanguin',
    gender: 'Sexe',
    phone: 'Téléphone',
    insurance: 'Assurance',
    last_visit: 'Dernière visite',
    overview: 'Aperçu',
    medical_history: 'Antécédents',
    visits: 'Visites',
    rx: 'Ordonnances',
    labs: 'Résultats labo',
    billing: 'Facturation',
    vital_signs: 'Signes vitaux',
    allergies: 'Allergies',
    chronic_diseases: 'Maladies chroniques',
    current_meds: 'Médicaments actuels',
    family_history: 'Antécédents familiaux',
    surgical_history: 'Antécédents chirurgicaux',
    week: 'Semaine',
    day: 'Jour',
    month: 'Mois',
    today: "Aujourd'hui",
    new_rx: 'Nouvelle ordonnance',
    medication: 'Médicament',
    dosage: 'Posologie',
    frequency: 'Fréquence',
    duration: 'Durée',
    save_send: 'Enregistrer & envoyer via WhatsApp',
    male: 'Homme',
    female: 'Femme',
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
    sunday: 'Dim',
    settings_appearance_title: 'Apparence',
    settings_appearance_help:
        "Choisissez l'apparence de l'interface. S'applique partout.",
};

const ar: DoctorDictionary = {
    dir: 'rtl',
    brand: 'بلو دوم',
    brand_sub: 'إدارة العيادة',
    nav_main: 'مساحة العمل',
    nav_clinical: 'الطب السريري',
    nav_admin: 'الإدارة',
    dashboard: 'لوحة التحكم',
    appointments: 'المواعيد',
    patients: 'المرضى',
    consultations: 'الاستشارات',
    prescriptions: 'الوصفات الطبية',
    lab_orders: 'التحاليل المخبرية',
    invoices: 'الفواتير',
    inventory: 'المخزون',
    staff: 'الموظفون والفروع',
    settings: 'الإعدادات',
    follow_up: 'مكالمات المتابعة',
    confirmations: 'التأكيدات',
    no_appointments: 'لا توجد مواعيد',
    all_confirmed: 'جميع المواعيد القادمة مؤكدة',
    search_placeholder: 'ابحث عن مرضى، مواعيد، وصفات...',
    new_appointment: 'موعد جديد',
    good_morning: 'صباح الخير، د. اللهلو',
    today_summary: 'هذه نظرة على يومك — الثلاثاء 5 ماي 2026',
    todays_patients: 'مرضى اليوم',
    pending_confirmations: 'تأكيدات معلقة',
    revenue_today: 'إيرادات اليوم',
    waiting_room: 'في غرفة الانتظار',
    todays_schedule: 'جدول اليوم',
    view_calendar: 'عرض التقويم',
    upcoming: 'قادم',
    in_progress: 'جاري',
    completed: 'مكتمل',
    no_show: 'لم يحضر',
    quick_actions: 'إجراءات سريعة',
    recent_patients: 'المرضى الأخيرون',
    notifications: 'الإشعارات',
    waiting: 'في الانتظار',
    confirmed: 'مؤكد',
    pending: 'معلق',
    arrived: 'وصل',
    cancelled: 'ملغى',
    patient_id: 'رقم المريض',
    age: 'العمر',
    blood_type: 'فصيلة الدم',
    gender: 'الجنس',
    phone: 'الهاتف',
    insurance: 'التأمين',
    last_visit: 'آخر زيارة',
    overview: 'نظرة عامة',
    medical_history: 'التاريخ الطبي',
    visits: 'الزيارات',
    rx: 'الوصفات',
    labs: 'نتائج التحاليل',
    billing: 'الفواتير',
    vital_signs: 'العلامات الحيوية',
    allergies: 'الحساسية',
    chronic_diseases: 'الأمراض المزمنة',
    current_meds: 'الأدوية الحالية',
    family_history: 'التاريخ العائلي',
    surgical_history: 'التاريخ الجراحي',
    week: 'أسبوع',
    day: 'يوم',
    month: 'شهر',
    today: 'اليوم',
    new_rx: 'وصفة جديدة',
    medication: 'الدواء',
    dosage: 'الجرعة',
    frequency: 'التكرار',
    duration: 'المدة',
    save_send: 'حفظ وإرسال عبر واتساب',
    male: 'ذكر',
    female: 'أنثى',
    monday: 'اثن',
    tuesday: 'ثلا',
    wednesday: 'أرب',
    thursday: 'خمي',
    friday: 'جمع',
    saturday: 'سبت',
    sunday: 'أحد',
    settings_appearance_title: 'المظهر',
    settings_appearance_help: 'اختر شكل الواجهة. يُطبَّق في كل مكان.',
};

export const DOCTOR_I18N: Record<DoctorLang, DoctorDictionary> = { en, fr, ar };

export function useDoctorT(lang: DoctorLang): DoctorDictionary {
    return DOCTOR_I18N[lang];
}
