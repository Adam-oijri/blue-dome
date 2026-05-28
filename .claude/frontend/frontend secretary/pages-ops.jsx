// Pages — operations: Appointments, Patients, Walk-ins, WhatsApp, Follow-ups

// ---------- shared mock data ----------
const APPT_DATA = [
  { time: "09:00", patient: "p1",  doctor: "d1", type: "appt_type_followup", dur: 30, status: "appt_status_completed" },
  { time: "09:30", patient: "p4",  doctor: "d2", type: "appt_type_consult",  dur: 30, status: "appt_status_completed" },
  { time: "10:00", patient: "p7",  doctor: "d1", type: "appt_type_consult",  dur: 30, status: "appt_status_completed" },
  { time: "10:30", patient: "p2",  doctor: "d2", type: "appt_type_followup", dur: 30, status: "appt_status_completed" },
  { time: "11:00", patient: "p9",  doctor: "d1", type: "appt_type_first",    dur: 45, status: "appt_status_in_progress" },
  { time: "11:00", patient: "p5",  doctor: "d2", type: "appt_type_consult",  dur: 30, status: "appt_status_arrived" },
  { time: "11:30", patient: "p4",  doctor: "d1", type: "appt_type_followup", dur: 30, status: "appt_status_confirmed" },
  { time: "12:00", patient: "p7",  doctor: "d2", type: "appt_type_checkup",  dur: 30, status: "appt_status_confirmed" },
  { time: "14:00", patient: "p8",  doctor: "d1", type: "appt_type_procedure",dur: 60, status: "appt_status_scheduled" },
  { time: "14:30", patient: "p3",  doctor: "d2", type: "appt_type_followup", dur: 30, status: "appt_status_confirmed" },
  { time: "15:00", patient: "p6",  doctor: "d1", type: "appt_type_consult",  dur: 30, status: "appt_status_confirmed" },
  { time: "15:30", patient: "p10", doctor: "d2", type: "appt_type_first",    dur: 45, status: "appt_status_scheduled" },
  { time: "16:00", patient: "p2",  doctor: "d1", type: "appt_type_followup", dur: 30, status: "appt_status_cancelled" },
  { time: "16:30", patient: "p5",  doctor: "d2", type: "appt_type_consult",  dur: 30, status: "appt_status_confirmed" },
];

const APPT_STATUS_PILL = {
  appt_status_scheduled:   "neutral",
  appt_status_confirmed:   "olive",
  appt_status_arrived:     "info",
  appt_status_in_progress: "info",
  appt_status_completed:   "success",
  appt_status_cancelled:   "danger",
  appt_status_no_show:     "danger",
};

// ---------- shared chrome ----------
function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <div className="sub">{subtitle}</div>
      </div>
      <div className="actions">{actions}</div>
    </header>
  );
}

