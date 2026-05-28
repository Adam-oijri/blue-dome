// Lucide-style stroked icons. Each: <Icon name="..." size={16} />
const Icon = ({ name, size = 18, className = "", style = {}, strokeWidth = 1.75 }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
    className, style, "aria-hidden": true,
  };
  const P = (children) => React.createElement("svg", props, children);
  switch (name) {
    case "dome": return P(<>
      <path d="M3 19h18" />
      <path d="M5 19v-2a7 7 0 0 1 14 0v2" />
      <path d="M12 5v3" />
      <path d="M10 5h4" />
    </>);
    case "search": return P(<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>);
    case "bell": return P(<><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></>);
    case "chev-down": return P(<path d="m6 9 6 6 6-6"/>);
    case "chev-right": return P(<path d="m9 6 6 6-6 6"/>);
    case "chev-right-rtl": return P(<path d="m15 6-6 6 6 6"/>);
    case "plus": return P(<><path d="M12 5v14"/><path d="M5 12h14"/></>);
    case "log-out": return P(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>);
    case "layout": return P(<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></>);
    case "calendar": return P(<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></>);
    case "users": return P(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>);
    case "user": return P(<><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></>);
    case "message": return P(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>);
    case "stethoscope": return P(<><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 4h6v6a3 3 0 0 1-6 0z" /><path d="M8 13v3a4 4 0 0 0 8 0"/><circle cx="20" cy="10" r="2"/><path d="M20 12v3"/></>);
    case "pill": return P(<><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M8.5 8.5 15.5 15.5"/></>);
    case "package": return P(<><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></>);
    case "shield": return P(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>);
    case "wallet": return P(<><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7"/><circle cx="17" cy="13" r="1"/></>);
    case "list": return P(<><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></>);
    case "trash": return P(<><path d="M3 6h18"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></>);
    case "settings": return P(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>);
    case "trending-up": return P(<><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></>);
    case "trending-down": return P(<><polyline points="3 7 9 13 13 9 21 17"/><polyline points="14 17 21 17 21 10"/></>);
    case "arrow-up": return P(<><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></>);
    case "arrow-down": return P(<><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></>);
    case "alert-tri": return P(<><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>);
    case "alert-circle": return P(<><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></>);
    case "whatsapp": return P(<><path d="M3 21l1.65-4.5A8 8 0 1 1 7.5 19.35z"/></>);
    case "user-plus": return P(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></>);
    case "building": return P(<><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M12 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></>);
    case "receipt": return P(<><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2V2l-3 2-3-2-3 2-3-2-3 2z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></>);
    case "download": return P(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><path d="M12 15V3"/></>);
    case "external": return P(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><path d="M10 14 21 3"/></>);
    case "star": return P(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>);
    case "filter": return P(<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>);
    case "clock": return P(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>);
    case "check": return P(<polyline points="20 6 9 17 4 12"/>);
    case "x": return P(<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>);
    default: return null;
  }
};
window.Icon = Icon;
