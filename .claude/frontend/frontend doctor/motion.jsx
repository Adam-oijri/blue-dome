// Lightweight motion + skeleton + toast (mimicking framer-motion + shadcn primitives)

// ---- Motion primitive (framer-motion-style API) ----
const Motion = ({ as = "div", initial, animate, exit, transition, className, style, children, ...rest }) => {
  const [phase, setPhase] = React.useState("initial");
  const ref = React.useRef(null);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setPhase("animate"));
    return () => cancelAnimationFrame(id);
  }, []);
  const v = phase === "initial" ? initial : animate;
  const dur = (transition?.duration ?? 0.28) + "s";
  const ease = transition?.ease || "cubic-bezier(0.16, 1, 0.3, 1)";
  const delay = (transition?.delay ?? 0) + "s";
  const merged = {
    transition: `all ${dur} ${ease} ${delay}`,
    transform: `translate3d(${v?.x ?? 0}px, ${v?.y ?? 0}px, 0) scale(${v?.scale ?? 1})`,
    opacity: v?.opacity ?? 1,
    ...style,
  };
  const Tag = as;
  return <Tag ref={ref} className={className} style={merged} {...rest}>{children}</Tag>;
};

const FadeIn = ({ delay = 0, y = 8, children, className, style }) => (
  <Motion initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.32, delay }} className={className} style={style}>
    {children}
  </Motion>
);

const Stagger = ({ children, gap = 0.06 }) => {
  const arr = React.Children.toArray(children);
  return <>{arr.map((c, i) => <FadeIn key={i} delay={i * gap}>{c}</FadeIn>)}</>;
};

// ---- Skeleton (shadcn) ----
const Skeleton = ({ className = "", style }) => <div className={"skeleton " + className} style={style}/>;

const PageSkeleton = () => (
  <div className="page">
    <div style={{ marginBottom: 24 }}>
      <Skeleton className="sk-line" style={{ width: 220, height: 24, marginBottom: 10 }}/>
      <Skeleton className="sk-line" style={{ width: 320, height: 12 }}/>
    </div>
    <div className="kpi-grid" style={{ marginBottom: 24 }}>
      {[0,1,2,3].map(i => <Skeleton key={i} className="sk-card"/>)}
    </div>
    <div className="two-col">
      <div className="card" style={{ padding: 16 }}>
        <Skeleton className="sk-line" style={{ width: 180, height: 16, marginBottom: 16 }}/>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="row gap-12" style={{ marginBottom: 12 }}>
            <Skeleton style={{ width: 36, height: 36, borderRadius: 50 }}/>
            <div style={{ flex: 1 }}>
              <Skeleton className="sk-line" style={{ width: "60%", marginBottom: 6 }}/>
              <Skeleton className="sk-line" style={{ width: "40%", height: 10 }}/>
            </div>
            <Skeleton style={{ width: 64, height: 22, borderRadius: 999 }}/>
          </div>
        ))}
      </div>
      <div className="col gap-16">
        <Skeleton className="sk-card"/>
        <Skeleton className="sk-card" style={{ height: 140 }}/>
        <Skeleton className="sk-card"/>
      </div>
    </div>
  </div>
);

// ---- Toaster (shadcn-style stack) ----
let _toastId = 0;
const ToastContext = React.createContext({ push: () => {} });
const useToaster = () => React.useContext(ToastContext);

const Toaster = ({ children }) => {
  const [items, setItems] = React.useState([]);
  const push = React.useCallback((arg) => {
    const t = typeof arg === "string"
      ? { title: arg, variant: "success" }
      : { variant: "success", ...arg };
    const id = ++_toastId;
    setItems(prev => [...prev, { ...t, id }]);
    setTimeout(() => setItems(prev => prev.filter(x => x.id !== id)), t.duration || 3200);
  }, []);
  // global handle
  React.useEffect(() => { window.toast = push; }, [push]);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-region">
        {items.map(it => (
          <Motion key={it.id}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.26 }}
            className="toast">
            <div className="toast-icon" style={
              it.variant === "danger"
                ? { background: "rgba(185,28,28,0.10)", color: "var(--danger)" }
                : it.variant === "info"
                  ? { background: "var(--info-bg)", color: "var(--info)" }
                  : {}
            }>
              <Icon name={it.variant === "danger" ? "alert" : "check"} size={14}/>
            </div>
            <div>
              <div className="toast-title">{it.title}</div>
              {it.description && <div className="toast-desc">{it.description}</div>}
            </div>
            <button className="btn btn-ghost btn-icon btn-sm toast-close"
              onClick={() => setItems(prev => prev.filter(x => x.id !== it.id))}>
              <Icon name="x" size={13}/>
            </button>
          </Motion>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

window.Motion = Motion;
window.FadeIn = FadeIn;
window.Stagger = Stagger;
window.Skeleton = Skeleton;
window.PageSkeleton = PageSkeleton;
window.Toaster = Toaster;
window.useToaster = useToaster;
