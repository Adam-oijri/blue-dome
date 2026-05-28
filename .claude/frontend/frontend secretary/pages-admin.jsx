// Pages — admin: Billing, Payments, Doctors, Branches, Reports, Settings

const INVOICES = [
  { num: "INV-2026-1284", patient: "p1", issued: "5 May", due: "20 May", total: 850,  paid: 850,  status: "paid" },
  { num: "INV-2026-1283", patient: "p4", issued: "5 May", due: "20 May", total: 1450, paid: 0,    status: "pending" },
  { num: "INV-2026-1282", patient: "p2", issued: "4 May", due: "19 May", total: 600,  paid: 600,  status: "paid" },
  { num: "INV-2026-1281", patient: "p7", issued: "4 May", due: "19 May", total: 980,  paid: 480,  status: "partially_paid" },
  { num: "INV-2026-1280", patient: "p9", issued: "3 May", due: "18 May", total: 2200, paid: 0,    status: "pending" },
  { num: "INV-2026-1279", patient: "p8", issued: "2 May", due: "17 May", total: 750,  paid: 750,  status: "paid" },
  { num: "INV-2026-1278", patient: "p3", issued: "2 May", due: "17 May", total: 1100, paid: 0,    status: "pending" },
  { num: "INV-2026-1265", patient: "p6", issued: "20 Apr", due: "5 May", total: 1850, paid: 0,    status: "overdue" },
  { num: "INV-2026-1259", patient: "p10",issued: "18 Apr", due: "3 May", total: 920,  paid: 0,    status: "overdue" },
  { num: "INV-2026-1241", patient: "p5", issued: "10 Apr", due: "25 Apr", total: 540, paid: 0,    status: "overdue" },
];
const INV_STATUS_PILL = { paid: "success", pending: "warning", partially_paid: "info", overdue: "danger", draft: "neutral" };

const PAYMENTS = [
  { ref: "PAY-7821", inv: "INV-2026-1284", patient: "p1", date: "5 May 11:42", method: "cash",      amount: 850 },
  { ref: "PAY-7820", inv: "INV-2026-1282", patient: "p2", date: "4 May 16:15", method: "card",      amount: 600 },
  { ref: "PAY-7819", inv: "INV-2026-1281", patient: "p7", date: "4 May 14:30", method: "card",      amount: 480 },
  { ref: "PAY-7818", inv: "INV-2026-1279", patient: "p8", date: "2 May 12:08", method: "insurance", amount: 750 },
  { ref: "PAY-7817", inv: "INV-2026-1276", patient: "p4", date: "1 May 17:50", method: "cash",      amount: 320 },
  { ref: "PAY-7816", inv: "INV-2026-1273", patient: "p9", date: "30 Apr 10:22",method: "transfer",  amount: 2400 },
  { ref: "PAY-7815", inv: "INV-2026-1270", patient: "p3", date: "29 Apr 15:00",method: "cash",      amount: 540 },
  { ref: "PAY-7814", inv: "INV-2026-1268", patient: "p6", date: "28 Apr 09:40",method: "card",      amount: 1100 },
  { ref: "PAY-7813", inv: "INV-2026-1265", patient: "p2", date: "27 Apr 11:30",method: "insurance", amount: 1850 },
  { ref: "PAY-7812", inv: "INV-2026-1262", patient: "p1", date: "26 Apr 14:18",method: "check",     amount: 700 },
];
const METHOD_LABEL = { cash: "pay_method_cash", card: "pay_method_card", transfer: "pay_method_transfer", insurance: "pay_method_insurance", check: "pay_method_check" };
const METHOD_PILL = { cash: "olive", card: "info", transfer: "navy", insurance: "warning", check: "neutral" };

