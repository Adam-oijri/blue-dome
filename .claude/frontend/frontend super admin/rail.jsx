// Right-rail cards: Subscription, Activity feed (audit_logs), Alerts

const Subscription = ({ t, lang }) => {
  return (
    <div className="sub-card">
      <div className="plan-row">
        <div className="plan">{t("sub_plan")}</div>
        <span className="badge">PLAN</span>
      </div>
      <div className="renew">{t("sub_renew")}</div>

      <div className="sub-meter">
        <div className="lbl"><span>{t("sub_seats")}</span><b className="tabular">7 / 15</b></div>
        <div className="bar dark"><span style={{ width: (7 / 15) * 100 + "%" }} /></div>
      </div>
      <div className="sub-meter">
        <div className="lbl"><span>{t("sub_storage")}</span><b className="tabular">340 / 2,000 MB</b></div>
        <div className="bar dark"><span style={{ width: (340 / 2000) * 100 + "%" }} /></div>
      </div>

      <button className="sub-cta">
        <Icon name="trending-up" size={15} /> {t("sub_upgrade")}
      </button>
    </div>
  );
};
window.Subscription = Subscription;

const roleAvatarClass = (role) => {
  switch (role) {
    case "doctor":     return "av-navy";
    case "secretary":  return "av-olive";
    case "nurse":      return "av-info";
    case "accountant": return "av-ink";
    case "admin":      return "av-warn";
    default:           return "av-ink";
  }
};

const relTime = (mins, lang) => {
  if (lang === "fr") {
    if (mins < 60) return "il y a " + mins + " min";
    const h = Math.floor(mins / 60);
    return "il y a " + h + " h";
  }
  if (lang === "ar") {
    if (mins < 60) return "منذ " + mins + " د";
    const h = Math.floor(mins / 60);
    return "منذ " + h + " س";
  }
  if (mins < 60) return mins + "m ago";
  const h = Math.floor(mins / 60);
  return h + "h ago";
};

const ActivityFeed = ({ t, lang }) => {
  const [chip, setChip] = React.useState("all");
  const items = window.DATA.activity;

  const filterMap = {
    doctor: "clinical", nurse: "clinical",
    accountant: "financial",
    admin: "admin", secretary: "admin",
  };
  const filtered = chip === "all" ? items : items.filter((it) => filterMap[it.role] === chip);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{t("activity_title")}</h2>
          <div className="meta">{t("activity_sub")}</div>
        </div>
      </div>
      <div style={{ padding: "10px 18px 8px" }}>
        <div className="chips">
          {[
            { id: "all", label: t("chip_all") },
            { id: "clinical", label: t("chip_clinical") },
            { id: "financial", label: t("chip_financial") },
            { id: "admin", label: t("chip_admin") },
          ].map((c) => (
            <button key={c.id} className={"chip " + (chip === c.id ? "on" : "")} onClick={() => setChip(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="feed" style={{ maxHeight: 380, overflowY: "auto" }}>
        {filtered.map((it, i) => (
          <div key={i} className="feed-item">
            <div className={"avatar av-32 " + roleAvatarClass(it.role)}>
              {initials(it.who === "System" ? "SY" : it.who === "Admin" ? "AD" : it.who)}
            </div>
            <div className="what">
              <b>{it.who}</b> {it.action[lang] || it.action.en}
            </div>
            <div className="when">{relTime(it.t, lang)}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 18px 14px", borderTop: "1px solid var(--border-2)" }}>
        <a href="#" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--navy-900)" }}>{t("activity_view_all")}</a>
      </div>
    </section>
  );
};
window.ActivityFeed = ActivityFeed;

const Alerts = ({ t, lang }) => {
  const items = [
    {
      tone: "danger", icon: "package",
      title: lang === "fr" ? "Stock critique — Metformine 500 mg"
            : lang === "ar" ? "مخزون حرج — ميتفورمين 500 ملغ"
            : "Inventory critical — Metformin 500mg",
      desc: lang === "fr" ? "8 unités · Casa · seuil 20" : lang === "ar" ? "8 وحدات · الدار البيضاء · الحد 20" : "8 units left · Casa · threshold 20",
      cta: lang === "fr" ? "Réapprovisionner" : lang === "ar" ? "إعادة التموين" : "Reorder",
    },
    {
      tone: "warn", icon: "receipt",
      title: lang === "fr" ? "Factures en retard" : lang === "ar" ? "فواتير متأخرة" : "Overdue invoices",
      desc: lang === "fr" ? "3 factures · 5 400 MAD" : lang === "ar" ? "3 فواتير · 5.400 درهم" : "3 invoices · 5,400 MAD",
      cta: lang === "fr" ? "Voir" : lang === "ar" ? "عرض" : "Review",
    },
    {
      tone: "info", icon: "whatsapp",
      title: lang === "fr" ? "Livraison WhatsApp en baisse" : lang === "ar" ? "انخفاض تسليم واتساب" : "WhatsApp delivery dipped",
      desc: lang === "fr" ? "87 % vs 94 % référence" : lang === "ar" ? "87% مقابل 94% المرجع" : "87% vs 94% baseline",
      cta: lang === "fr" ? "Diagnostiquer" : lang === "ar" ? "تشخيص" : "Diagnose",
    },
    {
      tone: "olive", icon: "user-plus",
      title: lang === "fr" ? "Invitation en attente" : lang === "ar" ? "دعوة معلقة" : "Pending staff invitation",
      desc: lang === "fr" ? "Dr. Hicham Tazi · 5 jours" : lang === "ar" ? "د. هشام التازي · 5 أيام" : "Dr. Hicham Tazi · 5 days",
      cta: lang === "fr" ? "Relancer" : lang === "ar" ? "إعادة إرسال" : "Resend",
    },
  ];

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{t("alerts_title")}</h2>
          <div className="meta">{t("alerts_sub")}</div>
        </div>
        <div className="right">
          <span className="pill danger no-dot" style={{ fontSize: 11 }}>{items.length}</span>
        </div>
      </div>
      <div className="card-body">
        {items.map((a, i) => (
          <div key={i} className={"alert " + a.tone}>
            <div className="ico"><Icon name={a.icon} size={16} /></div>
            <div>
              <div className="title">{a.title}</div>
              <div className="desc">{a.desc}</div>
            </div>
            <button className="cta">{a.cta}</button>
          </div>
        ))}
      </div>
    </section>
  );
};
window.Alerts = Alerts;
