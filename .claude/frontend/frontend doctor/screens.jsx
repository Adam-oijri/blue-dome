// Remaining screens: Consultation, Labs, Invoices, Inventory, Staff, Settings, Follow-up

// ============= CONSULTATION (active visit) =============
const ConsultationScreen = ({ t, lang }) => {
  const [tab, setTab] = React.useState("exam");
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="row gap-12" style={{ marginBottom: 6 }}>
            <span className="badge badge-info"><span className="dot"/>{t.in_progress}</span>
            <span className="muted" style={{ fontSize: 12 }}>Started 09:47 · 14 min elapsed</span>
          </div>
          <h1 className="h1">Youssef Tazi · Visit</h1>
          <p>Initial consultation — Chest pain · 42y · M · B+ · P-002910</p>
        </div>
        <div className="row gap-12">
          <button className="btn btn-outline btn-sm"><Icon name="file_text" size={13}/> Save draft</button>
          <button className="btn btn-accent btn-sm"><Icon name="check" size={13}/> Complete visit</button>
        </div>
      </div>

      <div className="three-col">
        {/* Left: patient context */}
        <div className="col gap-16">
          <div className="card card-pad">
            <div className="row gap-12" style={{ marginBottom: 12 }}>
              <div className="avatar avatar-md" style={{ background: "var(--navy-700)" }}>YT</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Youssef Tazi</div>
                <div className="muted" style={{ fontSize: 11 }}>P-002910 · 42y</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
              <div><div className="muted" style={{ fontSize: 10 }}>Blood</div><div style={{ fontWeight: 500 }}>B+</div></div>
              <div><div className="muted" style={{ fontSize: 10 }}>Insurance</div><div style={{ fontWeight: 500 }}>Saham</div></div>
              <div><div className="muted" style={{ fontSize: 10 }}>Phone</div><div style={{ fontWeight: 500 }}>+212 6 63 77…</div></div>
              <div><div className="muted" style={{ fontSize: 10 }}>Last visit</div><div style={{ fontWeight: 500 }}>Today</div></div>
            </div>
          </div>

          <div className="card">
            <div className="section-header" style={{ padding: "12px 16px" }}>
              <h3 className="h3">{t.allergies}</h3>
            </div>
            <div style={{ padding: "0 16px 14px" }}>
              <span className="badge badge-danger">No known allergies</span>
            </div>
          </div>

          <div className="card">
            <div className="section-header" style={{ padding: "12px 16px" }}>
              <h3 className="h3">Recent visits</h3>
            </div>
            <div style={{ padding: 4 }}>
              {[
                { d: "Mar 2026", t: "Annual checkup" },
                { d: "Sep 2025", t: "Cold/Flu" },
                { d: "Feb 2025", t: "Sports injury" },
              ].map((v, i) => (
                <div key={i} style={{ padding: "8px 12px", borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 500 }}>{v.t}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{v.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: SOAP form */}
        <div className="card">
          <div className="tabs">
            {[
              ["exam", "Examination"],
              ["dx", "Diagnosis"],
              ["plan", "Treatment plan"],
            ].map(([id, l]) => (
              <button key={id} className={"tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>{l}</button>
            ))}
          </div>
          <div style={{ padding: 20 }}>
            {tab === "exam" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div className="label">Chief complaint</div>
                  <textarea rows={2} defaultValue="Intermittent chest pain over the last 3 weeks, worse with exertion."/>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div className="label">Present illness</div>
                  <textarea rows={4} defaultValue="42-year-old male, sedentary office worker, presenting with retrosternal chest discomfort, sharp, non-radiating, occurring 2-3 times weekly. No associated dyspnea, nausea, or diaphoresis. Family history of CAD (father, MI age 58)."/>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div className="label">Vital signs (recorded 09:50)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {[
                      ["BP", "142/90", "mmHg", true],
                      ["HR", "84", "bpm", false],
                      ["Temp", "36.8", "°C", false],
                      ["SpO₂", "97", "%", false],
                    ].map(([l, v, u, w], i) => (
                      <div key={i} style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8 }}>
                        <div className="muted" style={{ fontSize: 10, textTransform: "uppercase" }}>{l}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span className="tabular" style={{ fontSize: 16, fontWeight: 600, color: w ? "var(--warning)" : "var(--fg)" }}>{v}</span>
                          <span className="muted" style={{ fontSize: 11 }}>{u}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="label">Physical examination</div>
                  <textarea rows={4} defaultValue="Heart: regular rate and rhythm, S1 S2 normal, no murmurs/rubs/gallops. Lungs: clear bilaterally. No peripheral edema. Carotids without bruits."/>
                </div>
              </>
            )}
            {tab === "dx" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div className="label">Primary diagnosis (ICD-10)</div>
                  <input defaultValue="R07.9 — Chest pain, unspecified"/>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div className="label">Differential diagnosis</div>
                  <textarea rows={4} defaultValue="• Stable angina (rule out via stress test)
• Costochondritis
• GERD
• Anxiety-related chest pain"/>
                </div>
                <div>
                  <div className="label">Clinical impression</div>
                  <textarea rows={3} defaultValue="Atypical chest pain in 42yo male with positive family history. Low-to-intermediate cardiac risk. Workup indicated."/>
                </div>
              </>
            )}
            {tab === "plan" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div className="label">Investigations ordered</div>
                  <div className="col gap-12">
                    <label className="row gap-12" style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>ECG (12-lead)</div>
                        <div className="muted" style={{ fontSize: 11 }}>In-clinic · today</div>
                      </div>
                      <span className="badge badge-info">Ordered</span>
                    </label>
                    <label className="row gap-12" style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}>
                      <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>Lipid panel + Troponin + CBC</div>
                        <div className="muted" style={{ fontSize: 11 }}>Lab Biocenter · fasting</div>
                      </div>
                      <span className="badge badge-info">Ordered</span>
                    </label>
                    <label className="row gap-12" style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}>
                      <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>Stress test</div>
                        <div className="muted" style={{ fontSize: 11 }}>Schedule within 1 week</div>
                      </div>
                      <span className="badge badge-warning">Pending</span>
                    </label>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div className="label">Follow-up</div>
                  <div className="row gap-12">
                    <input defaultValue="In 2 weeks after stress test"/>
                    <input type="date" defaultValue="2026-05-19" style={{ maxWidth: 180 }}/>
                  </div>
                </div>
                <div>
                  <div className="label">Patient instructions</div>
                  <textarea rows={3} defaultValue="Avoid strenuous exercise until cleared. Return immediately if chest pain becomes severe, prolonged, or accompanied by shortness of breath."/>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: actions panel */}
        <div className="col gap-16">
          <div className="card card-pad">
            <h3 className="h3" style={{ marginBottom: 12 }}>Visit summary</h3>
            <div className="col gap-12" style={{ fontSize: 12 }}>
              <div className="row gap-12" style={{ justifyContent: "space-between" }}>
                <span className="muted">Duration</span>
                <span className="tabular" style={{ fontWeight: 500 }}>14 min</span>
              </div>
              <div className="row gap-12" style={{ justifyContent: "space-between" }}>
                <span className="muted">Tests ordered</span>
                <span style={{ fontWeight: 500 }}>3</span>
              </div>
              <div className="row gap-12" style={{ justifyContent: "space-between" }}>
                <span className="muted">Prescriptions</span>
                <span style={{ fontWeight: 500 }}>0</span>
              </div>
              <div className="row gap-12" style={{ justifyContent: "space-between" }}>
                <span className="muted">Fee</span>
                <span className="tabular" style={{ fontWeight: 600 }}>450 MAD</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-header" style={{ padding: "12px 16px" }}>
              <h3 className="h3">Quick actions</h3>
            </div>
            <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { i: "pill", l: "Prescribe" },
                { i: "flask", l: "Lab order" },
                { i: "receipt", l: "Invoice" },
                { i: "calendar", l: "Re-book" },
              ].map((a, i) => (
                <button key={i} className="btn btn-outline" style={{ height: 60, flexDirection: "column", gap: 4, fontSize: 11 }}>
                  <Icon name={a.i} size={16}/> {a.l}
                </button>
              ))}
            </div>
          </div>

          <div className="card card-pad" style={{ background: "var(--info-bg)", borderColor: "transparent" }}>
            <div className="row gap-12" style={{ alignItems: "flex-start" }}>
              <Icon name="sparkle" size={16} style={{ color: "var(--info)" }}/>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--info)" }}>AI suggestion</div>
                <div style={{ fontSize: 11, marginTop: 4, color: "#1e3a8a" }}>Given family hx + atypical pain, consider HEART score documentation. Patient scores 3 → outpatient workup appropriate.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= LAB ORDERS =============