// ---------- Billing ----------
function PageBilling() {
  const [filter, setFilter] = React.useState("all");
  const list = filter === "all" ? INVOICES : INVOICES.filter(i => i.status === filter);
  return (
    <div className="page" data-screen-label="Billing">
      <PageHeader
        title={t("bl_title")}
        subtitle={t("bl_subtitle")}
        actions={<>
          <button className="btn-secondary"><IconArchive size={13} />{t("p_export")}</button>
          <button className="tb-cta"><IconPlus size={15} />{window.__LANG==="fr"?"Nouvelle facture":window.__LANG==="ar"?"فاتورة جديدة":"New invoice"}</button>
        </>}
      />

      <div className="kpi-row" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <KPI tint="navy"    icon={IconReceipt} label={t("bl_kpi_open")}        value="42" foot={window.__LANG==="fr"?"Total ouvert":window.__LANG==="ar"?"المجموع المفتوح":"Total open"} />
        <KPI tint="danger"  icon={IconAlert}   label={t("bl_kpi_overdue")}     value="3"  foot="3,310 MAD" trend="+1" trendDir="down" />
        <KPI tint="success" icon={IconCash}    label={t("bl_kpi_collected")}   value="48,720" unit={t("mad")} foot={window.__LANG==="fr"?"+18% vs avr.":window.__LANG==="ar"?"+18% عن أبريل":"+18% vs Apr"} trend="+18%" trendDir="up" />
        <KPI tint="warn"    icon={IconWallet}  label={t("bl_kpi_outstanding")} value="12,840" unit={t("mad")} foot={window.__LANG==="fr"?"Toutes échéances":window.__LANG==="ar"?"جميع الاستحقاقات":"All ages"} />
      </div>

      <div className="grid-2" style={{gridTemplateColumns:"2fr 1fr"}}>
        <div className="card">
          <div className="card-head">
            <div className="page-subhead" style={{flex:1}}>
              <div className="chips">
                <button className={"chip" + (filter==="all"?" active":"")} onClick={()=>setFilter("all")}>{t("p_all")} <span className="ct tabular">{INVOICES.length}</span></button>
                <button className={"chip" + (filter==="pending"?" active":"")} onClick={()=>setFilter("pending")}>{window.__LANG==="fr"?"En attente":window.__LANG==="ar"?"بانتظار":"Pending"} <span className="ct tabular">{INVOICES.filter(i=>i.status==="pending").length}</span></button>
                <button className={"chip" + (filter==="overdue"?" active":"")} onClick={()=>setFilter("overdue")}>{window.__LANG==="fr"?"En retard":window.__LANG==="ar"?"متأخرة":"Overdue"} <span className="ct tabular">{INVOICES.filter(i=>i.status==="overdue").length}</span></button>
                <button className={"chip" + (filter==="paid"?" active":"")} onClick={()=>setFilter("paid")}>{window.__LANG==="fr"?"Payées":window.__LANG==="ar"?"مدفوعة":"Paid"} <span className="ct tabular">{INVOICES.filter(i=>i.status==="paid").length}</span></button>
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
                <th>{t("bl_col_invoice")}</th>
                <th>{t("p_patient")}</th>
                <th>{t("bl_col_issued")}</th>
                <th>{t("bl_col_due")}</th>
                <th className="right">{t("bl_col_total")}</th>
                <th className="right">{t("bl_col_balance")}</th>
                <th>{t("p_status")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r,i) => {
                const p = D.patient(r.patient);
                const balance = r.total - r.paid;
                return (
                  <tr key={i}>
                    <td className="num" style={{fontFamily:"var(--font-mono)",fontSize:12,fontWeight:600}}>{r.num}</td>
                    <td>
                      <div className="wr-patient">
                        <Avatar patient={p} />
                        <div className="nm"><b>{D.name(p)}</b><div className="meta">{p.insurance}</div></div>
                      </div>
                    </td>
                    <td className="num" style={{color:"var(--text-muted)"}}>{r.issued}</td>
                    <td className="num" style={{color: r.status==="overdue" ? "var(--danger)" : "var(--text-muted)", fontWeight: r.status==="overdue" ? 600 : 400}}>{r.due}</td>
                    <td className="num right" style={{fontWeight:600}}>{r.total.toLocaleString("en-US")} <span style={{color:"var(--text-faint)",fontSize:11}}>{t("mad")}</span></td>
                    <td className="num right" style={{fontWeight: balance > 0 ? 600 : 400, color: balance > 0 ? "var(--navy-900)" : "var(--text-faint)"}}>
                      {balance > 0 ? balance.toLocaleString("en-US") + " " + t("mad") : "—"}
                    </td>
                    <td><span className={"pill " + INV_STATUS_PILL[r.status]}><span className="pdot" />{r.status.replace("_"," ")}</span></td>
                    <td className="right"><button className="wr-action-btn">{t("p_view")}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="chart-card">
          <h3>{t("bl_aging")}</h3>
          <div className="csub">{window.__LANG==="fr"?"Répartition des soldes ouverts":window.__LANG==="ar"?"توزيع الأرصدة المفتوحة":"Outstanding balances by age"}</div>
          {[
            { lbl: t("bl_aging_current"),  amt: 7920, pct: 62, cls: "a" },
            { lbl: t("bl_aging_1_30"),     amt: 3580, pct: 28, cls: "b" },
            { lbl: t("bl_aging_31_60"),    amt:  890, pct: 7,  cls: "c" },
            { lbl: t("bl_aging_61_plus"),  amt:  450, pct: 3,  cls: "d" },
          ].map((r,i) => (
            <div key={i} className="funnel-row">
              <div className="lbl">{r.lbl}</div>
              <div className={"bar " + r.cls} style={{width: r.pct + "%"}}><span style={{position:"absolute",insetInlineStart:8,top:3,fontSize:11,color:"#fff",fontWeight:600}}>{r.amt.toLocaleString("en-US")}</span></div>
              <div className="pct">{r.pct}%</div>
            </div>
          ))}
          <div style={{marginTop:8,paddingTop:12,borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:12,color:"var(--text-muted)"}}>{t("p_total")}</span>
            <span className="num" style={{fontWeight:600,fontSize:15,color:"var(--navy-900)"}}>12,840 {t("mad")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Payments ----------
function PagePayments() {
  const breakdown = [
    { method: "cash",      amt: 18420, pct: 38, color: "var(--olive-600)" },
    { method: "card",      amt: 14280, pct: 29, color: "var(--info)" },
    { method: "insurance", amt: 9100,  pct: 19, color: "var(--warning)" },
    { method: "transfer",  amt: 5200,  pct: 11, color: "var(--navy-700)" },
    { method: "check",     amt: 1720,  pct: 3,  color: "var(--neutral)" },
  ];
  // donut math
  let acc = 0;
  const segs = breakdown.map(b => { const start = acc; acc += b.pct; return { ...b, start, end: acc }; });
  const r = 50, cx = 60, cy = 60;
  const polar = (pct) => { const ang = (pct/100) * 2 * Math.PI - Math.PI/2; return [cx + r*Math.cos(ang), cy + r*Math.sin(ang)]; };

  return (
    <div className="page" data-screen-label="Payments">
      <PageHeader
        title={t("pay_title")}
        subtitle={t("pay_subtitle")}
        actions={<>
          <button className="btn-secondary"><IconArchive size={13} />{t("p_export")}</button>
          <button className="tb-cta"><IconCash size={15} />{t("dock_payment")}</button>
        </>}
      />

      <div className="kpi-row" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <KPI tint="olive"   icon={IconCash}   label={t("pay_kpi_today")} value="2,480" unit={t("mad")} foot={"5 " + (window.__LANG==="fr"?"transactions":window.__LANG==="ar"?"معاملات":"transactions")} trend="+12%" trendDir="up" />
        <KPI tint="navy"    icon={IconWallet} label={t("pay_kpi_week")}  value="14,820" unit={t("mad")} foot={"32 " + (window.__LANG==="fr"?"transactions":window.__LANG==="ar"?"معاملات":"transactions")} />
        <KPI tint="success" icon={IconChart}  label={t("pay_kpi_month")} value="48,720" unit={t("mad")} foot={"+18% " + (window.__LANG==="fr"?"vs avr.":window.__LANG==="ar"?"عن أبريل":"vs April")} trend="+18%" trendDir="up" />
        <KPI tint="info"    icon={IconReceipt} label={t("pay_kpi_avg")}  value="486" unit={t("mad")} foot={window.__LANG==="fr"?"Moyenne 30 jours":window.__LANG==="ar"?"متوسط 30 يوم":"30-day average"} />
      </div>

      <div className="grid-2" style={{gridTemplateColumns:"2fr 1fr"}}>
        <div className="card">
          <div className="card-head">
            <h2>{t("pay_title")}</h2>
            <div className="card-head-actions">
              <button className="btn-ghost"><IconFilter size={13} /></button>
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("pay_col_ref")}</th>
                <th>{t("p_date")}</th>
                <th>{t("p_patient")}</th>
                <th>{t("pay_col_invoice")}</th>
                <th>{t("p_method")}</th>
                <th className="right">{t("p_amount")}</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((r,i) => {
                const p = D.patient(r.patient);
                return (
                  <tr key={i}>
                    <td className="num" style={{fontFamily:"var(--font-mono)",fontSize:12,fontWeight:600}}>{r.ref}</td>
                    <td className="num" style={{color:"var(--text-muted)"}}>{r.date}</td>
                    <td>
                      <div className="wr-patient"><Avatar patient={p} /><div className="nm"><b>{D.name(p)}</b></div></div>
                    </td>
                    <td className="num" style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-muted)"}}>{r.inv}</td>
                    <td><span className={"pill " + METHOD_PILL[r.method]}><span className="pdot" />{t(METHOD_LABEL[r.method])}</span></td>
                    <td className="num right" style={{fontWeight:600,color:"var(--olive-700)"}}>+{r.amount.toLocaleString("en-US")} {t("mad")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="chart-card">
          <h3>{t("pay_method_breakdown")}</h3>
          <div className="donut-wrap">
            <svg viewBox="0 0 120 120" width="120" height="120">
              {segs.map((s, i) => {
                const [x1,y1] = polar(s.start);
                const [x2,y2] = polar(s.end);
                const large = (s.end - s.start) > 50 ? 1 : 0;
                const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
                return <path key={i} d={path} fill={s.color} stroke="#fff" strokeWidth="2" />;
              })}
              <circle cx={cx} cy={cy} r="28" fill="#fff" />
              <text x="60" y="56" textAnchor="middle" fontSize="11" fill="#5b6678" fontFamily="Inter">{t("p_total")}</text>
              <text x="60" y="72" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f1e36" fontFamily="Inter">48.7K</text>
            </svg>
            <div className="donut-legend">
              {segs.map((s,i) => (
                <div key={i} className="row">
                  <span className="sw" style={{background:s.color}} />
                  <span>{t(METHOD_LABEL[s.method])}</span>
                  <span className="v">{s.amt.toLocaleString("en-US")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Doctors ----------
function PageDoctors() {
  const docs = window.DATA.doctors.map((d, i) => ({
    ...d,
    todayCount: [12, 14, 9][i] || 8,
    weekHrs: [38, 42, 30][i] || 35,
    rating: [4.8, 4.9, 4.7][i] || 4.6,
    state: ["in_consult", "in_consult", "available"][i] || "off",
    weekLoad: [
      [60, 80, 90, 70, 85, 30, 0],
      [70, 75, 95, 80, 70, 40, 0],
      [50, 60, 65, 55, 70, 0, 0],
    ][i] || [50,50,50,50,50,0,0],
  }));
  const stateMeta = {
    in_consult: { tone: "info", key: "dr_status_in_consult" },
    available:  { tone: "success", key: "dr_status_available" },
    off:        { tone: "neutral", key: "dr_status_off" },
  };

  return (
    <div className="page" data-screen-label="Doctors">
      <PageHeader
        title={t("dr_title")}
        subtitle={t("dr_subtitle")}
        actions={<button className="tb-cta"><IconPlus size={15} />{window.__LANG==="fr"?"Ajouter un médecin":window.__LANG==="ar"?"إضافة طبيب":"Add doctor"}</button>}
      />

      <div className="kpi-row" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <KPI tint="navy"   icon={IconStethoscope} label={t("dr_kpi_total")}      value="3"   foot={window.__LANG==="fr"?"Tous cabinets":window.__LANG==="ar"?"جميع الفروع":"All branches"} />
        <KPI tint="olive"  icon={IconCheck}       label={t("dr_kpi_today")}      value="3"   foot="100%" />
        <KPI tint="info"   icon={IconHeart}       label={t("dr_kpi_specialties")} value="3"  foot={window.__LANG==="fr"?"Cardiologie · Médecine · Pédiatrie":window.__LANG==="ar"?"قلب · عام · أطفال":"Cardio · GP · Pediatrics"} />
        <KPI tint="warn"   icon={IconBuilding}    label={t("dr_kpi_branches")}   value="2"   foot={window.__LANG==="fr"?"Casablanca, Rabat":window.__LANG==="ar"?"الدار البيضاء، الرباط":"Casablanca, Rabat"} />
      </div>

      <div className="grid-3">
        {docs.map(d => {
          const m = stateMeta[d.state];
          const branchKey = window.DATA.branches.find(b => b.id === d.branch).key;
          return (
            <div key={d.id} className="dr-card">
              <div className="dr-head">
                <Avatar doctor={d} size="lg" />
                <div className="nm" style={{flex:1}}>
                  <b>{D.name(d)}</b>
                  <span>{D.specialty(d)}</span>
                  <div style={{marginTop:6,display:"flex",gap:6,alignItems:"center"}}>
                    <span className={"pill " + m.tone}><span className="pdot" />{t(m.key)}</span>
                    <span style={{fontSize:11,color:"var(--text-muted)"}}>· {D.branchLabel(branchKey)}</span>
                  </div>
                </div>
              </div>
              <div className="dr-stats">
                <div className="dr-stat">
                  <div className="v">{d.todayCount}</div>
                  <div className="l">{window.__LANG==="fr"?"Aujourd'hui":window.__LANG==="ar"?"اليوم":"Today"}</div>
                </div>
                <div className="dr-stat">
                  <div className="v">{d.weekHrs}h</div>
                  <div className="l">{window.__LANG==="fr"?"Semaine":window.__LANG==="ar"?"الأسبوع":"This week"}</div>
                </div>
                <div className="dr-stat">
                  <div className="v">{d.rating}</div>
                  <div className="l">{window.__LANG==="fr"?"Note":window.__LANG==="ar"?"التقييم":"Rating"}</div>
                </div>
              </div>
              <div>
                <div style={{fontSize:10,color:"var(--text-faint)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>
                  {window.__LANG==="fr"?"Charge cette semaine":window.__LANG==="ar"?"العبء هذا الأسبوع":"This week's load"}
                </div>
                <div className="dr-mini-bar">
                  {d.weekLoad.map((v, i) => (
                    <div key={i} style={{
                      height: "100%",
                      background: v === 0 ? "var(--muted)" : `color-mix(in oklab, ${d.hue==="navy"?"var(--navy-700)":"var(--olive-600)"} ${20 + v*0.7}%, transparent)`,
                    }} />
                  ))}
                </div>
                <div style={{display:"flex",gap:4,marginTop:4,fontSize:9,color:"var(--text-faint)",fontFamily:"var(--font-mono)"}}>
                  {["M","T","W","T","F","S","S"].map((x,i) => <span key={i} style={{flex:1,textAlign:"center"}}>{x}</span>)}
                </div>
              </div>
              <div className="dr-actions">
                <button className="btn-secondary" style={{flex:1,justifyContent:"center"}}><IconCalendar size={13} />{t("dr_view_schedule")}</button>
                <button className="btn-ghost"><IconMoreHoriz size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Branches ----------
function PageBranches() {
  const branches = [
    { id: "b1", key: "casa", main: true,  pin: "C", addr_en: "12 Rue Ibn Khaldoun, Maârif, Casablanca", addr_fr: "12 Rue Ibn Khaldoun, Maârif, Casablanca", addr_ar: "12 شارع ابن خلدون، المعاريف، الدار البيضاء", phone: "+212 5 22 47 81 03", hrs: "Mon–Fri · 08:00–19:00 · Sat · 09:00–13:00", doctors: 2, staff: 4, todayAppts: 24 },
    { id: "b2", key: "rabat", main: false, pin: "R", addr_en: "8 Av. Mohamed V, Agdal, Rabat", addr_fr: "8 Av. Mohamed V, Agdal, Rabat", addr_ar: "8 شارع محمد الخامس، أكدال، الرباط", phone: "+212 5 37 68 24 91", hrs: "Mon–Fri · 09:00–18:00", doctors: 1, staff: 2, todayAppts: 9 },
  ];
  const addrOf = b => window.__LANG==="fr" ? b.addr_fr : window.__LANG==="ar" ? b.addr_ar : b.addr_en;

  return (
    <div className="page" data-screen-label="Branches">
      <PageHeader
        title={t("br_title")}
        subtitle={t("br_subtitle")}
        actions={<button className="tb-cta"><IconPlus size={15} />{window.__LANG==="fr"?"Nouveau cabinet":window.__LANG==="ar"?"فرع جديد":"New branch"}</button>}
      />

      <div className="grid-2">
        {branches.map(b => (
          <div key={b.id} className="br-card">
            <div className="br-map">
              <div className="br-pin"><span>{b.pin}</span></div>
            </div>
            <div className="br-body">
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <h3 style={{margin:0,fontSize:18,fontWeight:600,color:"var(--navy-900)"}}>{D.branchLabel(b.key)}</h3>
                {b.main && <span className="pill olive"><span className="pdot" />{t("br_main")}</span>}
              </div>
              <div className="br-row"><span className="lbl">{t("br_address")}</span><span>{addrOf(b)}</span></div>
              <div className="br-row"><span className="lbl">{t("br_phone")}</span><span style={{fontFamily:"var(--font-mono)"}}>{b.phone}</span></div>
              <div className="br-row"><span className="lbl">{t("br_hours")}</span><span style={{fontSize:12,color:"var(--text-muted)"}}>{b.hrs}</span></div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:10,padding:"10px 0",borderTop:"1px solid var(--border)",marginTop:6}}>
                <div><div style={{fontSize:18,fontWeight:600,color:"var(--navy-900)"}} className="num">{b.doctors}</div><div style={{fontSize:10,color:"var(--text-faint)",textTransform:"uppercase",letterSpacing:"0.06em"}}>{window.__LANG==="fr"?"Médecins":window.__LANG==="ar"?"أطباء":"Doctors"}</div></div>
                <div><div style={{fontSize:18,fontWeight:600,color:"var(--navy-900)"}} className="num">{b.staff}</div><div style={{fontSize:10,color:"var(--text-faint)",textTransform:"uppercase",letterSpacing:"0.06em"}}>{window.__LANG==="fr"?"Personnel":window.__LANG==="ar"?"موظفون":"Staff"}</div></div>
                <div><div style={{fontSize:18,fontWeight:600,color:"var(--olive-700)"}} className="num">{b.todayAppts}</div><div style={{fontSize:10,color:"var(--text-faint)",textTransform:"uppercase",letterSpacing:"0.06em"}}>{window.__LANG==="fr"?"RDV aujourd'hui":window.__LANG==="ar"?"موعد اليوم":"Today"}</div></div>
              </div>
              <button className="btn-secondary" style={{justifyContent:"center"}}><IconLayout size={13} />{t("br_view_dashboard")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Reports ----------
function PageReports() {
  const [period, setPeriod] = React.useState("7d");
  const apptsPerDay = [18, 22, 19, 26, 24, 12, 0]; // 7 days
  const revPerWeek = [42, 51, 47, 49];
  const funnel = [
    { lbl: t("rp_funnel_booked"),    v: 100, n: 184, cls: "a" },
    { lbl: t("rp_funnel_confirmed"), v: 78,  n: 144, cls: "b" },
    { lbl: t("rp_funnel_arrived"),   v: 71,  n: 131, cls: "c" },
    { lbl: t("rp_funnel_completed"), v: 68,  n: 125, cls: "d" },
  ];
  const docBars = [
    { name: D.name(D.doctor("d1")), n: 84, color: "var(--navy-700)" },
    { name: D.name(D.doctor("d2")), n: 71, color: "var(--olive-600)" },
    { name: D.name(D.doctor("d3")), n: 29, color: "var(--info)" },
  ];

  return (
    <div className="page" data-screen-label="Reports">
      <PageHeader
        title={t("rp_title")}
        subtitle={t("rp_subtitle")}
        actions={<>
          <button className="btn-secondary"><IconArchive size={13} />{t("p_export")}</button>
          <button className="btn-secondary"><IconPrinter size={13} />{t("p_print")}</button>
        </>}
      />

      <div className="chips">
        {[["today","rp_period_today"],["7d","rp_period_7d"],["30d","rp_period_30d"],["qtr","rp_period_qtr"]].map(([k,key])=>(
          <button key={k} className={"chip" + (period===k?" active":"")} onClick={()=>setPeriod(k)}>{t(key)}</button>
        ))}
      </div>

      <div className="kpi-row" style={{gridTemplateColumns:"repeat(5, 1fr)"}}>
        <KPI tint="navy"    icon={IconCalendar} label={window.__LANG==="fr"?"Total RDV":window.__LANG==="ar"?"إجمالي المواعيد":"Total appts"} value="184" foot="7d" trend="+12%" trendDir="up" />
        <KPI tint="success" icon={IconCheck}    label={window.__LANG==="fr"?"Taux d'arrivée":window.__LANG==="ar"?"معدل الحضور":"Show rate"} value="71%" foot="—" trend="+3.2%" trendDir="up" />
        <KPI tint="olive"   icon={IconCash}     label={window.__LANG==="fr"?"Revenus":window.__LANG==="ar"?"الإيرادات":"Revenue"} value="48.7K" unit={t("mad")} foot="7d" trend="+18%" trendDir="up" />
        <KPI tint="info"    icon={IconClock}    label={window.__LANG==="fr"?"Durée moy.":window.__LANG==="ar"?"المتوسط":"Avg. duration"} value="28" unit={t("wr_min")} foot="—" />
        <KPI tint="danger"  icon={IconAlert}    label={window.__LANG==="fr"?"Absences":window.__LANG==="ar"?"تغيبات":"No-shows"} value="4.2%" foot="—" trend="-0.4%" trendDir="up" />
      </div>

      <div className="grid-2">
        <div className="chart-card">
          <h3>{t("rp_chart_appts")}</h3>
          <div className="csub">{window.__LANG==="fr"?"Volume quotidien · 7 jours":window.__LANG==="ar"?"الحجم اليومي · 7 أيام":"Daily volume · 7 days"}</div>
          <div className="bar-chart">
            {apptsPerDay.map((v,i) => (
              <div key={i} className="col" style={{justifyContent:"flex-end"}}>
                {v > 0 && (
                  <>
                    <div className="seg" style={{height: (v/30)*0.7*100 + "%", background:"var(--navy-700)"}} />
                    <div className="seg" style={{height: (v/30)*0.3*100 + "%", background:"var(--olive-600)"}} />
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="x-labels">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((x,i)=><span key={i}>{x}</span>)}</div>
          <div style={{display:"flex",gap:14,fontSize:11,color:"var(--text-muted)"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:6}}><span style={{width:10,height:10,borderRadius:2,background:"var(--navy-700)"}} />Dr. Lahlou</span>
            <span style={{display:"inline-flex",alignItems:"center",gap:6}}><span style={{width:10,height:10,borderRadius:2,background:"var(--olive-600)"}} />Dr. Idrissi</span>
          </div>
        </div>

        <div className="chart-card">
          <h3>{t("rp_chart_revenue")}</h3>
          <div className="csub">{window.__LANG==="fr"?"4 dernières semaines":window.__LANG==="ar"?"آخر 4 أسابيع":"Last 4 weeks"} · MAD '000</div>
          <div className="bar-chart">
            {revPerWeek.map((v,i) => (
              <div key={i} className="col" style={{justifyContent:"flex-end"}}>
                <div className="seg" style={{height: (v/55)*100 + "%", background:"var(--olive-600)"}} />
              </div>
            ))}
          </div>
          <div className="x-labels">{["W14","W15","W16","W17"].map((x,i)=><span key={i}>{x}</span>)}</div>
        </div>

        <div className="chart-card">
          <h3>{t("rp_chart_funnel")}</h3>
          <div className="csub">{window.__LANG==="fr"?"Conversion des RDV programmés":window.__LANG==="ar"?"تحويل المواعيد":"Conversion of booked appts"}</div>
          <div style={{marginTop:8}}>
            {funnel.map((r,i) => (
              <div key={i} className="funnel-row" style={{gridTemplateColumns:"110px 1fr 80px"}}>
                <div className="lbl">{r.lbl}</div>
                <div className={"bar " + r.cls} style={{width: r.v + "%"}}>
                  <span style={{position:"absolute",insetInlineStart:8,top:3,fontSize:11,color:"#fff",fontWeight:600}}>{r.n}</span>
                </div>
                <div className="pct">{r.v}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>{t("rp_chart_doctor")}</h3>
          <div className="csub">7d · {window.__LANG==="fr"?"Total par médecin":window.__LANG==="ar"?"المجموع لكل طبيب":"Total by doctor"}</div>
          <div style={{marginTop:8}}>
            {docBars.map((r,i) => (
              <div key={i} className="funnel-row" style={{gridTemplateColumns:"170px 1fr 50px"}}>
                <div className="lbl" style={{fontSize:12,fontWeight:500}}>{r.name}</div>
                <div className="bar" style={{background:r.color, width: (r.n/100)*100 + "%"}} />
                <div className="pct">{r.n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Settings ----------
function PageSettings() {
  const [tab, setTab] = React.useState("clinic");
  return (
    <div className="page" data-screen-label="Settings">
      <PageHeader
        title={t("st_title")}
        subtitle={t("st_subtitle")}
        actions={<button className="btn-olive"><IconCheck size={15} />{t("st_save")}</button>}
      />

      <div className="card" style={{padding:0}}>
        <div className="settings-tabs">
          {[["profile","st_tab_profile"],["clinic","st_tab_clinic"],["branches","st_tab_branches"],["users","st_tab_users"],["templates","st_tab_templates"],["billing","st_tab_billing"],["integrations","st_tab_integrations"]].map(([k,key])=>(
            <button key={k} className={"settings-tab" + (tab===k?" active":"")} onClick={()=>setTab(k)}>{t(key)}</button>
          ))}
        </div>

        {tab === "clinic" && (
          <div>
            <div className="field-row">
              <div><div className="flbl">{t("st_clinic_name")}</div><div className="fhint">{window.__LANG==="fr"?"Affiché en haut et sur les factures":window.__LANG==="ar"?"يظهر في الأعلى وعلى الفواتير":"Shown in header and invoices"}</div></div>
              <input type="text" defaultValue="Cabinet Dr. Lahlou" />
            </div>
            <div className="field-row">
              <div><div className="flbl">{t("st_default_lang")}</div><div className="fhint">{window.__LANG==="fr"?"Pour nouveaux patients sans préférence":window.__LANG==="ar"?"للمرضى الجدد بدون تفضيل":"For new patients without preference"}</div></div>
              <select defaultValue="fr"><option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option></select>
            </div>
            <div className="field-row">
              <div><div className="flbl">{t("st_currency")}</div></div>
              <select defaultValue="MAD"><option>MAD</option><option>EUR</option><option>USD</option></select>
            </div>
            <div className="field-row">
              <div><div className="flbl">{t("st_timezone")}</div></div>
              <select defaultValue="WET"><option>Africa/Casablanca (WET)</option><option>Europe/Paris (CET)</option></select>
            </div>
            <div className="field-row">
              <div><div className="flbl">{t("st_subscription")}</div><div className="fhint">{window.__LANG==="fr"?"Renouvellement le 1ᵉʳ jan. 2027":window.__LANG==="ar"?"التجديد في 1 يناير 2027":"Renews 1 Jan 2027"}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span className="pill olive"><span className="pdot" />{window.__LANG==="fr"?"Actif":window.__LANG==="ar"?"نشط":"Active"}</span>
                <span style={{fontSize:13,color:"var(--text)"}}>{t("st_plan_pro")}</span>
              </div>
            </div>
          </div>
        )}

        {tab !== "clinic" && (
          <div style={{padding:"60px",textAlign:"center",color:"var(--text-muted)",fontSize:13}}>
            <div style={{fontSize:32,marginBottom:8,opacity:0.4}}><IconSettings size={32} /></div>
            <div style={{fontWeight:600,color:"var(--navy-900)",marginBottom:4}}>{t("st_tab_" + tab)}</div>
            <div>{window.__LANG==="fr"?"Section en cours de configuration.":window.__LANG==="ar"?"قسم قيد الإعداد.":"Section under configuration."}</div>
          </div>
        )}
      </div>
    </div>
  );
}

window.PageBilling = PageBilling;
window.PagePayments = PagePayments;
window.PageDoctors = PageDoctors;
window.PageBranches = PageBranches;
window.PageReports = PageReports;
window.PageSettings = PageSettings;
