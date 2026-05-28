// WhatsApp panel + Checklist + Quick dock

const WA_STATUS_MAP = {
  seen:      { tone: "info",    key: "wa_status_seen",      ck: "ck-seen",  Ic: IconCheckDouble, sub: "wa_seen_at" },
  delivered: { tone: "neutral", key: "wa_status_delivered", ck: "ck-deliv", Ic: IconCheckDouble, sub: "wa_delivered_at" },
  sent:      { tone: "neutral", key: "wa_status_sent",      ck: "ck-sent",  Ic: IconCheck,       sub: "wa_sent_at" },
  failed:    { tone: "danger",  key: "wa_status_failed",    ck: "ck-fail",  Ic: IconX,           sub: "wa_failed_at" },
  confirmed: { tone: "success", key: "wa_status_confirmed", ck: "ck-seen",  Ic: IconCheckDouble, sub: "wa_seen_at" },
};

function WaItem({ row }) {
  const [tplOpen, setTplOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setTplOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const p = D.patient(row.patient);
  const d = D.doctor(row.doctor);
  const m = WA_STATUS_MAP[row.status];
  const Ic = m.Ic;
  const failed = row.status === "failed";
  const stale = row.retries >= 2;

  return (
    <div className="wa-item">
      <div className="wa-row1">
        <Avatar patient={p} />
        <div className="info">
          <b>{D.name(p)}</b>
          <span className="sub">
            <span>{t("wa_appointment_at", {
              doctor: D.name(d).replace(/^Dr\.\s*|^د\.\s*/, ""),
              time: row.apptTime,
            })}</span>
          </span>
        </div>
        <span className={"pill " + m.tone}>
          <span className="pdot" />
          {t(m.key)}
        </span>
      </div>
      <div className="wa-row2">
        <span className="wa-status-line">
          <Ic size={13} className={m.ck} />
          <span>{t(m.sub, { time: row.sentAt })}</span>
        </span>
        {row.retries > 0 && (
          <span className="wa-retry">{t("wa_retry", { n: row.retries })}</span>
        )}
      </div>
      <div className="wa-row3" style={{position:"relative"}} ref={ref}>
        {failed ? (
          <button className="wa-mini olive">
            <IconRefresh size={12} />
            {t("wa_resend")}
          </button>
        ) : (
          <button className="wa-mini" onClick={() => setTplOpen(!tplOpen)}>
            <IconSend size={12} />
            {t("wa_send_template")}
            <IconChevronDown size={11} />
          </button>
        )}
        {(failed || stale) && (
          <button className="wa-mini danger">
            <IconPhone size={12} />
            {t("wa_to_call")}
          </button>
        )}
        {tplOpen && (
          <div className="wa-tpl-pop">
            <div className="row">{t("wa_template_reminder")}</div>
            <div className="row">{t("wa_template_confirm")}</div>
            <div className="row">{t("wa_template_directions")}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function WhatsappPanel() {
  const [filter, setFilter] = React.useState("all");
  const all = window.DATA.whatsapp;
  const pending = all.filter(r => r.status === "sent" || r.status === "delivered");
  const failed = all.filter(r => r.status === "failed");
  const list = filter === "pending" ? pending : filter === "failed" ? failed : all;

  return (
    <div className="card wa-card">
      <div className="card-head">
        <div>
          <h2>{t("wa_title")}</h2>
        </div>
        <span className="head-sub">· {t("wa_subtitle")}</span>
        <div className="card-head-actions">
          <button className="btn-ghost"><IconRefresh size={13} /></button>
        </div>
      </div>
      <div className="wa-tabs">
        <button className={"wa-tab" + (filter==="all"?" active":"")} onClick={() => setFilter("all")}>
          {t("wa_filter_all")} <span className="ct tabular">{all.length}</span>
        </button>
        <button className={"wa-tab" + (filter==="pending"?" active":"")} onClick={() => setFilter("pending")}>
          {t("wa_filter_pending")} <span className="ct tabular">{pending.length}</span>
        </button>
        <button className={"wa-tab" + (filter==="failed"?" active":"")} onClick={() => setFilter("failed")}>
          {t("wa_filter_failed")} <span className="ct tabular">{failed.length}</span>
        </button>
      </div>
      <div className="wa-list">
        {list.map((r, i) => <WaItem key={i} row={r} />)}
      </div>
    </div>
  );
}

function ChecklistCard() {
  const morning = [
    { k: "cl_open_drawer", done: true },
    { k: "cl_sync_calendar", done: true },
    { k: "cl_review_noshows", done: true },
    { k: "cl_print_list", done: false },
  ];
  const evening = [
    { k: "cl_reconcile", done: false },
    { k: "cl_send_recap", done: false },
    { k: "cl_archive_files", done: false },
    { k: "cl_lock_drawer", done: false },
  ];
  const [m, setM] = React.useState(morning);
  const [e, setE] = React.useState(evening);

  const tog = (arr, set, i) => set(arr.map((it, j) => j === i ? { ...it, done: !it.done } : it));

  return (
    <div className="card">
      <div className="card-head">
        <h2>{t("cl_title")}</h2>
        <div className="card-head-actions">
          <span className="head-sub tabular">{m.filter(x=>x.done).length + e.filter(x=>x.done).length}/{m.length + e.length}</span>
        </div>
      </div>
      <div className="cl-section-title">{t("cl_morning")}</div>
      <div className="cl-list">
        {m.map((it, i) => (
          <div key={i} className={"cl-item" + (it.done ? " done" : "")} onClick={() => tog(m, setM, i)}>
            <span className="cl-check">{it.done && <IconCheck size={11} />}</span>
            <span className="cl-label">{t(it.k)}</span>
          </div>
        ))}
      </div>
      <div className="cl-section-title">{t("cl_evening")}</div>
      <div className="cl-list">
        {e.map((it, i) => (
          <div key={i} className={"cl-item" + (it.done ? " done" : "")} onClick={() => tog(e, setE, i)}>
            <span className="cl-check">{it.done && <IconCheck size={11} />}</span>
            <span className="cl-label">{t(it.k)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickDock() {
  return (
    <div className="dock">
      <button className="dock-btn"><IconUserPlus size={15} />{t("dock_new_patient")}</button>
      <span className="dock-divider" />
      <button className="dock-btn"><IconCalendar size={15} />{t("dock_new_appt")}</button>
      <span className="dock-divider" />
      <button className="dock-btn"><IconWalkin size={15} />{t("dock_walkin")}</button>
      <span className="dock-divider" />
      <button className="dock-btn primary"><IconCash size={15} />{t("dock_payment")}</button>
    </div>
  );
}

window.WhatsappPanel = WhatsappPanel;
window.ChecklistCard = ChecklistCard;
window.QuickDock = QuickDock;
