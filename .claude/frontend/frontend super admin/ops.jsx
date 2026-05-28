// Operations table (Today across branches) + Quick actions dock

const OperationsTable = ({ t, lang }) => {
  const ops = window.DATA.operations;
  const fmt = window.DATA.fmtMAD;

  const totals = ops.reduce(
    (acc, r) => ({
      scheduled: acc.scheduled + r.scheduled,
      arrived:   acc.arrived   + r.arrived,
      completed: acc.completed + r.completed,
      noShow:    acc.noShow    + r.noShow,
      revenue:   acc.revenue   + r.revenue,
    }),
    { scheduled: 0, arrived: 0, completed: 0, noShow: 0, revenue: 0 }
  );

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{t("ops_title")}</h2>
          <div className="meta">{t("ops_sub")}</div>
        </div>
        <div className="right">
          <button className="btn btn-ghost btn-sm">
            <Icon name="external" size={14} /> {lang === "fr" ? "Ouvrir l'agenda" : lang === "ar" ? "فتح الأجندة" : "Open schedule"}
          </button>
        </div>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{t("th_doctor")}</th>
              <th>{t("th_branch")}</th>
              <th className="num">{t("th_scheduled")}</th>
              <th className="num">{t("th_arrived")}</th>
              <th className="num">{t("th_completed")}</th>
              <th className="num">{t("th_no_show")}</th>
              <th>{lang === "fr" ? "Progression" : lang === "ar" ? "التقدم" : "Progress"}</th>
              <th className="num">{t("th_total_revenue")}</th>
            </tr>
          </thead>
          <tbody>
            {ops.map((r, i) => {
              const pct = Math.round((r.completed / r.scheduled) * 100);
              return (
                <tr key={i}>
                  <td>
                    <div className="user-cell">
                      <div className={"avatar av-32 " + (r.sex === "f" ? "av-olive" : "av-navy")}>
                        {initials(r.name)}
                      </div>
                      <div className="nm">{r.name}</div>
                    </div>
                  </td>
                  <td>
                    <span className={"pill no-dot " + (r.branch === "Casa" ? "navy" : "olive")} style={{ fontSize: 11 }}>
                      {r.branch === "Casa" ? t("legend_casa") : t("legend_rabat")}
                    </span>
                  </td>
                  <td className="num tabular">{r.scheduled}</td>
                  <td className="num tabular" style={{ color: "var(--success)", fontWeight: 600 }}>{r.arrived}</td>
                  <td className="num tabular" style={{ fontWeight: 600, color: "var(--navy-900)" }}>{r.completed}</td>
                  <td className="num tabular" style={{ color: r.noShow > 0 ? "var(--warning)" : "var(--ink-500)", fontWeight: r.noShow > 0 ? 600 : 400 }}>
                    {r.noShow}
                  </td>
                  <td>
                    <div className="util">
                      <div className="bar"><span style={{ width: pct + "%" }} /></div>
                      <span className="pct tabular">{pct}%</span>
                    </div>
                  </td>
                  <td className="num tabular" style={{ fontWeight: 600, color: "var(--navy-900)" }}>
                    {fmt(r.revenue)} <span style={{ color: "var(--ink-400)", fontSize: 11, fontWeight: 500 }}>MAD</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>{t("totals")}</td>
              <td></td>
              <td className="num tabular">{totals.scheduled}</td>
              <td className="num tabular">{totals.arrived}</td>
              <td className="num tabular">{totals.completed}</td>
              <td className="num tabular">{totals.noShow}</td>
              <td></td>
              <td className="num tabular">{fmt(totals.revenue)} <span style={{ color: "var(--ink-400)", fontSize: 11 }}>MAD</span></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};
window.OperationsTable = OperationsTable;

const QuickDock = ({ t }) => (
  <div className="dock">
    <button className="primary"><Icon name="plus" size={14} /> {t("dock_invite")}</button>
    <div className="sep" />
    <button><Icon name="building" size={14} /> {t("dock_branch")}</button>
    <button><Icon name="receipt" size={14} /> {t("dock_expense")}</button>
    <button><Icon name="download" size={14} /> {t("dock_export")}</button>
    <button><Icon name="list" size={14} /> {t("dock_audit")}</button>
  </div>
);
window.QuickDock = QuickDock;
