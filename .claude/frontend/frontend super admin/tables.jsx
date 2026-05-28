// Doctor performance table + Branch comparison
const initials = (name) => name.replace(/^Dr\.?\s*/i, "").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const DoctorTable = ({ t, lang }) => {
  const docs = window.DATA.doctors;
  const fmt = window.DATA.fmtMAD;
  const [sort, setSort] = React.useState("revenue");

  const sorted = [...docs].sort((a, b) => {
    if (sort === "revenue") return b.revenue - a.revenue;
    if (sort === "util") return b.util - a.util;
    if (sort === "completed") return b.completed - a.completed;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  const Th = ({ id, children, num }) => (
    <th className={num ? "num" : ""} onClick={() => setSort(id)} style={{ cursor: "pointer" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {children}
        {sort === id && <span style={{ color: "var(--olive-600)" }}>↓</span>}
      </span>
    </th>
  );

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{t("doctors_title")}</h2>
          <div className="meta">{t("doctors_sub")}</div>
        </div>
        <div className="right">
          <button className="btn btn-ghost btn-sm">
            <Icon name="filter" size={14} /> Filter
          </button>
          <button className="btn btn-ghost btn-sm">
            <Icon name="download" size={14} /> Export
          </button>
        </div>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <Th id="name">{t("th_doctor")}</Th>
              <th>{t("th_specialty")}</th>
              <th>{t("th_branch")}</th>
              <Th id="completed" num>{t("th_completed")}</Th>
              <Th id="util">{t("th_utilization")}</Th>
              <Th id="revenue" num>{t("th_revenue")}</Th>
              <Th id="rating" num>{t("th_rating")}</Th>
              <th style={{ width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.id}>
                <td>
                  <div className="user-cell">
                    <div className={"avatar av-32 " + (d.sex === "f" ? "av-olive" : "av-navy")}>
                      {initials(d.name)}
                    </div>
                    <div>
                      <div className="nm">{lang === "ar" ? d.nameAr : d.name}</div>
                      <div className="sub">{d.id === "u1" ? "Owner · MD" : "MD"}</div>
                    </div>
                  </div>
                </td>
                <td>{d.specialty[lang] || d.specialty.en}</td>
                <td>
                  <span className={"pill no-dot " + (d.branch === "Casa" ? "navy" : "olive")} style={{ fontSize: 11 }}>
                    {d.branch === "Casa" ? t("legend_casa") : t("legend_rabat")}
                  </span>
                </td>
                <td className="num tabular" style={{ fontWeight: 600, color: "var(--navy-900)" }}>{d.completed}</td>
                <td>
                  <div className="util">
                    <div className="bar"><span style={{ width: d.util + "%" }} /></div>
                    <span className="pct tabular">{d.util}%</span>
                  </div>
                </td>
                <td className="num tabular" style={{ fontWeight: 600, color: "var(--navy-900)" }}>
                  {fmt(d.revenue)} <span style={{ color: "var(--ink-400)", fontSize: 11, fontWeight: 500 }}>MAD</span>
                </td>
                <td className="num tabular">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--navy-900)", fontWeight: 600 }}>
                    <Icon name="star" size={13} style={{ color: "var(--olive-600)", fill: "var(--olive-600)" }} />
                    {d.rating.toFixed(1)}
                  </span>
                </td>
                <td><Icon name={lang === "ar" ? "chev-right-rtl" : "chev-right"} size={16} className="chev" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
window.DoctorTable = DoctorTable;

const BranchCompare = ({ t, lang }) => {
  const fmt = window.DATA.fmtMAD;
  const stats = (city, isMain, rev, pat, staff, appts, avg, color) => (
    <div className="branch-col">
      <h3>
        {city}
        {isMain && <span className="pill olive no-dot" style={{ fontSize: 10 }}>{t("main_badge")}</span>}
      </h3>
      <div className="city">{lang === "ar" ? "المغرب" : "Morocco"}</div>
      <div className="stat"><span className="k">{t("label_revenue")}</span><span className="v">{fmt(rev)} <span style={{ color: "var(--ink-400)", fontSize: 11 }}>MAD</span></span></div>
      <div className="stat"><span className="k">{t("label_patients")}</span><span className="v">{pat}</span></div>
      <div className="stat"><span className="k">{t("label_staff")}</span><span className="v">{staff}</span></div>
      <div className="stat"><span className="k">{t("label_appts")}</span><span className="v">{appts}</span></div>
      <div className="stat"><span className="k">{t("label_avg_visit")}</span><span className="v">{fmt(avg)} <span style={{ color: "var(--ink-400)", fontSize: 11 }}>MAD</span></span></div>
      {/* mini share bar */}
      <div style={{ marginTop: 14 }}>
        <div className="bar"><span style={{ width: color === "navy" ? "64%" : "36%", background: color === "navy" ? "var(--navy-700)" : "var(--olive-600)" }} /></div>
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--ink-500)", display: "flex", justifyContent: "space-between" }}>
          <span>{lang === "ar" ? "حصة الإيرادات" : "Revenue share"}</span>
          <span className="tabular" style={{ fontWeight: 600, color: "var(--navy-900)" }}>{color === "navy" ? "64%" : "36%"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{t("branch_compare_title")}</h2>
          <div className="meta">{t("branch_compare_sub")}</div>
        </div>
      </div>
      <div className="card-body">
        <div className="branch-grid">
          {stats(t("branch_casa"),  true,  232400, 1842, 6, 824, 282, "navy")}
          {stats(t("branch_rabat"), false, 142000, 1198, 3, 424, 335, "olive")}
        </div>
      </div>
    </section>
  );
};
window.BranchCompare = BranchCompare;
