// Root App
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "en",
  "density": "comfortable",
  "showHero": true,
  "accent": "olive"
}/*EDITMODE-END*/;

const App = () => {
  const [tw, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  const lang = tw.lang;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = window.useT(lang);

  const [branch, setBranch] = useState("all");
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  // Accent live override
  useEffect(() => {
    const map = {
      olive:   { c600: "#6f8536", c700: "#5d6f2d", c100: "#e8efd5" },
      emerald: { c600: "#1f8a5b", c700: "#176b46", c100: "#d3ead8" },
      teal:    { c600: "#1e7a82", c700: "#16606a", c100: "#cfe5e8" },
    };
    const a = map[tw.accent] || map.olive;
    const r = document.documentElement;
    r.style.setProperty("--olive-600", a.c600);
    r.style.setProperty("--olive-700", a.c700);
    r.style.setProperty("--olive-100", a.c100);
  }, [tw.accent]);

  return (
    <div className="app" data-density={tw.density}>
      <Sidebar t={t} lang={lang} />
      <div className="main">
        <Topbar
          t={t} lang={lang}
          setLang={(L) => setTweak("lang", L)}
          branch={branch} setBranch={setBranch}
          period={period} setPeriod={setPeriod}
        />
        <main className="page" data-screen-label="01 Admin Dashboard">
          <div className="page-header">
            <div>
              <h1>{t("page_title")} · {t("page_period_label")}</h1>
              <div className="sub">{t("page_clinic")} — {branch === "all" ? t("branch_all") : branch === "casa" ? t("branch_casa") : t("branch_rabat")}</div>
            </div>
            <div className="actions">
              <button className="btn btn-ghost"><Icon name="download" size={15} /> {lang === "fr" ? "Exporter" : lang === "ar" ? "تصدير" : "Export"}</button>
              <button className="btn btn-primary"><Icon name="plus" size={15} /> {lang === "fr" ? "Nouveau rapport" : lang === "ar" ? "تقرير جديد" : "New report"}</button>
            </div>
          </div>

          <KpiBand t={t} lang={lang} />

          <div className="main-grid">
            <div className="col-stack">
              <RevenueChart t={t} lang={lang} />
              <DoctorTable t={t} lang={lang} />
              <BranchCompare t={t} lang={lang} />
            </div>
            <div className="col-stack">
              <Subscription t={t} lang={lang} />
              <ActivityFeed t={t} lang={lang} />
              <Alerts t={t} lang={lang} />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <OperationsTable t={t} lang={lang} />
          </div>
        </main>
      </div>

      <QuickDock t={t} />

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Locale">
            <window.TweakRadio label="Language" value={tw.lang}
              onChange={(v) => setTweak("lang", v)}
              options={[
                { value: "en", label: "EN" },
                { value: "fr", label: "FR" },
                { value: "ar", label: "AR" },
              ]} />
            <div style={{ fontSize: 11.5, color: "#7c889e", marginTop: 4 }}>
              Arabic flips to RTL · numbers stay LTR with tabular nums
            </div>
          </window.TweakSection>
          <window.TweakSection title="Accent">
            <window.TweakColor label="Accent palette" value={tw.accent}
              onChange={(v) => setTweak("accent", v)}
              options={["olive", "emerald", "teal"]} />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