const LabsScreen = ({ t, lang }) => {
  const orders = [
    { id: "LAB-2026-1842", patient: "Youssef Tazi", tests: 4, lab: "Biocenter", urgency: "routine", status: "in_progress", date: "May 5" },
    { id: "LAB-2026-1839", patient: "Hassan El Amrani", tests: 2, lab: "Biocenter", urgency: "urgent", status: "completed", date: "May 5", abnormal: 1 },
    { id: "LAB-2026-1835", patient: "Salma Idrissi", tests: 6, lab: "Pasteur", urgency: "routine", status: "completed", date: "May 4", abnormal: 0 },
    { id: "LAB-2026-1828", patient: "Latifa Ouazzani", tests: 3, lab: "Biocenter", urgency: "routine", status: "sample_collected", date: "May 4" },
    { id: "LAB-2026-1820", patient: "Aicha Berrada", tests: 5, lab: "Pasteur", urgency: "stat", status: "completed", date: "May 3", abnormal: 2 },
    { id: "LAB-2026-1815", patient: "Mehdi Saidi", tests: 4, lab: "Biocenter", urgency: "routine", status: "pending", date: "May 3" },
  ];

  const statusMap = {
    pending: { c: "badge", l: "Pending" },
    sample_collected: { c: "badge-warning", l: "Collected" },
    in_progress: { c: "badge-info", l: "In progress" },
    completed: { c: "badge-success", l: "Completed" },
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="h1">{t.lab_orders}</h1>
          <p>23 orders this week · 3 critical results pending review</p>
        </div>
        <button className="btn btn-accent btn-sm" onClick={() => window.openModal && window.openModal("lab")}><Icon name="plus" size={13}/> New lab order</button>
      </div>

      <div className="kpi-grid">
        <KpiCardSimple label="In progress" value="8" icon="flask" color=""/>
        <KpiCardSimple label="Awaiting review" value="3" icon="alert" color="warn"/>
        <KpiCardSimple label="Critical results" value="1" icon="alert" color="warn"/>
        <KpiCardSimple label="Avg. turnaround" value="18h" icon="clock" color="success"/>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="section-header">
            <h2 className="h2"><Icon name="flask" size={16}/> Recent orders</h2>
            <div className="row gap-12">
              <button className="btn btn-outline btn-sm"><Icon name="filter" size={13}/> All labs</button>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Order</th><th>Patient</th><th>Tests</th><th>Lab</th><th>Urgency</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const s = statusMap[o.status];
                return (
                  <tr key={o.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 12 }} className="tabular">{o.id}</div>
                      <div className="muted" style={{ fontSize: 11 }}>{o.date}</div>
                    </td>
                    <td>{o.patient}</td>
                    <td className="tabular">
                      {o.tests}
                      {o.abnormal > 0 && <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: 10 }}>{o.abnormal} abn.</span>}
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>{o.lab}</td>
                    <td>
                      {o.urgency === "stat" && <span className="badge badge-danger">STAT</span>}
                      {o.urgency === "urgent" && <span className="badge badge-warning">Urgent</span>}
                      {o.urgency === "routine" && <span className="badge">Routine</span>}
                    </td>
                    <td><span className={"badge " + s.c}>{s.l}</span></td>
                    <td><Icon name="chevron_right" size={14} className="muted"/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-header">
            <h2 className="h2"><Icon name="alert" size={16}/> Critical results</h2>
          </div>
          <div style={{ padding: 16 }}>
            {[
              { p: "Aicha Berrada", t: "Troponin I", v: "0.42 ng/mL", n: "<0.04", critical: true },
              { p: "Hassan El Amrani", t: "LDL Cholesterol", v: "218 mg/dL", n: "<100", critical: false },
              { p: "Aicha Berrada", t: "Potassium", v: "5.9 mEq/L", n: "3.5–5.0", critical: true },
            ].map((r, i) => (
              <div key={i} style={{ padding: 12, marginBottom: 8, border: "1px solid var(--border)", borderRadius: 8, background: r.critical ? "rgba(185,28,28,0.04)" : "var(--surface)" }}>
                <div className="row gap-12">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.t}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{r.p}</div>
                  </div>
                  <span className={"badge " + (r.critical ? "badge-danger" : "badge-warning")}>
                    {r.critical ? "Critical" : "High"}
                  </span>
                </div>
                <div className="row gap-12" style={{ marginTop: 8, fontSize: 12 }}>
                  <div className="tabular" style={{ fontWeight: 600, color: r.critical ? "var(--danger)" : "var(--warning)" }}>{r.v}</div>
                  <div className="muted">Normal: {r.n}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCardSimple = ({ label, value, icon, color }) => (
  <div className="kpi">
    <div className={"kpi-icon " + (color || "")}><Icon name={icon} size={16}/></div>
    <div className="kpi-label">{label}</div>
    <div className="kpi-value tabular">{value}</div>
  </div>
);

// ============= INVOICES =============
const InvoicesScreen = ({ t, lang }) => {
  const invoices = [
    { id: "INV-2026-04812", patient: "Hassan El Amrani", date: "May 5", amount: "450", status: "paid", method: "Cash" },
    { id: "INV-2026-04811", patient: "Fatima Bennani", date: "May 5", amount: "650", status: "paid", method: "Card" },
    { id: "INV-2026-04810", patient: "Youssef Tazi", date: "May 5", amount: "850", status: "pending", method: "Insurance" },
    { id: "INV-2026-04809", patient: "Aicha Berrada", date: "May 5", amount: "450", status: "partially_paid", method: "Insurance + Cash" },
    { id: "INV-2026-04805", patient: "Salma Idrissi", date: "May 4", amount: "300", status: "paid", method: "Card" },
    { id: "INV-2026-04802", patient: "Mehdi Saidi", date: "May 4", amount: "1,200", status: "overdue", method: "—" },
    { id: "INV-2026-04798", patient: "Karim Sabri", date: "May 3", amount: "450", status: "paid", method: "Cash" },
  ];
  const sm = {
    paid: { c: "badge-success", l: "Paid" },
    pending: { c: "badge-warning", l: "Pending" },
    partially_paid: { c: "badge-info", l: "Partial" },
    overdue: { c: "badge-danger", l: "Overdue" },
  };
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="h1">{t.invoices}</h1>
          <p>May 2026 · 142 invoices · 18,420 MAD outstanding</p>
        </div>
        <div className="row gap-12">
          <button className="btn btn-outline btn-sm"><Icon name="download" size={13}/> Export</button>
          <button className="btn btn-accent btn-sm" onClick={() => window.openModal && window.openModal("invoice")}><Icon name="plus" size={13}/> New invoice</button>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCardSimple label="Revenue this month" value="84,230 MAD" icon="coin" color="olive"/>
        <KpiCardSimple label="Outstanding" value="18,420 MAD" icon="receipt" color="warn"/>
        <KpiCardSimple label="Overdue" value="3 invoices" icon="alert" color="warn"/>
        <KpiCardSimple label="Avg. collection" value="6.2 days" icon="clock" color="success"/>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="row gap-12">
            <h2 className="h2"><Icon name="receipt" size={16}/> All invoices</h2>
            <div className="row gap-12" style={{ marginLeft: 16 }}>
              {["All", "Paid", "Pending", "Overdue"].map((f, i) => (
                <button key={i} className={"btn btn-sm " + (i === 0 ? "btn-primary" : "btn-ghost")}>{f}</button>
              ))}
            </div>
          </div>
          <div className="search-box" style={{ maxWidth: 260 }}>
            <Icon name="search" size={14}/>
            <input placeholder="Search invoice..."/>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th><th>Patient</th><th>Date</th><th>Amount</th><th>Method</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => {
              const s = sm[inv.status];
              return (
                <tr key={inv.id}>
                  <td className="tabular" style={{ fontWeight: 500, fontSize: 12 }}>{inv.id}</td>
                  <td style={{ fontWeight: 500 }}>{inv.patient}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{inv.date}</td>
                  <td className="tabular" style={{ fontWeight: 600 }}>{inv.amount} MAD</td>
                  <td className="muted" style={{ fontSize: 12 }}>{inv.method}</td>
                  <td><span className={"badge " + s.c}>{s.l}</span></td>
                  <td>
                    <div className="row gap-12">
                      <button className="btn btn-ghost btn-icon btn-sm"><Icon name="whatsapp" size={13}/></button>
                      <button className="btn btn-ghost btn-icon btn-sm"><Icon name="print" size={13}/></button>
                      <Icon name="chevron_right" size={14} className="muted"/>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============= INVENTORY =============
const InventoryScreen = ({ t, lang }) => {
  const items = [
    { name: "Atorvastatin 20mg", category: "medication", stock: 240, min: 50, exp: "Aug 2027", batch: "ATV-2024-08", status: "ok" },
    { name: "Amlodipine 5mg", category: "medication", stock: 32, min: 50, exp: "Mar 2027", batch: "AML-2024-11", status: "low" },
    { name: "Aspirin 75mg", category: "medication", stock: 180, min: 100, exp: "Jun 2027", batch: "ASP-2024-04", status: "ok" },
    { name: "Disposable syringes 5ml", category: "supplies", stock: 420, min: 200, exp: "—", batch: "—", status: "ok" },
    { name: "ECG electrodes", category: "supplies", stock: 18, min: 50, exp: "—", batch: "—", status: "low" },
    { name: "Metformin 500mg", category: "medication", stock: 8, min: 30, exp: "Dec 2026", batch: "MTF-2023-12", status: "critical" },
    { name: "Surgical gloves (M)", category: "supplies", stock: 1200, min: 500, exp: "—", batch: "—", status: "ok" },
    { name: "Insulin glargine 100U", category: "medication", stock: 14, min: 10, exp: "Jul 2026", batch: "INS-2025-01", status: "expiring" },
  ];
  const ss = {
    ok: { c: "badge-success", l: "In stock" },
    low: { c: "badge-warning", l: "Low" },
    critical: { c: "badge-danger", l: "Critical" },
    expiring: { c: "badge-warning", l: "Expiring soon" },
  };
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="h1">{t.inventory}</h1>
          <p>284 items tracked · 3 below threshold · 2 expiring within 60 days</p>
        </div>
        <div className="row gap-12">
          <button className="btn btn-outline btn-sm"><Icon name="alert" size={13}/> Reorder list</button>
          <button className="btn btn-accent btn-sm" onClick={() => window.openModal && window.openModal("inventory")}><Icon name="plus" size={13}/> Add item</button>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCardSimple label="Total items" value="284" icon="box" color=""/>
        <KpiCardSimple label="Low stock" value="12" icon="alert" color="warn"/>
        <KpiCardSimple label="Critical" value="3" icon="alert" color="warn"/>
        <KpiCardSimple label="Expiring soon" value="8" icon="clock" color="warn"/>
      </div>

      <div className="card">
        <div className="section-header">
          <h2 className="h2"><Icon name="box" size={16}/> Stock levels</h2>
          <div className="row gap-12">
            <button className="btn btn-outline btn-sm"><Icon name="filter" size={13}/> All categories</button>
            <button className="btn btn-outline btn-sm">All branches</button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th><th>Category</th><th>Stock</th><th>Min level</th><th>Batch</th><th>Expiry</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => {
              const s = ss[it.status];
              const pct = Math.min(100, (it.stock / Math.max(it.min * 3, 1)) * 100);
              const barColor = it.status === "critical" ? "var(--danger)" : it.status === "low" ? "var(--warning)" : "var(--olive-500)";
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{it.name}</td>
                  <td><span className="badge">{it.category}</span></td>
                  <td>
                    <div className="row gap-12" style={{ alignItems: "center" }}>
                      <span className="tabular" style={{ fontWeight: 600, minWidth: 32 }}>{it.stock}</span>
                      <div style={{ flex: 1, height: 6, background: "var(--muted)", borderRadius: 3, overflow: "hidden", maxWidth: 80 }}>
                        <div style={{ height: "100%", width: pct + "%", background: barColor }}/>
                      </div>
                    </div>
                  </td>
                  <td className="muted tabular" style={{ fontSize: 12 }}>{it.min}</td>
                  <td className="muted tabular" style={{ fontSize: 11 }}>{it.batch}</td>
                  <td className="muted tabular" style={{ fontSize: 12 }}>{it.exp}</td>
                  <td><span className={"badge " + s.c}>{s.l}</span></td>
                  <td><Icon name="chevron_right" size={14} className="muted"/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============= STAFF & BRANCHES =============
const StaffScreen = ({ t, lang }) => {
  const staff = [
    { name: "Dr. Karim Lahlou", role: "doctor", specialty: "Cardiology", branch: "Casablanca Main", status: "active", appts: 14 },
    { name: "Dr. Salma Idrissi", role: "doctor", specialty: "General Practice", branch: "Casablanca Main", status: "active", appts: 9 },
    { name: "Dr. Mehdi Khalil", role: "doctor", specialty: "Pediatrics", branch: "Rabat Branch", status: "active", appts: 12 },
    { name: "Nadia Berrada", role: "secretary", specialty: "—", branch: "Casablanca Main", status: "active", appts: "—" },
    { name: "Yasmine Hilali", role: "secretary", specialty: "—", branch: "Rabat Branch", status: "active", appts: "—" },
    { name: "Houda Saidi", role: "nurse", specialty: "—", branch: "Casablanca Main", status: "active", appts: "—" },
    { name: "Omar Tazi", role: "accountant", specialty: "—", branch: "Casablanca Main", status: "active", appts: "—" },
  ];
  const roleColor = {
    doctor: "badge-navy",
    secretary: "badge-olive",
    nurse: "badge-info",
    accountant: "badge",
    admin: "badge-warning",
  };
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="h1">{t.staff}</h1>
          <p>2 branches · 7 staff members · 3 doctors active</p>
        </div>
        <div className="row gap-12">
          <button className="btn btn-outline btn-sm" onClick={() => window.openModal && window.openModal("branch")}><Icon name="plus" size={13}/> Add branch</button>
          <button className="btn btn-accent btn-sm" onClick={() => window.openModal && window.openModal("staff")}><Icon name="plus" size={13}/> Invite member</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {[
          { name: "Casablanca Main", code: "CASA-001", phone: "+212 5 22 12 34 56", addr: "Boulevard Mohammed V, Casablanca", main: true, staff: 5, today: 14 },
          { name: "Rabat Branch", code: "RBT-002", phone: "+212 5 37 88 99 00", addr: "Avenue Hassan II, Rabat", main: false, staff: 2, today: 12 },
        ].map((b, i) => (
          <div key={i} className="card card-pad">
            <div className="row gap-12" style={{ marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: b.main ? "var(--navy-900)" : "var(--olive-600)", color: "white", display: "grid", placeItems: "center" }}>
                <Icon name="building" size={20}/>
              </div>
              <div style={{ flex: 1 }}>
                <div className="row gap-12">
                  <h3 className="h3">{b.name}</h3>
                  {b.main && <span className="badge badge-olive">Main</span>}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>{b.code}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm"><Icon name="edit" size={13}/></button>
            </div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
              <Icon name="map_pin" size={12}/> {b.addr}
            </div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
              <Icon name="phone" size={12}/> {b.phone}
            </div>
            <div className="row gap-24" style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              <div>
                <div className="muted" style={{ fontSize: 11 }}>Staff</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{b.staff}</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 11 }}>Today's appts</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{b.today}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-header">
          <h2 className="h2"><Icon name="users" size={16}/> Staff members</h2>
          <button className="btn btn-outline btn-sm"><Icon name="filter" size={13}/> All roles</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Role</th><th>Specialty</th><th>Branch</th><th>Today</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, i) => (
              <tr key={i}>
                <td>
                  <div className="row gap-12">
                    <div className="avatar" style={{ background: s.role === "doctor" ? "var(--navy-700)" : "var(--olive-600)" }}>
                      {s.name.replace("Dr. ", "").split(" ").map(p => p[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                    </div>
                  </div>
                </td>
                <td><span className={"badge " + roleColor[s.role]}>{s.role}</span></td>
                <td className="muted" style={{ fontSize: 12 }}>{s.specialty}</td>
                <td className="muted" style={{ fontSize: 12 }}>{s.branch}</td>
                <td className="tabular">{s.appts}</td>
                <td><span className="badge badge-success"><span className="dot"/>Active</span></td>
                <td><Icon name="chevron_right" size={14} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============= FOLLOW-UP CALLS =============
const FollowUpScreen = ({ t, lang }) => {
  const calls = [
    { name: "Omar Chraibi", phone: "+212 6 67 99 88 77", appt: "May 6 · 14:00", reason: "ECG review", attempts: 1, max: 3, status: "pending", lastTry: "Yesterday 16:20" },
    { name: "Latifa Ouazzani", phone: "+212 6 68 12 34 56", appt: "May 6 · 14:30", reason: "Stress test", attempts: 2, max: 3, status: "no_answer", lastTry: "Today 09:15" },
    { name: "Karim Sabri", phone: "+212 6 69 87 65 43", appt: "May 6 · 15:30", reason: "HTN follow-up", attempts: 0, max: 3, status: "pending", lastTry: "—" },
    { name: "Nadia Filali", phone: "+212 6 60 11 22 33", appt: "May 6 · 16:00", reason: "Palpitations", attempts: 1, max: 3, status: "rescheduled", lastTry: "Today 10:30" },
    { name: "Youssef Bennani", phone: "+212 6 11 22 33 44", appt: "May 7 · 09:00", reason: "Follow-up", attempts: 0, max: 3, status: "pending", lastTry: "—" },
    { name: "Sara Tazi", phone: "+212 6 22 33 44 55", appt: "May 7 · 10:30", reason: "Lab review", attempts: 3, max: 3, status: "wrong_number", lastTry: "Today 11:00" },
  ];
  const ss = {
    pending: { c: "badge-warning", l: "Pending" },
    no_answer: { c: "badge", l: "No answer" },
    completed: { c: "badge-success", l: "Confirmed" },
    rescheduled: { c: "badge-info", l: "Rescheduled" },
    wrong_number: { c: "badge-danger", l: "Wrong #" },
  };
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="h1">{t.follow_up}</h1>
          <p>Patients who didn't confirm via WhatsApp · 5 calls in queue · 2 needing reattempt</p>
        </div>
        <div className="row gap-12">
          <button className="btn btn-outline btn-sm"><Icon name="whatsapp" size={13}/> Re-send WhatsApp</button>
          <button className="btn btn-accent btn-sm"><Icon name="phone" size={13}/> Start calling</button>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCardSimple label="In queue" value="5" icon="phone" color="warn"/>
        <KpiCardSimple label="No answer (retry)" value="2" icon="alert" color="warn"/>
        <KpiCardSimple label="Confirmed today" value="11" icon="check" color="success"/>
        <KpiCardSimple label="Avg. attempts" value="1.4" icon="clock" color=""/>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="section-header">
            <h2 className="h2"><Icon name="phone" size={16}/> Call queue</h2>
            <span className="muted" style={{ fontSize: 12 }}>Sorted by appointment time</span>
          </div>
          <div style={{ padding: 8 }}>
            {calls.map((c, i) => {
              const s = ss[c.status];
              return (
                <div key={i} style={{ padding: 14, marginBottom: 6, border: "1px solid var(--border)", borderRadius: 8, background: c.status === "pending" ? "var(--surface)" : "var(--muted)" }}>
                  <div className="row gap-12" style={{ alignItems: "flex-start" }}>
                    <div className="avatar avatar-md" style={{ background: "var(--navy-700)" }}>{c.name.split(" ").map(p => p[0]).join("")}</div>
                    <div style={{ flex: 1 }}>
                      <div className="row gap-12">
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <span className={"badge " + s.c}>{s.l}</span>
                      </div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                        {c.appt} · {c.reason}
                      </div>
                      <div className="row gap-12" style={{ marginTop: 8, fontSize: 11 }}>
                        <span className="muted"><Icon name="phone" size={11}/> {c.phone}</span>
                        <span className="muted">·</span>
                        <span className="muted">Attempts: <span className="tabular" style={{ fontWeight: 600, color: c.attempts >= c.max ? "var(--danger)" : "var(--fg)" }}>{c.attempts}/{c.max}</span></span>
                        <span className="muted">·</span>
                        <span className="muted">Last try: {c.lastTry}</span>
                      </div>
                    </div>
                    <div className="row gap-12">
                      <button className="btn btn-outline btn-sm btn-icon"><Icon name="msg" size={13}/></button>
                      <button className="btn btn-accent btn-sm"><Icon name="phone" size={13}/> Call now</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <h2 className="h2"><Icon name="file_text" size={16}/> Call script</h2>
          </div>
          <div style={{ padding: 16 }}>
            <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>For confirmation</div>
            <div style={{ padding: 12, background: "var(--muted)", borderRadius: 8, fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
              "Bonjour, je vous appelle de la part du Dr. Lahlou pour confirmer votre rendez-vous demain à 14h00. Pourrez-vous être présent ?"
            </div>
            <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Quick outcomes</div>
            <div className="col gap-12">
              {[
                { l: "Confirmed by patient", c: "badge-success" },
                { l: "Wants to reschedule", c: "badge-info" },
                { l: "No answer — will retry", c: "badge-warning" },
                { l: "Wrong number", c: "badge-danger" },
                { l: "Patient cancelled", c: "badge" },
              ].map((o, i) => (
                <button key={i} className="btn btn-outline" style={{ justifyContent: "flex-start", height: 38 }}>
                  <span className={"badge " + o.c}>{o.l}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= SETTINGS =============
const SettingsScreen = ({ t, lang }) => {
  const [section, setSection] = React.useState("general");
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="h1">{t.settings}</h1>
          <p>Cabinet Dr. Lahlou · Professional plan · Renews Sep 14, 2026</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 8, alignSelf: "flex-start" }}>
          {[
            { id: "general", l: "General", i: "settings" },
            { id: "branding", l: "Branding", i: "sparkle" },
            { id: "billing", l: "Subscription", i: "coin" },
            { id: "whatsapp", l: "WhatsApp Cloud", i: "whatsapp" },
            { id: "schedule", l: "Working hours", i: "clock" },
            { id: "security", l: "Security & 2FA", i: "alert" },
            { id: "data", l: "Data & GDPR", i: "file_text" },
          ].map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={"btn " + (section === s.id ? "btn-primary" : "btn-ghost")}
              style={{ width: "100%", justifyContent: "flex-start", marginBottom: 2 }}>
              <Icon name={s.i} size={14}/> {s.l}
            </button>
          ))}
        </div>

        <div className="card card-pad">
          {section === "general" && (
            <>
              <h2 className="h2" style={{ marginBottom: 4 }}>General</h2>
              <p className="muted" style={{ fontSize: 12, marginBottom: 20 }}>Clinic information used across documents and patient communication.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><div className="label">Clinic name</div><input defaultValue="Cabinet Dr. Lahlou"/></div>
                <div><div className="label">Slug</div><input defaultValue="cabinet-lahlou" readOnly style={{ background: "var(--muted)" }}/></div>
                <div><div className="label">License #</div><input defaultValue="MA-CL-08214"/></div>
                <div><div className="label">Tax #</div><input defaultValue="40282841"/></div>
                <div><div className="label">Phone</div><input defaultValue="+212 5 22 12 34 56"/></div>
                <div><div className="label">Email</div><input defaultValue="contact@cabinet-lahlou.ma"/></div>
                <div style={{ gridColumn: "1 / -1" }}><div className="label">Address</div><input defaultValue="Boulevard Mohammed V, Casablanca, Maroc"/></div>
                <div><div className="label">Country</div><select defaultValue="MA"><option value="MA">Morocco</option><option>France</option><option>Tunisia</option></select></div>
                <div><div className="label">Currency</div><select defaultValue="MAD"><option>MAD</option><option>EUR</option><option>USD</option></select></div>
                <div><div className="label">Timezone</div><select defaultValue="Africa/Casablanca"><option>Africa/Casablanca</option><option>Europe/Paris</option></select></div>
                <div><div className="label">Default locale</div><select defaultValue="fr-MA"><option value="fr-MA">Français (MA)</option><option value="ar-MA">عربية (MA)</option><option value="en-US">English</option></select></div>
              </div>
              <div className="row gap-12" style={{ marginTop: 24 }}>
                <button className="btn btn-accent">Save changes</button>
                <button className="btn btn-ghost">Cancel</button>
              </div>
            </>
          )}
          {section === "whatsapp" && (
            <>
              <h2 className="h2" style={{ marginBottom: 4 }}>WhatsApp Cloud API</h2>
              <p className="muted" style={{ fontSize: 12, marginBottom: 20 }}>Send appointment reminders, confirmations, prescriptions and lab results to patients.</p>
              <div className="card card-pad" style={{ background: "var(--olive-50)", borderColor: "var(--olive-100)", marginBottom: 20 }}>
                <div className="row gap-12">
                  <Icon name="check" size={16} style={{ color: "var(--olive-700)" }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--olive-700)" }}>Connected</div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>Phone: +212 6 12 34 56 78 · 1,847 messages this month</div>
                  </div>
                  <button className="btn btn-outline btn-sm">Disconnect</button>
                </div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  ["Appointment reminders (24h before)", true],
                  ["Confirmation requests with link", true],
                  ["Prescription delivery", true],
                  ["Lab results delivery", true],
                  ["Invoice delivery", false],
                  ["Birthday wishes", false],
                ].map(([l, on], i) => (
                  <div key={i} className="row gap-12" style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8 }}>
                    <Icon name="msg" size={14} className="muted"/>
                    <div style={{ flex: 1, fontSize: 13 }}>{l}</div>
                    <div style={{ width: 36, height: 20, borderRadius: 999, background: on ? "var(--olive-600)" : "var(--border-strong)", padding: 2, cursor: "pointer" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 50, background: "white", marginLeft: on ? 16 : 0, transition: "all 150ms" }}/>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {section === "billing" && (
            <>
              <h2 className="h2" style={{ marginBottom: 4 }}>Subscription</h2>
              <p className="muted" style={{ fontSize: 12, marginBottom: 20 }}>Plan, usage and invoices.</p>
              <div className="card card-pad" style={{ background: "linear-gradient(135deg, var(--navy-900), var(--navy-700))", color: "white", marginBottom: 20, borderColor: "transparent" }}>
                <div className="row gap-12">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.04em" }}>Current plan</div>
                    <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>Professional</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Renews September 14, 2026 · 890 MAD/month</div>
                  </div>
                  <button className="btn btn-accent btn-sm">Upgrade to Enterprise</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { l: "Users", u: 7, m: 15 },
                  { l: "Branches", u: 2, m: 3 },
                  { l: "Storage", u: 340, m: 2000, unit: "MB" },
                ].map((u, i) => (
                  <div key={i} className="card card-pad">
                    <div className="muted" style={{ fontSize: 11 }}>{u.l}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }} className="tabular">{u.u} <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>/ {u.m} {u.unit || ""}</span></div>
                    <div style={{ height: 4, background: "var(--muted)", borderRadius: 2, marginTop: 8 }}>
                      <div style={{ height: "100%", width: (u.u / u.m * 100) + "%", background: "var(--olive-500)", borderRadius: 2 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {!["general", "whatsapp", "billing"].includes(section) && (
            <>
              <h2 className="h2" style={{ marginBottom: 4 }}>{section.charAt(0).toUpperCase() + section.slice(1)}</h2>
              <p className="muted" style={{ fontSize: 12, marginBottom: 20 }}>Configuration for {section}.</p>
              <div style={{ padding: 40, textAlign: "center", border: "1px dashed var(--border-strong)", borderRadius: 8 }}>
                <Icon name="settings" size={28} className="muted"/>
                <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>Detailed {section} settings — same form pattern as General.</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

window.ConsultationScreen = ConsultationScreen;
window.LabsScreen = LabsScreen;
window.InvoicesScreen = InvoicesScreen;
window.InventoryScreen = InventoryScreen;
window.StaffScreen = StaffScreen;
window.FollowUpScreen = FollowUpScreen;
window.SettingsScreen = SettingsScreen;
window.KpiCardSimple = KpiCardSimple;