function MiniCal({ month = "May 2026", today = 5, selected = 5 }) {
  // Show fixed May 2026 grid: starts Friday (May 1 = Fri)
  const days = [];
  // Apr tail: 28,29,30 (Mon, Tue, Wed) + 30 (Thu placeholder) — May 1 2026 is Fri
  const lead = ["Mon","Tue","Wed","Thu"]; // Apr 27..30
  const aprTail = [27,28,29,30];
  aprTail.forEach(d => days.push({d, muted: true}));
  for (let d = 1; d <= 31; d++) {
    days.push({ d, muted: false, today: d === today, selected: d === selected, mark: d % 3 === 0 });
  }
  // pad to 42
  let nx = 1;
  while (days.length < 42) days.push({ d: nx++, muted: true });

  const dows = ["M","T","W","T","F","S","S"];
  return (
    <div className="mini-cal">
      <div className="mc-head">
        <b>{month}</b>
        <button><IconChevronRight size={13} style={{transform:"rotate(180deg)"}} /></button>
        <button><IconChevronRight size={13} /></button>
      </div>
      <div className="mc-grid">
        {dows.map((d,i) => <div key={i} className="dow">{d}</div>)}
        {days.map((c, i) => (
          <div key={i} className={"mc-day" + (c.muted?" muted":"") + (c.today?" today":"") + (c.selected?" selected":"")}>
            {c.d}
            {!c.muted && c.mark && <span className="ind" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Appointments ----------
function PageAppointments() {
  const [filter, setFilter] = React.useState("today");
  return (
    <div className="page" data-screen-label="Appointments">
      <PageHeader
        title={t("appt_title")}
        subtitle={t("appt_subtitle")}
        actions={<>
          <button className="btn-secondary"><IconPrinter size={13} />{t("p_print")}</button>
          <button className="btn-secondary"><IconArchive size={13} />{t("p_export")}</button>
          <button className="tb-cta"><IconPlus size={15} />{t("new_appointment")}</button>
        </>}
      />

      <div className="kpi-row" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <KPI tint="navy"   icon={IconCalendar} label={t("appt_kpi_today")}     value="24" foot={t("kpi_today_sub", { done: 9, left: 15 })} trend="+3" trendDir="up" />
        <KPI tint="warn"   icon={IconClock}    label={t("appt_kpi_pending")}   value="7"  foot={window.__LANG==="fr"?"WhatsApp · sans réponse":window.__LANG==="ar"?"بدون رد واتساب":"Awaiting WhatsApp reply"} />
        <KPI tint="olive"  icon={IconCheck}    label={t("appt_kpi_confirmed")} value="14" foot={"58% " + (window.__LANG==="fr"?"des RDV":window.__LANG==="ar"?"من المواعيد":"of bookings")} />
        <KPI tint="danger" icon={IconX}        label={t("appt_kpi_cancelled")} value="6"  foot={"4.2% no-shows"} trend="-0.4%" trendDir="up" />
      </div>

      <div className="row-flex">
        <div className="col-280">
          <MiniCal />
        </div>

        <div className="col-grow">
          <div className="card">
            <div className="card-head">
              <div className="page-subhead" style={{flex:1}}>
                <div className="chips">
                  <button className={"chip" + (filter==="today"?" active":"")} onClick={() => setFilter("today")}>{t("appt_filter_today")} <span className="ct tabular">14</span></button>
                  <button className={"chip" + (filter==="tomorrow"?" active":"")} onClick={() => setFilter("tomorrow")}>{t("appt_filter_tomorrow")} <span className="ct tabular">10</span></button>
                  <button className={"chip" + (filter==="week"?" active":"")} onClick={() => setFilter("week")}>{t("appt_filter_week")} <span className="ct tabular">62</span></button>
                </div>
                <div className="search-input">
                  <span className="si-icon"><IconSearch size={14} /></span>
                  <input placeholder={t("p_search") + "…"} />
                </div>
              </div>
            </div>

            <table className="tbl">
              <thead>
                <tr>
                  <th style={{width:90}}>{t("appt_col_time")}</th>
                  <th>{t("appt_col_patient")}</th>
                  <th>{t("appt_col_doctor")}</th>
                  <th>{t("appt_col_type")}</th>
                  <th>{t("appt_col_duration")}</th>
                  <th>{t("appt_col_status")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {APPT_DATA.map((r, i) => {
                  const p = D.patient(r.patient);
                  const d = D.doctor(r.doctor);
                  return (
                    <tr key={i}>
                      <td className="num"><b>{r.time}</b></td>
                      <td>
                        <div className="wr-patient">
                          <Avatar patient={p} />
                          <div className="nm">
                            <b>{D.name(p)}</b>
                            <div className="meta">
                              <span className="tag-blood">{p.blood}</span>
                              {p.chronic && <span className="tag-chronic">{window.__LANG==="fr"?"Chronique":window.__LANG==="ar"?"مزمن":"Chronic"}</span>}
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
                      <td>{t(r.type)}</td>
                      <td className="num">{r.dur} {t("wr_min")}</td>
                      <td><span className={"pill " + APPT_STATUS_PILL[r.status]}><span className="pdot" />{t(r.status)}</span></td>
                      <td className="right">
                        <div className="wr-actions">
                          <button className="wr-action-btn">{t("p_view")}</button>
                          <button className="wr-action-btn ic-only"><IconMoreHoriz size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="tbl-foot">
              <span>{t("p_showing", { a: 1, b: APPT_DATA.length, n: APPT_DATA.length })}</span>
              <div className="pager">
                <button className="pgbtn"><IconChevronRight size={11} style={{transform:"rotate(180deg)"}} /></button>
                <button className="pgbtn active">1</button>
                <button className="pgbtn">2</button>
                <button className="pgbtn">3</button>
                <button className="pgbtn"><IconChevronRight size={11} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Patients ----------
function PagePatients() {
  const [filter, setFilter] = React.useState("all");
  const list = window.DATA.patients;
  return (
    <div className="page" data-screen-label="Patients">
      <PageHeader
        title={t("pat_title")}
        subtitle={t("pat_subtitle")}
        actions={<>
          <button className="btn-secondary"><IconArchive size={13} />{t("p_export")}</button>
          <button className="tb-cta"><IconUserPlus size={15} />{window.__LANG==="fr"?"Nouveau patient":window.__LANG==="ar"?"مريض جديد":"New patient"}</button>
        </>}
      />

      <div className="kpi-row" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <KPI tint="navy"  icon={IconUsers}    label={t("pat_kpi_total")}      value="3,248" foot={"+47 " + (window.__LANG==="fr"?"ce mois":window.__LANG==="ar"?"هذا الشهر":"this month")} trend="+1.5%" trendDir="up" />
        <KPI tint="olive" icon={IconUserPlus} label={t("pat_kpi_new_month")}  value="47"   foot={(window.__LANG==="fr"?"Inscrits":window.__LANG==="ar"?"تسجيل":"Registrations") + " · 30j"} />
        <KPI tint="warn"  icon={IconHeart}    label={t("pat_kpi_chronic")}    value="412" foot={"12.7% " + (window.__LANG==="fr"?"du registre":window.__LANG==="ar"?"من السجل":"of registry")} />
        <KPI tint="info"  icon={IconCalendar} label={t("pat_kpi_birthdays")}  value="9"   foot={window.__LANG==="fr"?"Envoyer un message?":window.__LANG==="ar"?"إرسال رسالة؟":"Send a message?"} />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="page-subhead" style={{flex:1}}>
            <div className="search-input">
              <span className="si-icon"><IconSearch size={14} /></span>
              <input placeholder={t("p_search") + "…"} />
            </div>
            <div className="chips">
              <button className={"chip" + (filter==="all"?" active":"")} onClick={() => setFilter("all")}>{t("p_all")} <span className="ct tabular">{list.length}</span></button>
              <button className={"chip" + (filter==="chronic"?" active":"")} onClick={() => setFilter("chronic")}>{t("pat_filter_chronic")} <span className="ct tabular">{list.filter(p=>p.chronic).length}</span></button>
              <button className={"chip" + (filter==="insured"?" active":"")} onClick={() => setFilter("insured")}>{t("pat_filter_insured")} <span className="ct tabular">{list.length}</span></button>
              <button className={"chip" + (filter==="bday"?" active":"")} onClick={() => setFilter("bday")}>{t("pat_filter_birthday")} <span className="ct tabular">3</span></button>
            </div>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>{t("pat_col_patient")}</th>
              <th>{t("pat_col_age")}</th>
              <th>{t("pat_col_contact")}</th>
              <th>{t("pat_col_insurance")}</th>
              <th>{t("pat_col_last_visit")}</th>
              <th>{t("pat_col_next_appt")}</th>
              <th>{t("pat_col_tags")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p, i) => {
              const phone = "+212 6 " + (10000000 + p.id.charCodeAt(1)*73 % 90000000);
              const lastVisits = ["12 Apr 2026","28 Mar 2026","04 Apr 2026","30 Apr 2026","19 Mar 2026","02 May 2026","11 Apr 2026","25 Apr 2026","08 Apr 2026","30 Apr 2026"];
              const nextAppts = ["—","6 May","—","12 May","—","—","6 May","20 May","—","6 May"];
              return (
                <tr key={p.id}>
                  <td>
                    <div className="wr-patient">
                      <Avatar patient={p} />
                      <div className="nm">
                        <b>{D.name(p)}</b>
                        <div className="meta tabular">#{1000 + i*7} · {p.gender === "f" ? "F" : "M"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="num">{p.age}</td>
                  <td className="num" style={{fontFamily:"var(--font-mono)", fontSize:12}}>{phone}</td>
                  <td>{p.insurance}</td>
                  <td className="num" style={{color:"var(--text-muted)"}}>{lastVisits[i]}</td>
                  <td className="num">{nextAppts[i] === "—" ? <span style={{color:"var(--text-faint)"}}>—</span> : <span style={{color:"var(--olive-700)", fontWeight:600}}>{nextAppts[i]}</span>}</td>
                  <td>
                    <div style={{display:"inline-flex",gap:4,flexWrap:"wrap"}}>
                      <span className="tag-blood">{p.blood}</span>
                      {p.chronic && <span className="tag-chronic">{window.__LANG==="fr"?"Chronique":window.__LANG==="ar"?"مزمن":"Chronic"}</span>}
                    </div>
                  </td>
                  <td className="right">
                    <button className="wr-action-btn">{t("p_view")}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="tbl-foot">
          <span>{t("p_showing", { a: 1, b: list.length, n: 3248 })}</span>
          <div className="pager">
            <button className="pgbtn"><IconChevronRight size={11} style={{transform:"rotate(180deg)"}} /></button>
            <button className="pgbtn active">1</button>
            <button className="pgbtn">2</button>
            <button className="pgbtn">3</button>
            <button className="pgbtn">…</button>
            <button className="pgbtn">325</button>
            <button className="pgbtn"><IconChevronRight size={11} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Walk-ins ----------
function PageWalkins() {
  const rows = [
    { p: "p7", arrived: "11:04", waitMin: 10, reason: { en: "Chest pain", fr: "Douleur thoracique", ar: "ألم في الصدر" }, assigned: "d1", urgent: true },
    { p: "p3", arrived: "11:08", waitMin: 6,  reason: { en: "Sore throat", fr: "Mal de gorge", ar: "التهاب الحلق" }, assigned: "d2", urgent: false },
    { p: "p10",arrived: "11:12", waitMin: 2,  reason: { en: "Refill request", fr: "Renouvellement ordonnance", ar: "تجديد وصفة" }, assigned: null, urgent: false },
  ];
  return (
    <div className="page" data-screen-label="Walk-ins">
      <PageHeader
        title={t("wi_title")}
        subtitle={t("wi_subtitle")}
        actions={<>
          <button className="tb-cta"><IconWalkin size={15} />{t("wi_action_register")}</button>
        </>}
      />

      <div className="kpi-row" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <KPI tint="info"   icon={IconWalkin}   label={t("wi_kpi_waiting")}    value="3" foot={t("kpi_walkins_sub", { min: 12 })} />
        <KPI tint="warn"   icon={IconClock}    label={t("wi_kpi_avg")}        value="12" unit={t("wr_min")} foot="—" />
        <KPI tint="navy"   icon={IconUsers}    label={t("wi_kpi_today")}      value="11" foot={"+2 " + (window.__LANG==="fr"?"vs hier":window.__LANG==="ar"?"عن أمس":"vs yesterday")} trend="+22%" trendDir="up" />
        <KPI tint="olive"  icon={IconCalendar} label={t("wi_kpi_converted")}  value="6"  foot={"55% " + (window.__LANG==="fr"?"du total":window.__LANG==="ar"?"من المجموع":"of total")} />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>{t("wi_title")}</h2>
          <span className="head-sub">· {window.__LANG==="fr"?"Tri par arrivée":window.__LANG==="ar"?"حسب الوصول":"Sorted by arrival"}</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>{t("wr_col_patient")}</th>
              <th>{t("wi_col_arrived")}</th>
              <th>{t("wi_col_wait")}</th>
              <th>{t("wi_col_reason")}</th>
              <th>{t("wi_col_assigned")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const p = D.patient(r.p);
              const d = r.assigned ? D.doctor(r.assigned) : null;
              return (
                <tr key={i}>
                  <td>
                    <div className="wr-patient">
                      <Avatar patient={p} />
                      <div className="nm">
                        <b>{D.name(p)}</b>
                        <div className="meta">
                          <span className="tag-blood">{p.blood}</span>
                          {r.urgent && <span className="tag-chronic" style={{background:"var(--danger-bg)",color:"var(--danger)"}}>{window.__LANG==="fr"?"Urgent":window.__LANG==="ar"?"عاجل":"Urgent"}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="num"><b>{r.arrived}</b></td>
                  <td><span className="wr-wait tabular">{r.waitMin}<span className="u"> {t("wr_min")}</span></span></td>
                  <td>{r.reason[window.__LANG] || r.reason.en}</td>
                  <td>
                    {d ? (
                      <div className="wr-doctor">
                        <Avatar doctor={d} />
                        <span>{D.name(d).replace(/^Dr\.\s*|^د\.\s*/, "")}</span>
                      </div>
                    ) : (
                      <button className="wr-action-btn olive">{t("wi_action_assign")}</button>
                    )}
                  </td>
                  <td className="right">
                    <div className="wr-actions">
                      <button className="wr-action-btn primary"><IconChevronRight size={12} />{t("wr_action_call")}</button>
                      <button className="wr-action-btn ic-only"><IconMoreHoriz size={12} /></button>
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
}

// ---------- WhatsApp queue ----------
function PageWhatsapp() {
  const [tab, setTab] = React.useState("outbox");
  const templates = [
    { name: "appointment_reminder_24h", body: "Bonjour {{1}}, rappel de votre RDV avec {{2}} demain à {{3}}…", lang: "fr-MA", status: "approved", used: 1248 },
    { name: "appointment_reminder_24h_ar", body: "مرحبًا {{1}}، تذكير بموعدك مع {{2}} غدًا في {{3}}…", lang: "ar-MA", status: "approved", used: 890 },
    { name: "confirmation_request",     body: "Veuillez confirmer votre RDV en répondant OUI/NON…", lang: "fr-MA", status: "approved", used: 754 },
    { name: "directions_parking",       body: "Voici l'adresse et instructions de stationnement…", lang: "fr-MA", status: "approved", used: 421 },
    { name: "test_results_ready",       body: "Vos résultats d'analyse sont disponibles…", lang: "fr-MA", status: "pending", used: 0 },
    { name: "post_visit_followup",      body: "Comment vous sentez-vous depuis votre visite?", lang: "fr-MA", status: "approved", used: 198 },
  ];
  return (
    <div className="page" data-screen-label="WhatsApp queue">
      <PageHeader
        title={t("wq_title")}
        subtitle={t("wq_subtitle")}
        actions={<>
          <button className="btn-secondary"><IconRefresh size={13} />Sync</button>
          <button className="tb-cta"><IconSend size={15} />{t("wa_send_template")}</button>
        </>}
      />

      <div className="kpi-row" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <KPI tint="navy"    icon={IconSend}        label={t("wq_kpi_sent")}      value="186" foot={"+24 " + (window.__LANG==="fr"?"vs hier":window.__LANG==="ar"?"عن أمس":"vs yesterday")} trend="+15%" trendDir="up" />
        <KPI tint="info"    icon={IconCheckDouble} label={t("wq_kpi_delivered")} value="174" foot={"93.5%"} />
        <KPI tint="success" icon={IconCheckDouble} label={t("wq_kpi_read")}      value="142" foot={"76.3%"} />
        <KPI tint="danger"  icon={IconX}           label={t("wq_kpi_failed")}    value="12"  foot={"6.5%"} trend="-2.1%" trendDir="up" />
      </div>

      <div className="card wa-card">
        <div className="wa-tabs">
          <button className={"wa-tab" + (tab==="inbox"?" active":"")} onClick={() => setTab("inbox")}>{t("wq_tab_inbox")} <span className="ct tabular">3</span></button>
          <button className={"wa-tab" + (tab==="outbox"?" active":"")} onClick={() => setTab("outbox")}>{t("wq_tab_outbox")} <span className="ct tabular">10</span></button>
          <button className={"wa-tab" + (tab==="templates"?" active":"")} onClick={() => setTab("templates")}>{t("wq_tab_templates")} <span className="ct tabular">{templates.length}</span></button>
          <button className={"wa-tab" + (tab==="log"?" active":"")} onClick={() => setTab("log")}>{t("wq_tab_log")}</button>
        </div>

        {tab === "outbox" && (
          <div className="wa-list" style={{maxHeight:"none"}}>
            {window.DATA.whatsapp.map((r, i) => <WaItem key={i} row={r} />)}
          </div>
        )}

        {tab === "templates" && (
          <div>
            <div className="tpl-row" style={{background: "var(--muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)"}}>
              <div>{t("wq_template_name")}</div>
              <div>{t("wq_template_lang")}</div>
              <div>{t("wq_template_status")}</div>
              <div>{t("wq_template_used")}</div>
              <div></div>
            </div>
            {templates.map((tp, i) => (
              <div key={i}>
                <div className="tpl-row">
                  <div>
                    <b style={{fontFamily:"var(--font-mono)",fontSize:12}}>{tp.name}</b>
                    <div className="body">{tp.body}</div>
                  </div>
                  <div className="num" style={{fontFamily:"var(--font-mono)",fontSize:12}}>{tp.lang}</div>
                  <div>
                    <span className={"pill " + (tp.status === "approved" ? "success" : "warning")}>
                      <span className="pdot" />{tp.status}
                    </span>
                  </div>
                  <div className="num" style={{fontWeight:600}}>{tp.used.toLocaleString("en-US")}</div>
                  <div style={{textAlign:"end"}}>
                    <button className="wr-action-btn">{t("p_edit")}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "inbox" && (
          <div style={{padding:"40px",textAlign:"center",color:"var(--text-muted)",fontSize:13}}>
            {window.__LANG==="fr"?"3 nouvelles réponses entrantes — implémentation à venir":window.__LANG==="ar"?"3 ردود واردة جديدة":"3 new inbound replies"}
          </div>
        )}
        {tab === "log" && (
          <div style={{padding:"40px",textAlign:"center",color:"var(--text-muted)",fontSize:13}}>
            {window.__LANG==="fr"?"Journal complet des messages":window.__LANG==="ar"?"سجل كامل للرسائل":"Full message log"}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Follow-ups ----------
function PageFollowups() {
  const calls = [
    { p: "p8",  reason_en: "WhatsApp failed ×2",       reason_fr: "Échec WhatsApp ×2",  reason_ar: "فشل واتساب ×2", phone: "+212 6 22 81 49 30", attempts: 0, last: "—",     priority: "high" },
    { p: "p10", reason_en: "WhatsApp failed ×3",       reason_fr: "Échec WhatsApp ×3",  reason_ar: "فشل واتساب ×3", phone: "+212 6 18 32 71 04", attempts: 1, last: "Yesterday 16:20", priority: "high" },
    { p: "p3",  reason_en: "No WhatsApp reply 24h",    reason_fr: "Sans réponse 24h",   reason_ar: "بدون رد 24س",   phone: "+212 6 65 90 12 88", attempts: 2, last: "Today 09:15",     priority: "med" },
    { p: "p4",  reason_en: "Reschedule needed",        reason_fr: "Reporter le RDV",    reason_ar: "إعادة جدولة",   phone: "+212 5 22 47 81 03", attempts: 0, last: "—",     priority: "med" },
    { p: "p6",  reason_en: "Test results — recall",    reason_fr: "Résultats — rappel", reason_ar: "نتائج التحاليل", phone: "+212 6 71 04 28 19", attempts: 1, last: "Yesterday 14:00", priority: "high" },
    { p: "p9",  reason_en: "Post-procedure check",     reason_fr: "Suivi post-procédure", reason_ar: "متابعة بعد الإجراء", phone: "+212 6 33 15 80 92", attempts: 0, last: "—",     priority: "low" },
  ];
  const reasonOf = r => window.__LANG === "fr" ? r.reason_fr : window.__LANG === "ar" ? r.reason_ar : r.reason_en;

  return (
    <div className="page" data-screen-label="Follow-ups">
      <PageHeader
        title={t("fu_title")}
        subtitle={t("fu_subtitle")}
        actions={<button className="btn-secondary"><IconArchive size={13} />{t("p_export")}</button>}
      />

      <div className="kpi-row" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <KPI tint="warn"   icon={IconPhone} label={t("fu_kpi_pending")}      value="6"  foot={window.__LANG==="fr"?"À traiter aujourd'hui":window.__LANG==="ar"?"للمعالجة اليوم":"To handle today"} />
        <KPI tint="success" icon={IconCheckDouble} label={t("fu_kpi_today")}  value="11" foot={"+3 " + (window.__LANG==="fr"?"vs moy.":window.__LANG==="ar"?"عن المتوسط":"vs avg")} trend="+27%" trendDir="up" />
        <KPI tint="danger" icon={IconAlert} label={t("fu_kpi_no_answer")}    value="4"  foot={"36% " + (window.__LANG==="fr"?"du total":window.__LANG==="ar"?"من المجموع":"of total")} />
        <KPI tint="navy"   icon={IconRefresh} label={t("fu_kpi_avg_attempts")} value="1.8" foot={window.__LANG==="fr"?"par patient":window.__LANG==="ar"?"لكل مريض":"per patient"} />
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>{t("p_patient")}</th>
              <th>{t("fu_col_reason")}</th>
              <th>{t("fu_col_phone")}</th>
              <th>{t("fu_col_attempts")}</th>
              <th>{t("fu_col_last")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {calls.map((r, i) => {
              const p = D.patient(r.p);
              return (
                <tr key={i}>
                  <td>
                    <div className="wr-patient">
                      <Avatar patient={p} />
                      <div className="nm">
                        <b>{D.name(p)}</b>
                        <div className="meta">
                          {r.priority === "high" && <span className="tag-chronic" style={{background:"var(--danger-bg)",color:"var(--danger)"}}>{window.__LANG==="fr"?"Priorité":window.__LANG==="ar"?"أولوية":"Priority"}</span>}
                          <span className="tag-blood">{p.blood}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{reasonOf(r)}</td>
                  <td className="num" style={{fontFamily:"var(--font-mono)",fontSize:12}}>{r.phone}</td>
                  <td className="num"><b>{r.attempts}</b></td>
                  <td className="num" style={{color:"var(--text-muted)"}}>{r.last}</td>
                  <td className="right">
                    <div className="wr-actions">
                      <button className="wr-action-btn primary"><IconPhone size={12} />{t("fu_action_call")}</button>
                      <button className="wr-action-btn"><IconCheck size={12} />{t("fu_action_done")}</button>
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
}

window.PageAppointments = PageAppointments;
window.PagePatients = PagePatients;
window.PageWalkins = PageWalkins;
window.PageWhatsapp = PageWhatsapp;
window.PageFollowups = PageFollowups;
window.PageHeader = PageHeader;
window.MiniCal = MiniCal;
