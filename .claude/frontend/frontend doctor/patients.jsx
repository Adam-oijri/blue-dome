// Patient profile + Patient list + Calendar + Rx writer

const PatientList = ({ t, lang, openPatient }) => (
  <div className="page fade-in">
    <div className="page-header">
      <div>
        <h1 className="h1">{t.patients}</h1>
        <p>{MOCK.patients.length * 247} active patients across 2 branches</p>
      </div>
      <div className="row gap-12">
        <button className="btn btn-outline btn-sm"><Icon name="download" size={13}/> Export</button>
        <button className="btn btn-accent btn-sm" onClick={() => window.openModal && window.openModal("patient")}><Icon name="plus" size={13}/> New patient</button>
      </div>
    </div>

    <div className="card">
      <div className="section-header" style={{ gap: 12 }}>
        <div className="search-box" style={{ maxWidth: 360 }}>
          <Icon name="search" size={16}/>
          <input placeholder="Search by name, phone, ID…"/>
        </div>
        <div className="row gap-12">
          <button className="btn btn-outline btn-sm"><Icon name="filter" size={13}/> All branches</button>
          <button className="btn btn-outline btn-sm">All insurance</button>
          <button className="btn btn-outline btn-sm">All conditions</button>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>{t.patients}</th>
            <th>{t.patient_id}</th>
            <th>{t.age}</th>
            <th>{t.blood_type}</th>
            <th>{t.phone}</th>
            <th>{t.insurance}</th>
            <th>{t.last_visit}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {MOCK.patients.map(p => (
            <tr key={p.id} onClick={() => openPatient(p)}>
              <td>
                <div className="row gap-12">
                  <div className="avatar" style={{ background: p.gender === "male" ? "var(--navy-700)" : "var(--olive-600)" }}>
                    {p.name.en.split(" ").map(s => s[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.name[lang]}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{p.gender === "male" ? t.male : t.female}</div>
                  </div>
                  {p.flag === "new" && <span className="badge badge-olive">New</span>}
                  {p.flag === "chronic" && <span className="badge badge-warning">Chronic</span>}
                </div>
              </td>
              <td className="muted tabular" style={{ fontSize: 12 }}>{p.id}</td>
              <td className="tabular">{p.age}</td>
              <td><span className="badge badge-danger" style={{ background: "rgba(185,28,28,0.08)", border: "1px solid rgba(185,28,28,0.18)" }}>{p.blood}</span></td>
              <td className="muted tabular" style={{ fontSize: 12 }}>{p.phone}</td>
              <td className="muted" style={{ fontSize: 12 }}>{p.insurance}</td>
              <td className="muted tabular" style={{ fontSize: 12 }}>{p.last_visit}</td>
              <td><Icon name="chevron_right" size={14} className="muted"/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PatientProfile = ({ t, lang, patient, back }) => {
  const [tab, setTab] = React.useState("overview");
  const p = patient || MOCK.patients[0];
  return (
    <div className="page fade-in">
      <div className="row gap-12" style={{ marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={back}><Icon name="chevron_left" size={14}/> {t.patients}</button>
        <span className="muted">/</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name[lang]}</span>
      </div>

      <div className="profile-header">
        <div className="avatar avatar-lg" style={{ background: "var(--olive-600)" }}>
          {p.name.en.split(" ").map(s => s[0]).join("")}
        </div>
        <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
          <div className="row gap-12">
            <h1 className="profile-name">{p.name[lang]}</h1>
            {p.flag === "chronic" && <span className="badge badge-warning">Chronic care</span>}
          </div>
          <div className="profile-meta">
            <span><Icon name="user" size={13}/> {p.age} · {p.gender === "male" ? t.male : t.female}</span>
            <span><Icon name="droplet" size={13}/> {p.blood}</span>
            <span><Icon name="phone" size={13}/> {p.phone}</span>
            <span style={{ opacity: 0.7 }}>· {p.id}</span>
          </div>
        </div>
        <div className="row gap-12" style={{ position: "relative", zIndex: 1, alignSelf: "flex-start" }}>
          <button className="btn btn-outline btn-sm" style={{ background: "rgba(255,255,255,0.08)", color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
            <Icon name="edit" size={13}/> Edit
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => window.openModal && window.openModal("patient")}>
            <Icon name="plus" size={13}/> New visit
          </button>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          {[
            ["overview", t.overview],
            ["history", t.medical_history],
            ["visits", t.visits],
            ["rx", t.rx],
            ["labs", t.labs],
            ["billing", t.billing],
          ].map(([id, label]) => (
            <button key={id} className={"tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Vitals snapshot */}
            <div>
              <h3 className="h3" style={{ marginBottom: 14 }}>{t.vital_signs} <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>· last recorded today 09:50</span></h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { l: "BP", v: "138/86", u: "mmHg", c: "warning" },
                  { l: "Heart rate", v: "78", u: "bpm", c: "" },
                  { l: "Temperature", v: "36.7", u: "°C", c: "" },
                  { l: "SpO₂", v: "98", u: "%", c: "" },
                  { l: "Weight", v: "82.5", u: "kg", c: "" },
                  { l: "BMI", v: "27.4", u: "", c: "warning" },
                ].map((v, i) => (
                  <div key={i} style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8 }}>
                    <div className="muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>{v.l}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
                      <span style={{ fontSize: 18, fontWeight: 600, color: v.c === "warning" ? "var(--warning)" : "var(--fg)" }} className="tabular">{v.v}</span>
                      <span className="muted" style={{ fontSize: 11 }}>{v.u}</span>
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="h3" style={{ margin: "20px 0 10px" }}>{t.allergies}</h3>
              <div className="row gap-12" style={{ flexWrap: "wrap" }}>
                <span className="badge badge-danger">Penicillin</span>
                <span className="badge badge-danger">Aspirin</span>
                <span className="badge">Pollen (seasonal)</span>
              </div>
              <h3 className="h3" style={{ margin: "20px 0 10px" }}>{t.chronic_diseases}</h3>
              <div className="row gap-12" style={{ flexWrap: "wrap" }}>
                <span className="badge badge-warning">Hypertension (since 2019)</span>
                <span className="badge badge-warning">Hyperlipidemia</span>
              </div>
              <h3 className="h3" style={{ margin: "20px 0 10px" }}>{t.current_meds}</h3>
              <div className="col gap-12">
                {[
                  { n: "Atorvastatin", d: "20mg · 1× daily · evening" },
                  { n: "Amlodipine", d: "5mg · 1× daily · morning" },
                  { n: "Aspirin", d: "75mg · 1× daily" },
                ].map((m, i) => (
                  <div key={i} className="row gap-12" style={{ padding: "8px 12px", background: "var(--muted)", borderRadius: 6 }}>
                    <Icon name="pill" size={14} className="muted"/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{m.n}</div>
                      <div className="muted" style={{ fontSize: 11 }}>{m.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: history + appointments */}
            <div>
              <h3 className="h3" style={{ marginBottom: 14 }}>{t.medical_history}</h3>
              <div style={{ position: "relative", paddingLeft: 22, borderLeft: "2px solid var(--border)" }}>
                {[
                  { date: "May 5, 2026", title: "Follow-up consultation", who: "Dr. Lahlou", desc: "BP slightly elevated, adjusted Amlodipine dose to 10mg.", color: "olive" },
                  { date: "Apr 22, 2026", title: "Lipid panel results", who: "Lab Biocenter", desc: "LDL 162 mg/dL — borderline high. Statin continued.", color: "warn" },
                  { date: "Mar 15, 2026", title: "Annual checkup", who: "Dr. Lahlou", desc: "ECG normal. BMI 27.4 — counseled on diet.", color: "" },
                  { date: "Jan 8, 2026", title: "Echocardiogram", who: "Dr. Idrissi (referral)", desc: "Mild LV hypertrophy, EF 58%. Recheck in 6 months.", color: "" },
                  { date: "Oct 10, 2025", title: "ER visit — chest pain", who: "Hôpital Cheikh Zaid", desc: "Ruled out MI. Discharged with cardiology follow-up.", color: "danger" },
                ].map((h, i) => (
                  <div key={i} style={{ paddingBottom: 16, position: "relative" }}>
                    <div style={{
                      position: "absolute", left: -28, top: 4, width: 12, height: 12, borderRadius: 50,
                      background: h.color === "olive" ? "var(--olive-500)" : h.color === "warn" ? "var(--warning)" : h.color === "danger" ? "var(--danger)" : "var(--navy-500)",
                      border: "2px solid white", boxShadow: "0 0 0 2px var(--border)"
                    }}/>
                    <div className="muted" style={{ fontSize: 11 }}>{h.date}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{h.title}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{h.who}</div>
                    <div style={{ fontSize: 12, marginTop: 4, color: "var(--fg-soft)" }}>{h.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab !== "overview" && (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div className="muted" style={{ fontSize: 13 }}>The {tab} tab — content scaffolds available, click around the other tabs to explore.</div>
          </div>
        )}
      </div>
    </div>
  );
};

window.PatientList = PatientList;
window.PatientProfile = PatientProfile;
