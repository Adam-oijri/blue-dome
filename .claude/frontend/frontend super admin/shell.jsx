// Sidebar
const Sidebar = ({ t, lang }) => {
  const sec = (title, items) => (
    <div className="nav-section" key={title}>
      <div className="nav-section-title">{title}</div>
      {items.map((it) => (
        <div key={it.key} className={"nav-item " + (it.active ? "active" : "")}>
          <Icon name={it.icon} size={17} />
          <span>{it.label}</span>
          {it.badge ? <span className="badge">{it.badge}</span> : null}
        </div>
      ))}
    </div>
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="dome" size={18} style={{ color: "#fff" }} strokeWidth={2.2} />
        </div>
        <div>
          <div className="brand-name">{t("brand_name")}</div>
          <div className="brand-sub">{t("brand_sub")}</div>
        </div>
      </div>

      {sec(t("nav_workspace"), [
        { key: "dash", icon: "layout",   label: t("nav_dashboard"), active: true },
        { key: "appt", icon: "calendar", label: t("nav_appointments"), badge: "12" },
        { key: "pat",  icon: "users",    label: t("nav_patients") },
        { key: "msg",  icon: "message",  label: t("nav_messages") },
      ])}

      {sec(t("nav_clinical"), [
        { key: "cons", icon: "stethoscope", label: t("nav_consultations") },
        { key: "rx",   icon: "pill",        label: t("nav_prescriptions") },
        { key: "inv",  icon: "package",     label: t("nav_inventory"), badge: "3" },
      ])}

      {sec(t("nav_admin"), [
        { key: "usr",  icon: "shield",  label: t("nav_users") },
        { key: "fin",  icon: "wallet",  label: t("nav_finance") },
        { key: "aud",  icon: "list",    label: t("nav_audit") },
        { key: "rec",  icon: "trash",   label: t("nav_recycle") },
        { key: "set",  icon: "settings",label: t("nav_settings") },
      ])}

      <div className="sidebar-footer">
        <div className="avatar av-32 av-olive">YA</div>
        <div className="who">
          <div className="who-name">Yasmine Admin</div>
          <div className="who-role">Owner · Admin</div>
        </div>
        <button className="logout" title="Log out"><Icon name="log-out" size={17} /></button>
      </div>
    </aside>
  );
};
window.Sidebar = Sidebar;

// Topbar
const Topbar = ({ t, lang, setLang, branch, setBranch, period, setPeriod }) => {
  const langs = ["EN", "FR", "AR"];
  const branches = [
    { id: "all",   label: t("branch_all") },
    { id: "casa",  label: t("branch_casa") },
    { id: "rabat", label: t("branch_rabat") },
  ];
  const periods = [
    { id: "today", label: t("period_today") },
    { id: "week",  label: t("period_week") },
    { id: "month", label: t("period_month") },
    { id: "quarter", label: t("period_quarter") },
    { id: "ytd",  label: t("period_ytd") },
  ];

  const [openBranch, setOpenBranch] = React.useState(false);

  return (
    <header className="topbar">
      <div className="search">
        <Icon name="search" size={16} />
        <input placeholder={t("search_ph")} />
        <kbd>⌘K</kbd>
      </div>

      <div style={{ width: 1, alignSelf: "stretch", background: "var(--border)", margin: "0 4px" }} />

      <div style={{ position: "relative" }}>
        <button className="menu-trigger" onClick={() => setOpenBranch((v) => !v)}>
          <Icon name="building" size={16} />
          {branches.find((b) => b.id === branch)?.label}
          <Icon name="chev-down" size={14} className="chev" />
        </button>
        {openBranch && (
          <div style={{
            position: "absolute", insetInlineStart: 0, top: 42,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--r-md)", boxShadow: "var(--shadow-md)",
            padding: 4, minWidth: 200, zIndex: 40,
          }}>
            {branches.map((b) => (
              <button key={b.id}
                onClick={() => { setBranch(b.id); setOpenBranch(false); }}
                style={{
                  display: "flex", width: "100%", padding: "8px 10px",
                  borderRadius: 6, fontSize: 13, alignItems: "center", gap: 8,
                  background: branch === b.id ? "var(--muted)" : "transparent",
                  color: "var(--ink-900)", fontWeight: branch === b.id ? 600 : 500,
                  textAlign: "start",
                }}>
                {b.label}
                {b.id === "casa" && <span className="pill olive no-dot" style={{ marginInlineStart: "auto", fontSize: 10 }}>{t("main_badge")}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="segmented">
        {periods.map((p) => (
          <button key={p.id} className={period === p.id ? "on" : ""} onClick={() => setPeriod(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="topbar-right">
        <div className="lang-pill">
          {langs.map((L) => (
            <button key={L} className={lang === L.toLowerCase() ? "on" : ""} onClick={() => setLang(L.toLowerCase())}>
              {L}
            </button>
          ))}
        </div>
        <button className="icon-btn" title="Notifications">
          <Icon name="bell" size={18} />
          <span className="dot" />
        </button>
        <button className="btn btn-accent">
          <Icon name="user-plus" size={16} />
          {t("cta_invite")}
        </button>
      </div>
    </header>
  );
};
window.Topbar = Topbar;
