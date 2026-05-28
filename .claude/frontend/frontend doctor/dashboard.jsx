// Dashboard page
const StatusPill = ({ status, t }) => {
  const map = {
    completed: { cls: "badge-success", label: t.completed },
    in_progress: { cls: "badge-info", label: t.in_progress },
    arrived: { cls: "badge-olive", label: t.arrived },
    confirmed: { cls: "badge-navy", label: t.confirmed },
    pending: { cls: "badge-warning", label: t.pending },
    cancelled: { cls: "badge-danger", label: t.cancelled },
  };
  const m = map[status] || map.pending;
  return <span className={"badge " + m.cls}><span className="dot"/>{m.label}</span>;
};

const KpiCard = ({ kpi }) => (
  <div className="kpi">
    <div className={"kpi-icon " + (kpi.color || "")}>
      <Icon name={kpi.icon} size={16}/>
    </div>
    <div className="kpi-label">{kpi.label}</div>
    <div className="kpi-value tabular">{kpi.value}</div>
    <div className="kpi-trend up">
      <Icon name="trend_up" size={11}/>
      {kpi.trend}
    </div>
  </div>
);

const Dashboard = ({ t, lang, openPatient }) => {
  const kpis = MOCK.kpis[lang];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="h1">{t.good_morning}</h1>
          <p>{t.today_summary}</p>
        </div>
        <div className="row gap-12">
          <button className="btn btn-outline btn-sm"><Icon name="download" size={13}/> Export</button>
          <button className="btn btn-primary btn-sm"><Icon name="plus" size={13}/> {t.new_appointment}</button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k, i) => <KpiCard key={i} kpi={k}/>)}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="section-header">
            <h2 className="h2">
              <Icon name="calendar" size={16}/>
              {t.todays_schedule}
            </h2>
            <div className="row gap-12">
              <button className="btn btn-ghost btn-sm"><Icon name="filter" size={13}/> All</button>
              <button className="btn btn-outline btn-sm">{t.view_calendar}<Icon name="chevron_right" size={13}/></button>
            </div>
          </div>
          <div className="section-content">
            <div className="schedule-list">
              {MOCK.schedule.map((apt, i) => {
                const barClass = apt.status === "completed" ? "success"
                              : apt.status === "in_progress" ? "olive"
                              : apt.status === "arrived" ? "warn"
                              : apt.status === "cancelled" ? "danger" : "";
                return (
                  <div className="schedule-item" key={i} onClick={() => openPatient(MOCK.patients.find(p => p.name.en === apt.name.en))}>
                    <div className="schedule-time">
                      <strong>{apt.time}</strong>
                      {apt.duration}
                    </div>
                    <div className={"schedule-bar " + barClass}/>
                    <div className="schedule-content">
                      <div className="schedule-name">{apt.name[lang]}</div>
                      <div className="schedule-meta">
                        <span>{apt.reason[lang]}</span>
                      </div>
                    </div>
                    <StatusPill status={apt.status} t={t}/>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col gap-16">
          {/* Currently with you */}
          <div className="card">
            <div className="section-header">
              <h2 className="h2"><Icon name="activity" size={16}/> {t.in_progress}</h2>
            </div>
            <div className="section-content" style={{ padding: 16 }}>
              <div className="row gap-12" style={{ alignItems: "flex-start" }}>
                <div className="avatar avatar-md" style={{ background: "var(--navy-700)" }}>YT</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{MOCK.schedule[2].name[lang]}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{MOCK.schedule[2].reason[lang]}</div>
                  <div className="row gap-12" style={{ marginTop: 8, fontSize: 11 }}>
                    <span className="badge badge-olive"><Icon name="clock" size={10}/>14 min</span>
                    <span className="muted">42y · M · B+</span>
                  </div>
                </div>
              </div>
              <div className="row gap-12" style={{ marginTop: 14 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  <Icon name="file_text" size={13}/> Open visit
                </button>
                <button className="btn btn-outline btn-sm btn-icon"><Icon name="more" size={14}/></button>
              </div>
            </div>
          </div>

          {/* Confirmation queue */}
          <div className="card">
            <div className="section-header">
              <h2 className="h2"><Icon name="whatsapp" size={16}/> WhatsApp</h2>
              <span className="badge badge-warning">5 {t.pending}</span>
            </div>
            <div className="section-content" style={{ padding: 0 }}>
              {[
                { name: "Omar Chraibi", time: "Tomorrow 14:00", state: "delivered" },
                { name: "Latifa Ouazzani", time: "Tomorrow 14:30", state: "seen" },
                { name: "Karim Sabri", time: "Tomorrow 15:30", state: "delivered" },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: "var(--olive-600)" }}>{m.name.split(" ").map(s => s[0]).join("")}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{m.time}</div>
                  </div>
                  <span className={"badge " + (m.state === "seen" ? "badge-info" : "badge-olive")} style={{ fontSize: 10 }}>
                    {m.state === "seen" ? "✓✓ Seen" : "✓ Sent"}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
              <button className="btn btn-ghost btn-sm" style={{ width: "100%" }}>View all 5 →</button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="section-header">
              <h2 className="h2"><Icon name="sparkle" size={16}/> {t.quick_actions}</h2>
            </div>
            <div className="section-content" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { i: "user", l: "New patient" },
                { i: "calendar", l: "Book slot" },
                { i: "pill", l: "Prescription" },
                { i: "flask", l: "Lab order" },
              ].map((a, i) => (
                <button key={i} className="btn btn-outline" style={{ height: 64, flexDirection: "column", gap: 4, fontSize: 12 }}>
                  <Icon name={a.i} size={18}/>
                  {a.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent patients */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-header">
          <h2 className="h2"><Icon name="users" size={16}/> {t.recent_patients}</h2>
          <button className="btn btn-ghost btn-sm">View all <Icon name="chevron_right" size={13}/></button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>{t.patients}</th>
              <th>{t.patient_id}</th>
              <th>{t.age} / {t.gender}</th>
              <th>{t.blood_type}</th>
              <th>{t.last_visit}</th>
              <th>{t.insurance}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MOCK.patients.slice(0, 6).map(p => (
              <tr key={p.id} onClick={() => openPatient(p)}>
                <td>
                  <div className="row gap-12">
                    <div className="avatar" style={{ background: p.gender === "male" ? "var(--navy-700)" : "var(--olive-600)" }}>
                      {p.name.en.split(" ").map(s => s[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{p.name[lang]}</div>
                      <div className="muted" style={{ fontSize: 11 }}>{p.phone}</div>
                    </div>
                    {p.flag === "new" && <span className="badge badge-olive">New</span>}
                    {p.flag === "chronic" && <span className="badge badge-warning">Chronic</span>}
                  </div>
                </td>
                <td className="muted tabular" style={{ fontSize: 12 }}>{p.id}</td>
                <td className="tabular">{p.age} · {p.gender === "male" ? "M" : "F"}</td>
                <td><span className="badge badge-danger" style={{ background: "rgba(185,28,28,0.08)", border: "1px solid rgba(185,28,28,0.18)" }}>{p.blood}</span></td>
                <td className="muted tabular" style={{ fontSize: 12 }}>{p.last_visit}</td>
                <td className="muted" style={{ fontSize: 12 }}>{p.insurance}</td>
                <td><Icon name="chevron_right" size={14} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
window.StatusPill = StatusPill;
