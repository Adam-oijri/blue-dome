// Multi-doctor schedule strip
function ScheduleStrip({ selectedDocs }) {
  // 08:00 -> 18:00 = 600 minutes
  const TOTAL = 600;
  const docs = window.DATA.doctors.filter(d => selectedDocs.includes(d.id));

  const hours = [];
  for (let h = 8; h <= 18; h++) hours.push(h);

  const nowMin = window.DATA.nowMin;
  const nowPct = (nowMin / TOTAL) * 100;

  return (
    <div className="card sched-wrap">
      <div className="card-head">
        <h2>{t("sched_title")}</h2>
        <span className="head-sub">· {t("sched_subtitle")}</span>
        <div className="card-head-actions">
          <button className="btn-ghost"><IconChevronRight size={14} style={{transform:"rotate(180deg)"}} /></button>
          <button className="btn-secondary">{t("today")}</button>
          <button className="btn-ghost"><IconChevronRight size={14} /></button>
        </div>
      </div>
      <div className="sched-scroll">
        <div className="sched-grid">
          <div className="sched-axis">
            <div className="sched-axis-label">{window.__LANG==="ar"?"الطبيب":window.__LANG==="fr"?"Médecin":"Doctor"}</div>
            <div className="sched-axis-hours">
              {hours.map((h, i) => (
                <div key={h} className="sched-axis-hour"
                     style={{insetInlineStart: `${(i / 10) * 100}%`}}>
                  {String(h).padStart(2,"0")}:00
                </div>
              ))}
            </div>
          </div>
          {docs.map(d => {
            const blocks = (window.DATA.schedule[d.id] || []);
            return (
              <div key={d.id} className="sched-row">
                <div className="sched-row-doc">
                  <Avatar doctor={d} />
                  <div className="nm">
                    <b>{D.name(d)}</b>
                    <span>{D.specialty(d)}</span>
                  </div>
                </div>
                <div className="sched-row-track">
                  {blocks.map((b, i) => {
                    const left = (b.start / TOTAL) * 100;
                    const width = (b.dur / TOTAL) * 100;
                    const p = b.patient ? D.patient(b.patient) : null;
                    return (
                      <div key={i}
                           className={"sched-block " + b.status}
                           style={{insetInlineStart: `${left}%`, width: `calc(${width}% - 2px)`}}>
                        <div className="nm">
                          {b.status === "break"
                            ? (window.__LANG==="ar"?"استراحة":window.__LANG==="fr"?"Pause":"Break")
                            : (p ? D.name(p) : "")}
                        </div>
                        <div className="tm tabular">
                          {D.fmtMin(b.start)}–{D.fmtMin(b.start + b.dur)}
                        </div>
                      </div>
                    );
                  })}
                  {/* "now" line — rendered inside the first row only is fine, but show on each row for clarity */}
                  <div className="sched-now-line" style={{insetInlineStart: `${nowPct}%`}}>
                    {d.id === docs[0].id && (
                      <span className="sched-now-tag">{t("sched_now")} {window.DATA.nowLabel}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="sched-legend">
        <span className="lg-item"><span className="sw" style={{background:"var(--olive-100)", borderColor:"color-mix(in oklab, var(--olive-600) 35%, transparent)"}} />{t("sched_legend_confirmed")}</span>
        <span className="lg-item"><span className="sw" style={{background:"var(--warning-bg)", borderColor:"color-mix(in oklab, var(--warning) 30%, transparent)"}} />{t("sched_legend_pending")}</span>
        <span className="lg-item"><span className="sw" style={{background:"var(--info-bg)", borderColor:"color-mix(in oklab, var(--info) 35%, transparent)"}} />{t("sched_legend_in_progress")}</span>
        <span className="lg-item"><span className="sw" style={{background:"var(--muted)", borderColor:"var(--border)"}} />{t("sched_legend_completed")}</span>
        <span className="lg-item"><span className="sw" style={{background:"#fff", borderColor:"var(--border)", borderStyle:"dashed"}} />{t("sched_legend_cancelled")}</span>
        <span className="lg-item"><span className="sw" style={{background:"repeating-linear-gradient(45deg,var(--muted) 0,var(--muted) 4px,var(--muted-2) 4px,var(--muted-2) 8px)", borderColor:"var(--border)"}} />{t("sched_legend_break")}</span>
      </div>
    </div>
  );
}

window.ScheduleStrip = ScheduleStrip;
