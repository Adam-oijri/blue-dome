// KPI strip + Waiting room board

function Avatar({ patient, doctor, size }) {
  const obj = patient || doctor;
  if (!obj) return null;
  const cls = "avatar " + (size === "lg" ? "lg " : "") + (obj.gender === "f" ? "female" : "male");
  return <div className={cls}>{obj.initials}</div>;
}

function KPI({ tint, icon: Ic, label, value, unit, foot, trend, trendDir }) {
  return (
    <div className="kpi">
      <div className="kpi-head">
        <div className={"kpi-chip tint-" + tint}>
          <Ic size={15} />
        </div>
        <div className="kpi-label">{label}</div>
      </div>
      <div className="kpi-value tabular">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="kpi-foot">
        <span>{foot}</span>
        {trend && (
          <span className={"kpi-trend " + (trendDir || "neutral")}>
            {trendDir === "up" && <IconArrowUp size={10} />}
            {trendDir === "down" && <IconArrowDown size={10} />}
            <span className="tabular">{trend}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function KpiStrip() {
  const k = window.DATA.kpis;
  return (
    <div className="kpi-row">
      <KPI tint="navy"   icon={IconCalendar} label={t("kpi_today")}
           value={k.today.value}
           foot={t("kpi_today_sub", { done: k.today.done, left: k.today.left })}
           trend="+3" trendDir="up" />
      <KPI tint="warn"   icon={IconWhatsapp} label={t("kpi_pending")}
           value={k.pending.value}
           foot={t("kpi_pending_sub")}
           trend="2 fail" trendDir="down" />
      <KPI tint="info"   icon={IconWalkin}  label={t("kpi_walkins")}
           value={k.walkins.value}
           foot={t("kpi_walkins_sub", { min: k.walkins.avgMin })} />
      <KPI tint="olive"  icon={IconCash}    label={t("kpi_cash")}
           value={k.cash.value.toLocaleString("en-US")} unit={t("mad")}
           foot={t("kpi_cash_sub", {
             card: k.cash.card.toLocaleString("en-US") + " " + t("mad"),
             ins:  k.cash.ins.toLocaleString("en-US")  + " " + t("mad"),
           })} />
      <KPI tint="danger" icon={IconAlert}   label={t("kpi_noshows")}
           value={k.noshows.value}
           foot={t("kpi_noshows_sub", { rate: k.noshows.rate })}
           trend="-0.4%" trendDir="up" />
    </div>
  );
}

const WR_STATUS_MAP = {
  arrived:    { tone: "info",    key: "wr_status_arrived" },
  with_nurse: { tone: "warning", key: "wr_status_with_nurse" },
  in_room:    { tone: "navy",    key: "wr_status_in_room" },
  ready_pay:  { tone: "olive",   key: "wr_status_ready_pay" },
};

function StatusPill({ status }) {
  const m = WR_STATUS_MAP[status];
  if (!m) return null;
  return (
    <span className={"pill " + m.tone}>
      <span className="pdot" />
      {t(m.key)}
    </span>
  );
}

function WaitingRoom() {
  const rows = window.DATA.waitingRoom;
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>{t("wr_title")}</h2>
        </div>
        <span className="head-sub">· {t("wr_subtitle")}</span>
        <div className="card-head-actions">
          <span className="page-header-live live-pill" style={{display:"inline-flex"}}>
            <span className="blink" />
            LIVE
          </span>
          <button className="btn-ghost"><IconRefresh size={13} /></button>
          <button className="btn-ghost"><IconFilter size={13} /></button>
        </div>
      </div>
      <table className="wr-table">
        <thead>
          <tr>
            <th>{t("wr_col_patient")}</th>
            <th>{t("wr_col_doctor")}</th>
            <th>{t("wr_col_arrived")}</th>
            <th>{t("wr_col_wait")}</th>
            <th>{t("wr_col_status")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const p = D.patient(r.patient);
            const d = D.doctor(r.doctor);
            const longWait = r.waitMin >= 25 && r.waitMin < 40;
            const critWait = r.waitMin >= 40;
            return (
              <tr key={i}>
                <td>
                  <div className="wr-patient">
                    <Avatar patient={p} />
                    <div className="nm">
                      <b>{D.name(p)}</b>
                      <div className="meta">
                        <span className="tag-blood">{p.blood}</span>
                        {p.chronic && <span className="tag-chronic">{window.__LANG==="fr"?"Chronique":window.__LANG==="ar"?"مزمن":"Chronic"}</span>}
                        {r.walkin && <span className="tag-walkin">{t("wr_walkin_tag")}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="wr-doctor">
                    <Avatar doctor={d} />
                    <span>{D.name(d).replace(/^Dr\.\s*|^د\.\s*/, "")}</span>
                  </div>
                </td>
                <td><span className="wr-time tabular">{r.arrivedAt}</span></td>
                <td>
                  <span className={"wr-wait tabular" + (critWait ? " crit" : longWait ? " long" : "")}>
                    {r.waitMin}<span className="u"> {t("wr_min")}</span>
                  </span>
                </td>
                <td><StatusPill status={r.status} /></td>
                <td>
                  <div className="wr-actions">
                    {r.status === "arrived" && (
                      <button className="wr-action-btn primary">
                        <IconChevronRight size={12} />
                        {t("wr_action_call")}
                      </button>
                    )}
                    {r.status === "with_nurse" && (
                      <button className="wr-action-btn">
                        <IconStethoscope size={12} />
                        {t("wr_action_call")}
                      </button>
                    )}
                    {r.status === "in_room" && (
                      <button className="wr-action-btn">
                        <IconNote size={12} />
                      </button>
                    )}
                    {r.status === "ready_pay" && (
                      <button className="wr-action-btn olive">
                        <IconWallet size={12} />
                        {t("wr_action_pay")}
                      </button>
                    )}
                    <button className="wr-action-btn ic-only" title={t("wr_action_reassign")}>
                      <IconGrip size={12} />
                    </button>
                    <button className="wr-action-btn ic-only">
                      <IconMoreHoriz size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

window.Avatar = Avatar;
window.KpiStrip = KpiStrip;
window.WaitingRoom = WaitingRoom;
