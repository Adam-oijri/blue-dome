// Sidebar + Topbar shell
const Sidebar = ({ t, page, setPage }) => {
  const navItem = (id, icon, label, count) => (
    <div className={"nav-item" + (page === id ? " active" : "")} onClick={() => setPage(id)}>
      <Icon name={icon} size={16}/>
      <span>{label}</span>
      {count != null && <span className="nav-count">{count}</span>}
    </div>
  );
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18a9 9 0 0 1 18 0"/>
            <path d="M3 18h18"/>
            <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <div className="sidebar-brand-name">{t.brand}</div>
          <div className="sidebar-brand-sub">{t.brand_sub}</div>
        </div>
      </div>

      <div className="nav-section-label">{t.nav_main}</div>
      {navItem("dashboard", "home", t.dashboard)}
      {navItem("calendar", "calendar", t.appointments, "12")}
      {navItem("patients", "users", t.patients)}
      {navItem("followup", "phone", t.follow_up, "5")}

      <div className="nav-section-label">{t.nav_clinical}</div>
      {navItem("consultation", "stethoscope", t.consultations)}
      {navItem("rx", "pill", t.prescriptions)}
      {navItem("labs", "flask", t.lab_orders, "3")}

      <div className="nav-section-label">{t.nav_admin}</div>
      {navItem("invoices", "receipt", t.invoices)}
      {navItem("inventory", "box", t.inventory)}
      {navItem("staff", "building", t.staff)}
      {navItem("settings", "settings", t.settings)}

      <div className="sidebar-foot">
        <div className="avatar">KL</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>Dr. {MOCK.doctor.first} {MOCK.doctor.last}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{MOCK.doctor.specialty}</div>
        </div>
        <Icon name="logout" size={14}/>
      </div>
    </aside>
  );
};

const Topbar = ({ t, lang, setLang }) => (
  <div className="topbar">
    <div className="search-box">
      <Icon name="search" size={16}/>
      <input placeholder={t.search_placeholder}/>
    </div>
    <div className="topbar-actions">
      <div className="lang-pill">
        {["en", "fr", "ar"].map(l => (
          <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <button className="btn btn-outline btn-icon btn-sm" title="Notifications">
        <Icon name="bell" size={15}/>
      </button>
      <button className="btn btn-accent btn-sm" onClick={() => window.openModal && window.openModal("appointment")}>
        <Icon name="plus" size={14}/>
        {t.new_appointment}
      </button>
    </div>
  </div>
);

window.Sidebar = Sidebar;
window.Topbar = Topbar;
