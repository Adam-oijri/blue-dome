// Main App entry
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "language": "en",
  "accentColor": "olive",
  "density": "comfortable",
  "showInProgressCard": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLangState] = useState(tweaks.language);
  const [page, setPage] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modal, setModal] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);

  // Expose modal opener globally
  useEffect(() => {
    window.openModal = (kind) => setModal(kind);
  }, []);

  // Trigger skeleton on page navigation
  const navigate = (next) => {
    setPageLoading(true);
    setPage(next);
    setTimeout(() => setPageLoading(false), 520);
  };

  useEffect(() => { setLangState(tweaks.language); }, [tweaks.language]);
  const setLang = (l) => { setTweak("language", l); };

  const t = I18N[lang];

  useEffect(() => {
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t.dir]);

  // Apply accent
  useEffect(() => {
    const accents = {
      olive: { c: "#6f8536", h: "#5c6e2c", l: "#e8efd5", l2: "#f3f7e6" },
      blue:  { c: "#1d4ed8", h: "#1e40af", l: "#dbeafe", l2: "#eff6ff" },
      teal:  { c: "#0f766e", h: "#115e59", l: "#ccfbf1", l2: "#f0fdfa" },
    };
    const a = accents[tweaks.accentColor] || accents.olive;
    document.documentElement.style.setProperty("--accent", a.c);
    document.documentElement.style.setProperty("--olive-600", a.c);
    document.documentElement.style.setProperty("--olive-700", a.h);
    document.documentElement.style.setProperty("--olive-100", a.l);
    document.documentElement.style.setProperty("--olive-50", a.l2);
  }, [tweaks.accentColor]);

  const openPatient = (p) => {
    if (!p) p = MOCK.patients[0];
    setSelectedPatient(p);
    navigate("patient_detail");
  };

  const goBack = () => {
    setSelectedPatient(null);
    navigate("patients");
  };

  const onSaved = (msg) => { window.toast && window.toast({ title: msg, description: "Saved successfully" }); };

  let body;
  if (pageLoading) body = <PageSkeleton/>;
  else if (page === "dashboard") body = <Dashboard t={t} lang={lang} openPatient={openPatient}/>;
  else if (page === "patients") body = <PatientList t={t} lang={lang} openPatient={openPatient}/>;
  else if (page === "patient_detail") body = <PatientProfile t={t} lang={lang} patient={selectedPatient} back={goBack}/>;
  else if (page === "calendar") body = <Calendar t={t} lang={lang} openPatient={openPatient}/>;
  else if (page === "rx") body = <RxWriter t={t} lang={lang}/>;
  else if (page === "consultation") body = <ConsultationScreen t={t} lang={lang}/>;
  else if (page === "labs") body = <LabsScreen t={t} lang={lang}/>;
  else if (page === "invoices") body = <InvoicesScreen t={t} lang={lang}/>;
  else if (page === "inventory") body = <InventoryScreen t={t} lang={lang}/>;
  else if (page === "staff") body = <StaffScreen t={t} lang={lang}/>;
  else if (page === "followup") body = <FollowUpScreen t={t} lang={lang}/>;
  else if (page === "settings") body = <SettingsScreen t={t} lang={lang}/>;
  else body = <Dashboard t={t} lang={lang} openPatient={openPatient}/>;

  return (
    <Toaster>
    <div className="app" data-screen-label={"BlueDome — " + page}>
      <Sidebar t={t} page={page === "patient_detail" ? "patients" : page} setPage={navigate}/>
      <div className="main">
        <Topbar t={t} lang={lang} setLang={setLang}/>
        {body}
      </div>

      {modal === "patient" && <NewPatientForm onClose={() => setModal(null)} onSaved={onSaved}/>}
      {modal === "appointment" && <NewAppointmentForm onClose={() => setModal(null)} onSaved={onSaved}/>}
      {modal === "invoice" && <NewInvoiceForm onClose={() => setModal(null)} onSaved={onSaved}/>}
      {modal === "lab" && <NewLabOrderForm onClose={() => setModal(null)} onSaved={onSaved}/>}
      {modal === "inventory" && <AddInventoryForm onClose={() => setModal(null)} onSaved={onSaved}/>}
      {modal === "staff" && <InviteStaffForm onClose={() => setModal(null)} onSaved={onSaved}/>}
      {modal === "branch" && <AddBranchForm onClose={() => setModal(null)} onSaved={onSaved}/>}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Language">
          <TweakRadio label="UI language" value={tweaks.language} onChange={v => setTweak("language", v)}
            options={[{value:"en", label:"EN"}, {value:"fr", label:"FR"}, {value:"ar", label:"عربي"}]}/>
        </TweakSection>
        <TweakSection title="Brand">
          <TweakColor label="Accent color" value={tweaks.accentColor}
            onChange={v => setTweak("accentColor", v)}
            options={[
              { value: "olive", color: "#6f8536" },
              { value: "blue", color: "#1d4ed8" },
              { value: "teal", color: "#0f766e" },
            ]}/>
        </TweakSection>
        <TweakSection title="Layout">
          <TweakToggle label="Show in-progress card on dashboard"
            value={tweaks.showInProgressCard} onChange={v => setTweak("showInProgressCard", v)}/>
        </TweakSection>
        <TweakSection title="Jump to screen">
          <TweakButton onClick={() => setPage("dashboard")}>Dashboard</TweakButton>
          <TweakButton onClick={() => setPage("patients")}>Patients</TweakButton>
          <TweakButton onClick={() => openPatient(MOCK.patients[0])}>Patient profile</TweakButton>
          <TweakButton onClick={() => setPage("calendar")}>Calendar</TweakButton>
          <TweakButton onClick={() => setPage("rx")}>Prescription</TweakButton>
        </TweakSection>
      </TweaksPanel>
    </div>
    </Toaster>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
