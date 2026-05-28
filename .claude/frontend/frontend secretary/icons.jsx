// Lucide-style stroke icons, 1.75 stroke-width
// Each is a React component; size & className passthrough.
const Icon = ({ size = 18, className = "", children, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    {children}
  </svg>
);

// Brand dome glyph
const IconDome = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden="true">
    <path d="M3 19h18" />
    <path d="M5 19V12a7 7 0 0 1 14 0v7" />
    <path d="M12 5V3" />
    <path d="M9 19v-5a3 3 0 0 1 6 0v5" />
  </svg>
);

const IconLayout       = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></Icon>;
const IconCalendar     = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Icon>;
const IconUsers        = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>;
const IconWalkin       = (p) => <Icon {...p}><circle cx="13" cy="4" r="2" /><path d="M11 21l1-7-3-3 1-4 3 1 2 3 3 1" /><path d="M5 18l3-1" /></Icon>;
const IconWhatsapp     = (p) => <Icon {...p}><path d="M21 12a9 9 0 0 1-13.4 7.85L3 21l1.2-4.5A9 9 0 1 1 21 12Z"/><path d="M9 9.5c0 2.5 3 5.5 5.5 5.5l1-1-2-1.5L12.5 14a4 4 0 0 1-2.5-2.5l1.5-1L10 8.5l-1 1Z"/></Icon>;
const IconPhone        = (p) => <Icon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/></Icon>;
const IconReceipt      = (p) => <Icon {...p}><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2L4 2Z"/><path d="M8 8h8M8 12h8M8 16h5"/></Icon>;
const IconWallet       = (p) => <Icon {...p}><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2h13"/><path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M16 12h5v4h-5a2 2 0 0 1 0-4Z"/></Icon>;
const IconStethoscope  = (p) => <Icon {...p}><path d="M11 2v6a4 4 0 0 0 8 0V2"/><path d="M11 8a4 4 0 0 1-8 0V2"/><path d="M15 12v3a5 5 0 0 1-10 0"/><circle cx="20" cy="12" r="2"/></Icon>;
const IconBuilding     = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 21V9h6v12"/><path d="M3 9h18"/></Icon>;
const IconChart        = (p) => <Icon {...p}><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-6"/></Icon>;
const IconSettings     = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.34.22.7.22 1.07V11a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></Icon>;
const IconSearch       = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Icon>;
const IconBell         = (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Icon>;
const IconPlus         = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IconChevronRight = (p) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
const IconChevronDown  = (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>;
const IconCheck        = (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>;
const IconCheckDouble  = (p) => <Icon {...p}><path d="M2 12 7 17 13 5"/><path d="m11 12 5 5 6-12"/></Icon>;
const IconX            = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>;
const IconAlert        = (p) => <Icon {...p}><path d="m21.7 18.4-9-15.4a1.5 1.5 0 0 0-2.6 0l-9 15.4A1.5 1.5 0 0 0 2.4 21h17.2a1.5 1.5 0 0 0 2.1-2.6Z"/><path d="M12 9v4M12 17h.01"/></Icon>;
const IconClock        = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
const IconLogout       = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></Icon>;
const IconRefresh      = (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></Icon>;
const IconCash         = (p) => <Icon {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v.01M18 14v.01"/></Icon>;
const IconCard         = (p) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></Icon>;
const IconUserPlus     = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></Icon>;
const IconArrowUp      = (p) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>;
const IconArrowDown    = (p) => <Icon {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></Icon>;
const IconDot          = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></Icon>;
const IconGrip         = (p) => <Icon {...p}><circle cx="9"  cy="6"  r="1" fill="currentColor"/><circle cx="9"  cy="12" r="1" fill="currentColor"/><circle cx="9"  cy="18" r="1" fill="currentColor"/><circle cx="15" cy="6"  r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></Icon>;
const IconFilter       = (p) => <Icon {...p}><path d="M3 4h18l-7 9v6l-4 2v-8L3 4z"/></Icon>;
const IconMoreHoriz    = (p) => <Icon {...p}><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></Icon>;
const IconSend         = (p) => <Icon {...p}><path d="m22 2-11 20-3-9-9-3 23-8z"/><path d="M22 2 11 13"/></Icon>;
const IconPrinter      = (p) => <Icon {...p}><path d="M6 9V2h12v7"/><rect x="3" y="9" width="18" height="9" rx="2"/><rect x="6" y="14" width="12" height="8" rx="1"/></Icon>;
const IconLock         = (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Icon>;
const IconNote         = (p) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></Icon>;
const IconShield       = (p) => <Icon {...p}><path d="M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3z"/></Icon>;
const IconArchive      = (p) => <Icon {...p}><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></Icon>;
const IconHeart        = (p) => <Icon {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></Icon>;

Object.assign(window, {
  Icon,
  IconDome, IconLayout, IconCalendar, IconUsers, IconWalkin, IconWhatsapp, IconPhone,
  IconReceipt, IconWallet, IconStethoscope, IconBuilding, IconChart, IconSettings,
  IconSearch, IconBell, IconPlus, IconChevronRight, IconChevronDown, IconCheck,
  IconCheckDouble, IconX, IconAlert, IconClock, IconLogout, IconRefresh, IconCash,
  IconCard, IconUserPlus, IconArrowUp, IconArrowDown, IconDot, IconGrip, IconFilter,
  IconMoreHoriz, IconSend, IconPrinter, IconLock, IconNote, IconShield, IconArchive,
  IconHeart,
});
