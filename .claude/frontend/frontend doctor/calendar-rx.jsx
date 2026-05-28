// Calendar (week view) + Prescription Writer

const Calendar = ({ t, lang, openPatient }) => {
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const dates = [4,5,6,7,8,9,10];
  const today = 1; // Tuesday
  const hours = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

  // Pre-place events
  const events = [
    { day: 0, hour: 1, span: 1, name: "M. Tahiri", reason: "Follow-up", color: "" },
    { day: 0, hour: 3, span: 1, name: "S. Bennis", reason: "Consultation", color: "olive" },
    { day: 1, hour: 0, span: 0.5, name: "H. El Amrani", reason: "Follow-up", color: "" },
    { day: 1, hour: 1, span: 1, name: "F. Bennani", reason: "Echo review", color: "olive" },
    { day: 1, hour: 1.75, span: 1, name: "Y. Tazi", reason: "Chest pain", color: "warn" },
    { day: 1, hour: 3, span: 0.5, name: "M. Saidi", reason: "Pre-op", color: "" },
    { day: 1, hour: 6, span: 1, name: "L. Ouazzani", reason: "Stress test", color: "olive" },
    { day: 2, hour: 1, span: 1, name: "K. Sabri", reason: "Follow-up", color: "" },
    { day: 2, hour: 2, span: 1, name: "N. Filali", reason: "Palpitations", color: "olive" },
    { day: 2, hour: 6, span: 1, name: "T. Berrada", reason: "Consultation", color: "" },
    { day: 3, hour: 0, span: 1, name: "A. Berrada", reason: "Arrhythmia", color: "olive" },
    { day: 3, hour: 2, span: 0.5, name: "K. Mansouri", reason: "Refill", color: "" },
    { day: 3, hour: 6, span: 1.5, name: "Z. Hilali", reason: "New patient", color: "warn" },
    { day: 4, hour: 1, span: 1, name: "O. Chraibi", reason: "ECG", color: "" },
    { day: 4, hour: 4, span: 1, name: "Lunch break", reason: "", color: "block" },
    { day: 4, hour: 6, span: 1, name: "S. Idrissi", reason: "Lab review", color: "olive" },
    { day: 5, hour: 1, span: 1, name: "H. Senhaji", reason: "Follow-up", color: "" },
    { day: 5, hour: 2, span: 1, name: "M. Kettani", reason: "Consultation", color: "olive" },
  ];

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="h1">{t.appointments}</h1>
          <p>Week of May 4 – 10, 2026 · 12 appointments</p>
        </div>
        <div className="row gap-12">
          <div className="row" style={{ background: "var(--muted)", padding: 3, borderRadius: 6 }}>
            <button className="btn btn-ghost btn-sm">{t.day}</button>
            <button className="btn btn-sm" style={{ background: "white", boxShadow: "var(--shadow-sm)" }}>{t.week}</button>
            <button className="btn btn-ghost btn-sm">{t.month}</button>
          </div>
          <button className="btn btn-outline btn-sm">{t.today}</button>
          <button className="btn btn-outline btn-icon btn-sm"><Icon name="chevron_left" size={14}/></button>
          <button className="btn btn-outline btn-icon btn-sm"><Icon name="chevron_right" size={14}/></button>
          <button className="btn btn-accent btn-sm" onClick={() => window.openModal && window.openModal("appointment")}><Icon name="plus" size={13}/> {t.new_appointment}</button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="cal-head"></div>
        {days.map((d, i) => (
          <div key={d} className="cal-head">
            {t[d]}
            <div className={"cal-day-num" + (i === today ? " today" : "")}>{dates[i]}</div>
          </div>
        ))}

        {hours.map((h, hi) => (
          <React.Fragment key={h}>
            <div className="cal-time">{h}</div>
            {days.map((d, di) => {
              const cellEvents = events.filter(e => e.day === di && Math.floor(e.hour) === hi);
              return (
                <div key={d + h} className="cal-cell">
                  {cellEvents.map((e, ei) => {
                    const offsetTop = (e.hour - Math.floor(e.hour)) * 50;
                    const height = e.span * 50 - 2;
                    if (e.color === "block") {
                      return (
                        <div key={ei} style={{
                          position: "absolute", left: 2, right: 2, top: offsetTop, height,
                          background: "repeating-linear-gradient(45deg, var(--muted), var(--muted) 6px, white 6px, white 12px)",
                          border: "1px dashed var(--border-strong)", borderRadius: 4,
                          fontSize: 10, color: "var(--muted-fg)", padding: 4
                        }}>{e.name}</div>
                      );
                    }
                    return (
                      <div key={ei} className={"cal-event " + e.color} style={{
                        position: "absolute", left: 2, right: 2, top: offsetTop, height,
                      }}>
                        {e.name}
                        <small>{e.reason}</small>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const RxWriter = ({ t, lang }) => {
  const [items, setItems] = React.useState([
    { med: "Amlodipine 5mg", dose: "1 tablet", freq: "Once daily", duration: "30 days", route: "oral" },
    { med: "Atorvastatin 20mg", dose: "1 tablet", freq: "At bedtime", duration: "30 days", route: "oral" },
  ]);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="h1">{t.new_rx}</h1>
          <p>For Hassan El Amrani · P-002841 · 58y · A+</p>
        </div>
        <div className="row gap-12">
          <button className="btn btn-outline btn-sm"><Icon name="print" size={13}/> Print</button>
          <button className="btn btn-accent btn-sm"><Icon name="whatsapp" size={13}/> {t.save_send}</button>
        </div>
      </div>

      <div className="two-col">
        <div className="card card-pad">
          <h2 className="h2" style={{ marginBottom: 16 }}>Medications</h2>

          <div className="rx-line" style={{ background: "var(--muted)", borderStyle: "dashed", padding: 10 }}>
            <div className="row gap-12" style={{ gridColumn: "1 / -1" }}>
              <Icon name="search" size={16} className="muted"/>
              <input style={{ border: "none", background: "transparent", padding: 0, height: 32 }}
                placeholder="Search medication: trade name, generic, ATC code..."/>
              <button className="btn btn-outline btn-sm"><Icon name="alert" size={13}/> Allergy check</button>
            </div>
          </div>

          {items.map((rx, i) => (
            <div key={i} className="rx-line">
              <div>
                <div className="label">{t.medication}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{rx.med}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>oral · tablet</div>
              </div>
              <div>
                <div className="label">{t.dosage}</div>
                <input value={rx.dose} onChange={e => {
                  const next = [...items]; next[i] = { ...next[i], dose: e.target.value }; setItems(next);
                }}/>
              </div>
              <div>
                <div className="label">{t.frequency}</div>
                <select value={rx.freq} onChange={e => {
                  const next = [...items]; next[i] = { ...next[i], freq: e.target.value }; setItems(next);
                }}>
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>Every 8 hours</option>
                  <option>At bedtime</option>
                </select>
              </div>
              <div>
                <div className="label">{t.duration}</div>
                <input value={rx.duration} onChange={e => {
                  const next = [...items]; next[i] = { ...next[i], duration: e.target.value }; setItems(next);
                }}/>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                <Icon name="x" size={14}/>
              </button>
            </div>
          ))}

          <button className="btn btn-outline" style={{ width: "100%", marginTop: 8 }}
            onClick={() => setItems([...items, { med: "", dose: "", freq: "", duration: "", route: "oral" }])}>
            <Icon name="plus" size={14}/> Add medication
          </button>

          <div style={{ marginTop: 24 }}>
            <div className="label">Diagnosis</div>
            <input defaultValue="I10 — Essential (primary) hypertension"/>
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="label">Notes for patient</div>
            <textarea rows={3} placeholder="Any special instructions..."
              defaultValue="Take with food. Monitor BP twice daily and log readings. Return in 4 weeks."/>
          </div>
        </div>

        {/* Right: prescription preview */}
        <div className="col gap-16">
          <div className="card" style={{ padding: 20, background: "white", border: "1px solid var(--border-strong)" }}>
            <div style={{ borderBottom: "2px solid var(--navy-900)", paddingBottom: 10, marginBottom: 12 }}>
              <div className="row gap-12">
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--navy-900)", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>BD</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Cabinet Dr. Lahlou</div>
                  <div className="muted" style={{ fontSize: 10 }}>Cardiology · Casablanca</div>
                </div>
              </div>
            </div>
            <div className="muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Prescription</div>
            <div style={{ fontSize: 11, marginBottom: 12 }}>
              <div><strong>Patient:</strong> Hassan El Amrani · 58y</div>
              <div><strong>Date:</strong> May 5, 2026</div>
              <div><strong>RX#:</strong> RX-2026-04812</div>
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.6 }}>
              {items.map((rx, i) => rx.med && (
                <div key={i} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: i < items.length-1 ? "1px dashed var(--border)" : "none" }}>
                  <div style={{ fontWeight: 600 }}>℞ {rx.med}</div>
                  <div className="muted">{rx.dose} · {rx.freq} · {rx.duration}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 10, borderTop: "1px dashed var(--border)", fontSize: 10 }} className="muted">
              Dr. Karim Lahlou · License MA-CD-1842
            </div>
          </div>

          {/* Drug interaction */}
          <div className="card" style={{ padding: 16, background: "var(--warning-bg)", border: "1px solid #fcd34d" }}>
            <div className="row gap-12" style={{ alignItems: "flex-start" }}>
              <Icon name="alert" size={16} className="muted" style={{ color: "var(--warning)", flexShrink: 0, marginTop: 2 }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--warning)" }}>Minor interaction</div>
                <div style={{ fontSize: 12, marginTop: 4, color: "#78350f" }}>Atorvastatin + Amlodipine: monitor for muscle pain. Both prescribed at recommended doses — proceed with caution.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Calendar = Calendar;
window.RxWriter = RxWriter;
