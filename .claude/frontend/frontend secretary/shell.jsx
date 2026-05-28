// App shell: sidebar + topbar
const NAV_SECTIONS = [
  {
    label: "nav_overview",
    items: [
      { id: "dashboard", icon: IconLayout, key: "nav_dashboard" },
    ],
  },
  {
    label: "nav_operations",
    items: [
      { id: "appointments", icon: IconCalendar, key: "nav_appointments", badge: "24" },
      { id: "patients",     icon: IconUsers,    key: "nav_patients" },
      { id: "walkins",      icon: IconWalkin,   key: "nav_walkins",      badge: "3" },
      { id: "whatsapp",     icon: IconWhatsapp, key: "nav_whatsapp",     badge: "7" },
      { id: "followups",    icon: IconPhone,    key: "nav_followups" },
    ],
  },
  {
    label: "nav_admin",
    items: [
      { id: "billing",  icon: IconReceipt,  key: "nav_billing" },
      { id: "payments", icon: IconWallet,   key: "nav_payments" },
      { id: "doctors",  icon: IconStethoscope, key: "nav_doctors" },
      { id: "branches", icon: IconBuilding, key: "nav_branches" },
      { id: "reports",  icon: IconChart,    key: "nav_reports" },
      { id: "settings", icon: IconSettings, key: "nav_settings" },
    ],
  },
];

function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-brand-mark">
          <IconDome size={20} />
        </div>
        <div className="sb-brand-text">
          <b>{t("brand_line1")}</b>
          <span>{t("brand_line2")}</span>
        </div>
      </div>
      <nav className="sb-nav">
        {NAV_SECTIONS.map(sec => (
          <React.Fragment key={sec.label}>
            <div className="sb-section-label">{t(sec.label)}</div>
            {sec.items.map(it => {
              const Ic = it.icon;
              const active = it.id === page;
              return (
                <button
                  key={it.id}
                  className={"sb-item" + (active ? " active" : "")}
                  onClick={() => setPage(it.id)}
                  type="button"
                >
                  <Ic size={17} />
                  <span>{t(it.key)}</span>
                  {it.badge && <span className="sb-badge tabular">{it.badge}</span>}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </nav>
      <div className="sb-footer">
        <div className="sb-avatar">NB</div>
        <div className="sb-footer-text">
          <b>{(window.__LANG === "ar") ? "نادية برادة" : "Nadia Berrada"}</b>
          <span>{t("user_role")}</span>
        </div>
        <button className="sb-logout" title={t("logout")}>
          <IconLogout size={16} />
        </button>
      </div>
    </aside>
  );
}

function Topbar({ lang, setLang, branch, setBranch, selectedDocs, setSelectedDocs }) {
  const [openBranch, setOpenBranch] = React.useState(false);
  const [openDocs, setOpenDocs] = React.useState(false);
  const branchRef = React.useRef(null);
  const docsRef = React.useRef(null);

  React.useEffect(() => {
    const onClick = (e) => {
      if (branchRef.current && !branchRef.current.contains(e.target)) setOpenBranch(false);
      if (docsRef.current && !docsRef.current.contains(e.target)) setOpenDocs(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const branchData = window.DATA.branches.find(b => b.id === branch);
  const docsAtBranch = window.DATA.doctors.filter(d => d.branch === branch);

  const toggleDoc = (id) => {
    if (selectedDocs.includes(id)) {
      setSelectedDocs(selectedDocs.length === 1 ? selectedDocs : selectedDocs.filter(x => x !== id));
    } else {
      setSelectedDocs([...selectedDocs, id]);
    }
  };
  const allSelected = selectedDocs.length === docsAtBranch.length;

  return (
    <header className="topbar">
      <div className="tb-search">
        <span className="tb-search-icon"><IconSearch size={16} /></span>
        <input type="text" placeholder={t("search_placeholder")} />
      </div>

      {/* branch picker */}
      <div className="tb-select" ref={branchRef}>
        <button className="tb-select-btn" onClick={() => { setOpenBranch(!openBranch); setOpenDocs(false); }}>
          <IconBuilding size={15} />
          <span className="lbl">{t("branch_label")}:</span>
          <b>{D.branchLabel(branchData.key)}</b>
          <IconChevronDown size={14} />
        </button>
        {openBranch && (
          <div className="tb-popover">
            {window.DATA.branches.map(b => (
              <div key={b.id}
                   className={"row" + (b.id === branch ? " on" : "")}
                   onClick={() => { setBranch(b.id); setOpenBranch(false); }}>
                <span className="check">{b.id === branch && <IconCheck size={11} />}</span>
                <span>{D.branchLabel(b.key)}</span>
                {b.main && <span className="sub" style={{color: "var(--olive-700)"}}>Main</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* doctors multi-select */}
      <div className="tb-select" ref={docsRef}>
        <button className="tb-select-btn" onClick={() => { setOpenDocs(!openDocs); setOpenBranch(false); }}>
          <IconStethoscope size={15} />
          <span className="lbl">{t("doctors_label")}:</span>
          <b>{allSelected
            ? t("doctors_all")
            : t("doctors_count", { n: selectedDocs.length, total: docsAtBranch.length })}</b>
          <IconChevronDown size={14} />
        </button>
        {openDocs && (
          <div className="tb-popover">
            <div className={"row" + (allSelected ? " on" : "")}
                 onClick={() => setSelectedDocs(docsAtBranch.map(d => d.id))}>
              <span className="check">{allSelected && <IconCheck size={11} />}</span>
              <b>{t("doctors_all")}</b>
            </div>
            <div className="sep" />
            {docsAtBranch.map(d => {
              const on = selectedDocs.includes(d.id);
              return (
                <div key={d.id} className={"row" + (on ? " on" : "")} onClick={() => toggleDoc(d.id)}>
                  <span className="check">{on && <IconCheck size={11} />}</span>
                  <span className={"swatch"} style={{background: d.hue === "navy" ? "var(--navy-700)" : "var(--olive-600)"}} />
                  <span>{D.name(d)}</span>
                  <span className="sub">{D.specialty(d)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="tb-spacer" />

      {/* lang segmented */}
      <div className="tb-segmented" role="tablist" aria-label="Language">
        {["en","fr","ar"].map(l => (
          <button key={l}
                  className={l === lang ? "active" : ""}
                  onClick={() => setLang(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <button className="tb-icon-btn" title={t("notifications")}>
        <IconBell size={17} />
        <span className="dot" />
      </button>

      <button className="tb-cta">
        <IconPlus size={15} />
        <span>{t("new_appointment")}</span>
      </button>
    </header>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
