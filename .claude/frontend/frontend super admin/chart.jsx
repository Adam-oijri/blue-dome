// Revenue chart card — stacked bars (Casa navy / Rabat olive)
const RevenueChart = ({ t, lang }) => {
  const [metric, setMetric] = React.useState("revenue");
  const fmt = window.DATA.fmtMAD;
  const months = window.DATA.monthLabels[lang] || window.DATA.monthLabels.en;

  // For metric switch, we synthesize visits / new based on revenue trend
  const base = window.DATA.monthlyRevenue;
  const data = metric === "revenue"
    ? base
    : metric === "visits"
    ? base.map(([a, b]) => [Math.round(a / 760), Math.round(b / 820)])
    : base.map(([a, b]) => [Math.round(a / 4900), Math.round(b / 5800)]);

  const max = Math.max(...data.map(([a, b]) => a + b));
  const total = data.reduce((s, [a, b]) => s + a + b, 0);

  const W = 720, H = 220, P = { l: 12, r: 12, t: 14, b: 28 };
  const innerW = W - P.l - P.r, innerH = H - P.t - P.b;
  const n = data.length;
  const slot = innerW / n;
  const bw = Math.min(28, slot * 0.55);

  // gridlines
  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => (max * i) / ticks);

  const formatLabel = (n) =>
    metric === "revenue"
      ? n >= 1000 ? Math.round(n / 1000) + "k" : n
      : n;

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{t("revenue_title")}</h2>
          <div className="meta">{t("revenue_sub")}</div>
        </div>
        <div className="right">
          <div className="chart-legend">
            <span><span className="swatch navy" />{t("legend_casa")}</span>
            <span><span className="swatch olive" />{t("legend_rabat")}</span>
          </div>
          <div className="segmented">
            <button className={metric === "revenue" ? "on" : ""} onClick={() => setMetric("revenue")}>{t("metric_revenue")}</button>
            <button className={metric === "visits" ? "on" : ""} onClick={() => setMetric("visits")}>{t("metric_visits")}</button>
            <button className={metric === "new" ? "on" : ""} onClick={() => setMetric("new")}>{t("metric_new")}</button>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div style={{ display: "flex", gap: 24, marginBottom: 8, alignItems: "baseline" }}>
          <div>
            <div className="label">YTD total</div>
            <div className="tabular" style={{ fontSize: 22, fontWeight: 600, color: "var(--navy-900)" }}>
              {fmt(total)} {metric === "revenue" ? <span style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600 }}>MAD</span> : null}
            </div>
          </div>
          <div style={{ marginInlineStart: "auto", display: "flex", gap: 14, color: "var(--ink-500)", fontSize: 12 }}>
            <span><span className="tabular" style={{ color: "var(--navy-900)", fontWeight: 600 }}>64%</span> Casa</span>
            <span><span className="tabular" style={{ color: "var(--navy-900)", fontWeight: 600 }}>36%</span> Rabat</span>
          </div>
        </div>

        <div className="chart-wrap" style={{ direction: "ltr" }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
            {/* gridlines */}
            {tickVals.map((v, i) => {
              const y = P.t + innerH - (v / max) * innerH;
              return (
                <g key={i}>
                  <line x1={P.l} y1={y} x2={W - P.r} y2={y}
                    stroke="var(--border-2)" strokeDasharray={i === 0 ? "" : "2 3"} />
                  <text x={W - P.r - 2} y={y - 3} fontSize="9.5" fill="var(--ink-400)" textAnchor="end" fontFamily="JetBrains Mono">
                    {formatLabel(Math.round(v))}
                  </text>
                </g>
              );
            })}

            {data.map(([casa, rabat], i) => {
              const x = P.l + slot * i + slot / 2 - bw / 2;
              const total = casa + rabat;
              const hCasa  = (casa  / max) * innerH;
              const hRabat = (rabat / max) * innerH;
              const yCasa  = P.t + innerH - hCasa;
              const yRabat = yCasa - hRabat;
              const isLast = i === data.length - 1;
              return (
                <g key={i}>
                  <rect x={x} y={yCasa} width={bw} height={hCasa}
                    fill={isLast ? "var(--navy-900)" : "var(--navy-700)"} rx="2" />
                  <rect x={x} y={yRabat} width={bw} height={hRabat}
                    fill={isLast ? "var(--olive-700)" : "var(--olive-600)"} rx="2" />
                  <text x={x + bw / 2} y={H - 10} fontSize="10.5" fill={isLast ? "var(--navy-900)" : "var(--ink-500)"}
                    fontWeight={isLast ? 600 : 400}
                    textAnchor="middle" fontFamily="Inter">{months[i]}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
};
window.RevenueChart = RevenueChart;
