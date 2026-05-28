// Mock data canon for Cabinet Dr. Lahlou
window.DATA = (function () {
  const fmtMAD = (n) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);

  const doctors = [
    { id: "u1", name: "Dr. Karim Lahlou",    nameAr: "د. كريم لحلو",      sex: "m", specialty: { en: "Cardiology", fr: "Cardiologie", ar: "أمراض القلب" }, branch: "Casa",  completed: 142, util: 92, revenue: 184500, rating: 4.9 },
    { id: "u2", name: "Dr. Salma Idrissi",   nameAr: "د. سلمى الإدريسي",  sex: "f", specialty: { en: "General practice", fr: "Médecine générale", ar: "طب عام" }, branch: "Casa",  completed: 168, util: 85, revenue: 121200, rating: 4.7 },
    { id: "u3", name: "Dr. Mehdi Khalil",    nameAr: "د. مهدي خليل",      sex: "m", specialty: { en: "Pediatrics", fr: "Pédiatrie", ar: "طب الأطفال" },         branch: "Rabat", completed: 121, util: 74, revenue: 96800,  rating: 4.8 },
  ];

  const monthlyRevenue = [
    // [casa, rabat] in MAD per month, last 12
    [142000, 71000], [156000, 79000], [148000, 82000], [161000, 88000],
    [173000, 91000], [168000, 94000], [181000, 99000], [195000, 104000],
    [188000, 110000], [201000, 118000], [216000, 124000], [232000, 142000],
  ];
  const monthLabels = {
    en: ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"],
    fr: ["Juin","Juil","Aoû","Sep","Oct","Nov","Déc","Jan","Fév","Mar","Avr","Mai"],
    ar: ["يون","يول","غشت","شت","أكت","نون","دج","ينا","فبر","مار","أبر","ماي"],
  };

  const activity = [
    { who: "Dr. Karim Lahlou",   role: "doctor",     action: { en: "created prescription RX-2026-04812", fr: "a créé l'ordonnance RX-2026-04812", ar: "أنشأ الوصفة RX-2026-04812" }, t: 2 },
    { who: "Nadia Berrada",      role: "secretary",  action: { en: "registered new patient Aïcha Bennani", fr: "a inscrit la nouvelle patiente Aïcha Bennani", ar: "سجلت المريضة الجديدة عائشة بناني" }, t: 11 },
    { who: "Omar Tazi",          role: "accountant", action: { en: "marked invoice INV-04891 as paid · 1,200 MAD", fr: "a marqué la facture INV-04891 comme payée · 1 200 MAD", ar: "حدد الفاتورة INV-04891 كمدفوعة · 1.200 درهم" }, t: 23 },
    { who: "Dr. Salma Idrissi",  role: "doctor",     action: { en: "completed consultation for Youssef El Amrani", fr: "a terminé la consultation de Youssef El Amrani", ar: "أنهت استشارة يوسف العمراني" }, t: 38 },
    { who: "Yasmine Hilali",     role: "secretary",  action: { en: "rescheduled 3 appointments to May 7", fr: "a reporté 3 rendez-vous au 7 mai", ar: "أعادت جدولة 3 مواعيد إلى 7 ماي" }, t: 51 },
    { who: "System",             role: "admin",      action: { en: "WhatsApp delivery report — 87% seen", fr: "Rapport WhatsApp — 87 % lus", ar: "تقرير واتساب — 87% مقروءة" }, t: 67 },
    { who: "Houda Saidi",        role: "nurse",      action: { en: "logged inventory: Metformin 500mg low", fr: "a noté le stock : Metformine 500 mg bas", ar: "سجلت المخزون: ميتفورمين 500ملغ منخفض" }, t: 84 },
    { who: "Dr. Mehdi Khalil",   role: "doctor",     action: { en: "uploaded lab results for Imane Sebti", fr: "a téléchargé les résultats de labo d'Imane Sebti", ar: "حمّل نتائج المختبر لإيمان السبتي" }, t: 105 },
    { who: "Omar Tazi",          role: "accountant", action: { en: "exported P&L for April 2026", fr: "a exporté le P&L d'avril 2026", ar: "صدّر تقرير الأرباح والخسائر لأبريل 2026" }, t: 132 },
    { who: "Admin",              role: "admin",      action: { en: "invited Dr. Hicham Tazi to staff", fr: "a invité Dr. Hicham Tazi", ar: "دعا د. هشام التازي" }, t: 168 },
  ];

  const operations = [
    { name: "Dr. Karim Lahlou",   sex: "m", branch: "Casa",  scheduled: 14, arrived: 11, completed: 9,  noShow: 2, revenue: 9800 },
    { name: "Dr. Salma Idrissi",  sex: "f", branch: "Casa",  scheduled: 18, arrived: 16, completed: 14, noShow: 1, revenue: 7200 },
    { name: "Dr. Mehdi Khalil",   sex: "m", branch: "Rabat", scheduled: 12, arrived: 10, completed: 8,  noShow: 1, revenue: 5400 },
  ];

  return { doctors, monthlyRevenue, monthLabels, activity, operations, fmtMAD };
})();
