// Mock data canon
window.DATA = {
  branches: [
    { id: "b1", key: "casa", main: true },
    { id: "b2", key: "rabat", main: false },
  ],

  doctors: [
    {
      id: "d1",
      en: "Dr. Karim Lahlou",
      fr: "Dr. Karim Lahlou",
      ar: "د. كريم لحلو",
      specialty_en: "Cardiology",
      specialty_fr: "Cardiologie",
      specialty_ar: "أمراض القلب",
      initials: "KL",
      branch: "b1",
      gender: "m",
      hue: "navy",
    },
    {
      id: "d2",
      en: "Dr. Salma Idrissi",
      fr: "Dr. Salma Idrissi",
      ar: "د. سلمى الإدريسي",
      specialty_en: "General practice",
      specialty_fr: "Médecine générale",
      specialty_ar: "طب عام",
      initials: "SI",
      branch: "b1",
      gender: "f",
      hue: "olive",
    },
    {
      id: "d3",
      en: "Dr. Mehdi Khalil",
      fr: "Dr. Mehdi Khalil",
      ar: "د. مهدي خليل",
      specialty_en: "Pediatrics",
      specialty_fr: "Pédiatrie",
      specialty_ar: "طب الأطفال",
      initials: "MK",
      branch: "b2",
      gender: "m",
      hue: "navy",
    },
  ],

  // 10 patients
  patients: [
    { id: "p1", en: "Hassan El Amrani",  fr: "Hassan El Amrani",  ar: "حسن العمراني",   initials: "HE", gender: "m", age: 58, blood: "A+",  chronic: true,  insurance: "CNSS" },
    { id: "p2", en: "Fatima Bennani",    fr: "Fatima Bennani",    ar: "فاطمة بناني",     initials: "FB", gender: "f", age: 42, blood: "O-",  chronic: false, insurance: "CNOPS" },
    { id: "p3", en: "Youssef Tazi",      fr: "Youssef Tazi",      ar: "يوسف التازي",     initials: "YT", gender: "m", age: 31, blood: "B+",  chronic: false, insurance: "Saham" },
    { id: "p4", en: "Aicha Berrada",     fr: "Aicha Berrada",     ar: "عائشة برادة",     initials: "AB", gender: "f", age: 67, blood: "A-",  chronic: true,  insurance: "CNSS" },
    { id: "p5", en: "Mehdi Saidi",       fr: "Mehdi Saidi",       ar: "مهدي السعيدي",    initials: "MS", gender: "m", age: 8,  blood: "O+",  chronic: false, insurance: "AXA" },
    { id: "p6", en: "Salma Idrissi",     fr: "Salma Idrissi",     ar: "سلمى الإدريسي",   initials: "SI", gender: "f", age: 29, blood: "AB+", chronic: false, insurance: "Wafa" },
    { id: "p7", en: "Omar Chraibi",      fr: "Omar Chraibi",      ar: "عمر الشرايبي",    initials: "OC", gender: "m", age: 45, blood: "B-",  chronic: false, insurance: "CNOPS" },
    { id: "p8", en: "Latifa Ouazzani",   fr: "Latifa Ouazzani",   ar: "لطيفة الوزاني",   initials: "LO", gender: "f", age: 53, blood: "O+",  chronic: true,  insurance: "CNSS" },
    { id: "p9", en: "Karim Sabri",       fr: "Karim Sabri",       ar: "كريم الصبري",     initials: "KS", gender: "m", age: 36, blood: "A+",  chronic: false, insurance: "Saham" },
    { id: "p10", en: "Nadia Filali",     fr: "Nadia Filali",      ar: "نادية الفيلالي",  initials: "NF", gender: "f", age: 24, blood: "O+",  chronic: false, insurance: "AXA" },
  ],

  // Waiting room — Casa branch — current time 11:14
  // status: arrived | with_nurse | in_room | ready_pay
  waitingRoom: [
    { patient: "p1", doctor: "d1", arrivedAt: "10:42", waitMin: 32, status: "arrived",      walkin: false, time: "10:50" },
    { patient: "p2", doctor: "d2", arrivedAt: "10:55", waitMin: 19, status: "in_room",      walkin: false, time: "11:00" },
    { patient: "p5", doctor: "d2", arrivedAt: "11:00", waitMin: 14, status: "with_nurse",   walkin: false, time: "11:15" },
    { patient: "p7", doctor: "d1", arrivedAt: "11:04", waitMin: 10, status: "arrived",      walkin: true,  time: "—"     },
    { patient: "p9", doctor: "d2", arrivedAt: "10:30", waitMin: 44, status: "ready_pay",    walkin: false, time: "10:30" },
    { patient: "p4", doctor: "d1", arrivedAt: "11:08", waitMin:  6, status: "arrived",      walkin: false, time: "11:30" },
  ],

  // Schedule blocks — Casa branch — Tue 5 May 2026
  // doctor, start (minutes from 8:00), duration min, status, patient
  // status: confirmed | pending | in_progress | completed | cancelled | break
  schedule: {
    d1: [ // Dr. Lahlou
      { start: 30,  dur: 30, status: "completed",   patient: "p10" },
      { start: 60,  dur: 30, status: "completed",   patient: "p3"  },
      { start: 90,  dur: 30, status: "completed",   patient: "p6"  },
      { start: 150, dur: 30, status: "completed",   patient: "p8"  },
      { start: 170, dur: 25, status: "in_progress", patient: "p1"  },
      { start: 210, dur: 30, status: "confirmed",   patient: "p4"  },
      { start: 240, dur: 30, status: "pending",     patient: "p7"  },
      { start: 300, dur: 60, status: "break"                       },
      { start: 360, dur: 30, status: "confirmed",   patient: "p9"  },
      { start: 420, dur: 30, status: "pending",     patient: "p2"  },
      { start: 480, dur: 30, status: "cancelled",   patient: "p5"  },
      { start: 540, dur: 30, status: "confirmed",   patient: "p3"  },
    ],
    d2: [ // Dr. Idrissi
      { start: 0,   dur: 30, status: "completed",   patient: "p4"  },
      { start: 30,  dur: 30, status: "completed",   patient: "p7"  },
      { start: 60,  dur: 30, status: "completed",   patient: "p9"  },
      { start: 90,  dur: 30, status: "completed",   patient: "p10" },
      { start: 150, dur: 30, status: "completed",   patient: "p3"  },
      { start: 180, dur: 30, status: "in_progress", patient: "p2"  },
      { start: 210, dur: 30, status: "confirmed",   patient: "p5"  },
      { start: 240, dur: 30, status: "confirmed",   patient: "p8"  },
      { start: 270, dur: 30, status: "pending",     patient: "p1"  },
      { start: 330, dur: 60, status: "break"                       },
      { start: 390, dur: 30, status: "confirmed",   patient: "p6"  },
      { start: 420, dur: 30, status: "confirmed",   patient: "p4"  },
      { start: 480, dur: 30, status: "pending",     patient: "p9"  },
      { start: 510, dur: 30, status: "confirmed",   patient: "p7"  },
    ],
  },

  // WhatsApp confirmations queue (for tomorrow's appointments)
  whatsapp: [
    { patient: "p1", doctor: "d1", apptTime: "09:00", status: "seen",      sentAt: "08:30", retries: 0 },
    { patient: "p4", doctor: "d2", apptTime: "09:30", status: "delivered", sentAt: "08:30", retries: 0 },
    { patient: "p7", doctor: "d1", apptTime: "10:00", status: "delivered", sentAt: "08:30", retries: 0 },
    { patient: "p2", doctor: "d2", apptTime: "10:30", status: "sent",      sentAt: "08:31", retries: 1 },
    { patient: "p9", doctor: "d1", apptTime: "11:00", status: "sent",      sentAt: "08:31", retries: 0 },
    { patient: "p5", doctor: "d2", apptTime: "11:30", status: "confirmed", sentAt: "08:30", retries: 0 },
    { patient: "p8", doctor: "d1", apptTime: "14:00", status: "failed",    sentAt: "08:32", retries: 2 },
    { patient: "p3", doctor: "d2", apptTime: "15:00", status: "delivered", sentAt: "08:32", retries: 0 },
    { patient: "p6", doctor: "d1", apptTime: "15:30", status: "seen",      sentAt: "08:32", retries: 0 },
    { patient: "p10",doctor: "d2", apptTime: "16:30", status: "failed",    sentAt: "08:33", retries: 3 },
  ],

  // KPI numbers
  kpis: {
    today: { value: 24, done: 9, left: 15 },
    pending: { value: 7 },
    walkins: { value: 3, avgMin: 12 },
    cash: { value: 2480, card: 1850, ins: 3200 },
    noshows: { value: 6, rate: 4.2 },
  },

  // Current time within schedule (minutes from 08:00)
  nowMin: 194, // 11:14
  nowLabel: "11:14",
};

// Helpers
window.D = {
  patient(id) {
 return window.DATA.patients.find(p => p.id === id); 
},
  doctor(id) {
 return window.DATA.doctors.find(d => d.id === id); 
},
  name(obj) {
    const lang = window.__LANG || "en";

    return obj[lang] || obj.en;
  },
  specialty(doc) {
    const lang = window.__LANG || "en";

    return doc["specialty_" + lang] || doc.specialty_en;
  },
  branchLabel(key) {
    return window.t("branch_" + key);
  },
  fmtMin(m) {
    const h = Math.floor(m / 60) + 8;
    const mm = m % 60;

    return String(h).padStart(2,"0") + ":" + String(mm).padStart(2,"0");
  },
};
