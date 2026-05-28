// KPI band (5 cards). Sparkline drawn as SVG.
const Sparkline = ({ data, color = "currentColor", filled = true, height = 32 }) => {
  const w = 120, h = height, max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - 4 - ((v - min) / range) * (h - 8)]);
  const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const area = d + ` L${w},${h} L0,${h} Z`;
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ color }}>
      {filled && <path d={area} fill="currentColor" opacity="0.12" />}
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Trend = ({ value, dir }) => {
  const cls = dir === "up" ? "up" : dir === "down" ? "down" : "flat";
  const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "•";
  return <span className={"trend " + cls}><span style={{ fontSize: 9 }}>{arrow}</span>{value}</span>;
};

const KpiBand = ({ t, lang }) => {
  const fmt = window.DATA.fmtMAD;
  const revSpark = [142, 156, 148, 161, 173, 168, 181, 195, 188, 201, 216, 232];
  const apptSpark = [102, 118, 121, 130, 128, 137, 142, 150];
  const utilSpark = [78, 82, 85, 81, 84, 87, 86, 88];
  const waSpark   = [94, 95, 93, 92, 90, 89, 87, 87];

  return (
    <div className="kpi-band">
      {/* Hero — Revenue */}
      <div className="kpi hero">
        <div className="kpi-label">
          <Icon name="wallet" size={14} />
          {t("kpi_revenue")}
        </div>
        <div className="kpi-value tabular">
          {fmt(232400)} <span className="unit">MAD</span>
        </div>
        <Sparkline data={revSpark} color="#cfe1a0" />
        <div className="kpi-foot">
          <Trend value="+7.5%" dir="up" />
          <span>{t("kpi_revenue_foot")}</span>
        </div>
      </div>

      {/* Appointments */}
      <div className="kpi">
        <div className="kpi-label">
          <Icon name="calendar" size={14} />
          {t("kpi_appointments")}
        </div>
        <div className="kpi-value tabular">1,248</div>
        <div style={{ display: "flex", gap: 6, alignItems: "baseline", marginTop: -4 }}>
          <span className="pill warn no-dot tabular" style={{ fontSize: 11 }}>4.8% {t("kpi_appointments_foot_a")}</span>
        </div>
        <div className="kpi-foot">
          <Trend value="+11%" dir="up" />
          <span>{t("kpi_appointments_foot_b")}</span>
        </div>
      </div>

      {/* Active patients */}
      <div className="kpi">
        <div className="kpi-label">
          <Icon name="users" size={14} />
          {t("kpi_patients")}
        </div>
        <div className="kpi-value tabular">3,412</div>
        <div className="kpi-foot">
          <Trend value="+86" dir="up" />
          <span>{t("kpi_patients_foot")}</span>
        </div>
      </div>

      {/* Utilization */}
      <div className="kpi">
        <div className="kpi-label">
          <Icon name="trending-up" size={14} />
          {t("kpi_utilization")}
        </div>
        <div className="kpi-value tabular">84<span className="unit">%</span></div>
        <Sparkline data={utilSpark} color="var(--olive-600)" />
        <div className="kpi-foot tabular">
          <span style={{ color: "var(--success)", fontWeight: 600 }}>92% Lahlou</span>
          <span style={{ color: "var(--ink-300)" }}>·</span>
          <span style={{ color: "var(--warning)", fontWeight: 600 }}>74% Khalil</span>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="kpi">
        <div className="kpi-label">
          <Icon name="whatsapp" size={14} />
          {t("kpi_whatsapp")}
        </div>
        <div className="kpi-value tabular">87<span className="unit">%</span></div>
        <Sparkline data={waSpark} color="var(--info)" />
        <div className="kpi-foot">
          <Trend value="-7pt" dir="down" />
          <span>{t("kpi_whatsapp_foot", { n: "2,184" })}</span>
        </div>
      </div>
    </div>
  );
};
window.KpiBand = KpiBand;
