// Reusable modal/drawer + create-new forms

const Modal = ({ title, subtitle, onClose, children, footer }) => {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-drawer">
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

const Toast = ({ msg, onDone }) => null;

// ----- Create flows -----

const NewPatientForm = ({ onClose, onSaved }) => (
  <Modal title="New patient" subtitle="Create a new patient record" onClose={onClose}
    footer={<>
      <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      <button className="btn btn-accent btn-sm" onClick={() => { onSaved("Patient created"); onClose(); }}>
        <Icon name="check" size={13}/> Create patient
      </button>
    </>}>
    <div className="form-grid">
      <div><div className="label">First name *</div><input placeholder="Hassan"/></div>
      <div><div className="label">Last name *</div><input placeholder="El Amrani"/></div>
      <div><div className="label">Date of birth *</div><input type="date"/></div>
      <div><div className="label">Gender</div>
        <select defaultValue=""><option value="">Select…</option><option>Male</option><option>Female</option></select>
      </div>
      <div><div className="label">Blood type</div>
        <select defaultValue=""><option value="">Unknown</option>
          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div><div className="label">National ID / CIN</div><input placeholder="AB123456"/></div>
      <div><div className="label">Phone *</div><input placeholder="+212 6 XX XX XX XX"/></div>
      <div><div className="label">Email</div><input type="email" placeholder="patient@email.com"/></div>
      <div className="full"><div className="label">Address</div><input placeholder="Street, City"/></div>
      <div><div className="label">Insurance</div>
        <select defaultValue=""><option value="">None</option>
          {["CNSS","CNOPS","Saham","AXA","Wafa"].map(i => <option key={i}>{i}</option>)}
        </select>
      </div>
      <div><div className="label">Insurance #</div><input placeholder="POL-123456"/></div>
      <div className="full"><div className="label">Known allergies</div><input placeholder="Penicillin, Aspirin…"/></div>
      <div className="full"><div className="label">Chronic conditions</div><input placeholder="Hypertension, Diabetes…"/></div>
      <div className="full"><div className="label">Notes</div><textarea rows={3} placeholder="Additional notes…"/></div>
    </div>
  </Modal>
);

const NewAppointmentForm = ({ onClose, onSaved }) => (
  <Modal title="New appointment" subtitle="Schedule a patient visit" onClose={onClose}
    footer={<>
      <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      <button className="btn btn-outline btn-sm" onClick={() => { onSaved("Saved as draft"); onClose(); }}>Save draft</button>
      <button className="btn btn-accent btn-sm" onClick={() => { onSaved("Appointment booked · WhatsApp sent"); onClose(); }}>
        <Icon name="whatsapp" size={13}/> Book & notify
      </button>
    </>}>
    <div className="form-grid">
      <div className="full"><div className="label">Patient *</div>
        <select><option>Hassan El Amrani · P-002841</option>
          {MOCK.patients.slice(1).map(p => <option key={p.id}>{p.name.en} · {p.id}</option>)}
          <option>+ Create new patient…</option>
        </select>
      </div>
      <div><div className="label">Doctor *</div>
        <select><option>Dr. Karim Lahlou — Cardiology</option><option>Dr. Salma Idrissi — GP</option><option>Dr. Mehdi Khalil — Pediatrics</option></select>
      </div>
      <div><div className="label">Branch</div>
        <select><option>Casablanca Main</option><option>Rabat Branch</option></select>
      </div>
      <div><div className="label">Date *</div><input type="date" defaultValue="2026-05-08"/></div>
      <div><div className="label">Time *</div><input type="time" defaultValue="09:30"/></div>
      <div><div className="label">Duration</div>
        <select defaultValue="30"><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option></select>
      </div>
      <div><div className="label">Type</div>
        <select><option>Consultation</option><option>Follow-up</option><option>Procedure</option><option>Lab review</option></select>
      </div>
      <div className="full"><div className="label">Reason</div><input placeholder="Chest pain, follow-up, refill…"/></div>
      <div className="full"><div className="label">Internal notes</div><textarea rows={3} placeholder="Notes for staff (not shared with patient)"/></div>
      <div className="full">
        <label className="row gap-12" style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer" }}>
          <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }}/>
          <Icon name="whatsapp" size={14} className="muted"/>
          <div style={{ flex: 1, fontSize: 13 }}>Send WhatsApp confirmation immediately</div>
        </label>
      </div>
    </div>
  </Modal>
);

const NewInvoiceForm = ({ onClose, onSaved }) => {
  const [lines, setLines] = React.useState([
    { desc: "Consultation", qty: 1, price: 450 },
  ]);
  const total = lines.reduce((s, l) => s + (l.qty * l.price), 0);
  return (
    <Modal title="New invoice" subtitle="Generate an invoice for a patient" onClose={onClose}
      footer={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-outline btn-sm" onClick={() => { onSaved("Saved as draft"); onClose(); }}>Save draft</button>
        <button className="btn btn-accent btn-sm" onClick={() => { onSaved("Invoice INV-2026-04813 created"); onClose(); }}>
          <Icon name="check" size={13}/> Create & send
        </button>
      </>}>
      <div className="form-grid">
        <div className="full"><div className="label">Patient *</div>
          <select>{MOCK.patients.map(p => <option key={p.id}>{p.name.en} · {p.id}</option>)}</select>
        </div>
        <div><div className="label">Issue date</div><input type="date" defaultValue="2026-05-07"/></div>
        <div><div className="label">Due date</div><input type="date" defaultValue="2026-05-21"/></div>
        <div><div className="label">Currency</div><select><option>MAD</option><option>EUR</option></select></div>
        <div><div className="label">Insurance</div><select><option>None</option><option>Saham (70%)</option><option>CNSS</option></select></div>
      </div>

      <div className="label" style={{ marginTop: 20 }}>Line items</div>
      <div className="col gap-12">
        {lines.map((l, i) => (
          <div key={i} className="row gap-12" style={{ alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><input value={l.desc} placeholder="Description"
              onChange={e => { const n=[...lines]; n[i].desc=e.target.value; setLines(n); }}/></div>
            <div style={{ width: 64 }}><input type="number" value={l.qty}
              onChange={e => { const n=[...lines]; n[i].qty=+e.target.value||0; setLines(n); }}/></div>
            <div style={{ width: 100 }}><input type="number" value={l.price}
              onChange={e => { const n=[...lines]; n[i].price=+e.target.value||0; setLines(n); }}/></div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setLines(lines.filter((_,j)=>j!==i))}><Icon name="x" size={13}/></button>
          </div>
        ))}
      </div>
      <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }}
        onClick={() => setLines([...lines, { desc: "", qty: 1, price: 0 }])}>
        <Icon name="plus" size={13}/> Add line
      </button>

      <div style={{ marginTop: 20, padding: 14, background: "var(--muted)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="muted" style={{ fontSize: 12 }}>Total</span>
        <span className="tabular" style={{ fontSize: 22, fontWeight: 700 }}>{total.toLocaleString()} MAD</span>
      </div>
    </Modal>
  );
};

const NewLabOrderForm = ({ onClose, onSaved }) => (
  <Modal title="New lab order" subtitle="Order tests from an external lab" onClose={onClose}
    footer={<>
      <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      <button className="btn btn-accent btn-sm" onClick={() => { onSaved("Lab order LAB-2026-1843 sent"); onClose(); }}>
        <Icon name="check" size={13}/> Send to lab
      </button>
    </>}>
    <div className="form-grid">
      <div className="full"><div className="label">Patient *</div>
        <select>{MOCK.patients.map(p => <option key={p.id}>{p.name.en} · {p.id}</option>)}</select>
      </div>
      <div><div className="label">Lab</div>
        <select><option>Lab Biocenter</option><option>Lab Pasteur</option><option>Lab Cerba</option></select>
      </div>
      <div><div className="label">Urgency</div>
        <select><option>Routine</option><option>Urgent</option><option>STAT</option></select>
      </div>
      <div><div className="label">Sample collection</div>
        <select><option>In-clinic</option><option>At lab</option><option>At home</option></select>
      </div>
      <div><div className="label">Fasting required</div><select><option>No</option><option>Yes (12h)</option></select></div>

      <div className="full">
        <div className="label" style={{ marginTop: 8 }}>Tests requested</div>
        <div className="col gap-12">
          {[
            ["CBC (Complete blood count)", true],
            ["Lipid panel", true],
            ["HbA1c", false],
            ["Liver function (ALT, AST)", false],
            ["Thyroid panel (TSH, T3, T4)", false],
            ["Troponin I", false],
            ["Urinalysis", false],
          ].map(([l, on], i) => (
            <label key={i} className="row gap-12" style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>
              <input type="checkbox" defaultChecked={on} style={{ width: 16, height: 16 }}/>
              <span style={{ fontSize: 13 }}>{l}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="full"><div className="label">Clinical info for lab</div><textarea rows={3} placeholder="Diagnosis, relevant medications…"/></div>
    </div>
  </Modal>
);

const AddInventoryForm = ({ onClose, onSaved }) => (
  <Modal title="Add inventory item" subtitle="Track a new medication or supply" onClose={onClose}
    footer={<>
      <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      <button className="btn btn-accent btn-sm" onClick={() => { onSaved("Item added to inventory"); onClose(); }}>
        <Icon name="check" size={13}/> Add item
      </button>
    </>}>
    <div className="form-grid">
      <div className="full"><div className="label">Item name *</div><input placeholder="Atorvastatin 20mg"/></div>
      <div><div className="label">Category</div>
        <select><option>Medication</option><option>Supplies</option><option>Equipment</option><option>Disposable</option></select>
      </div>
      <div><div className="label">Unit</div>
        <select><option>Tablets</option><option>Boxes</option><option>Vials</option><option>Pieces</option><option>ml</option></select>
      </div>
      <div><div className="label">Initial stock</div><input type="number" placeholder="100"/></div>
      <div><div className="label">Min level (alert)</div><input type="number" placeholder="20"/></div>
      <div><div className="label">Batch / Lot #</div><input placeholder="ATV-2024-08"/></div>
      <div><div className="label">Expiry date</div><input type="date"/></div>
      <div><div className="label">Unit cost (MAD)</div><input type="number" placeholder="0"/></div>
      <div><div className="label">Branch</div>
        <select><option>Casablanca Main</option><option>Rabat Branch</option><option>All branches</option></select>
      </div>
      <div className="full"><div className="label">Supplier</div><input placeholder="Cooper Pharma…"/></div>
      <div className="full"><div className="label">Notes</div><textarea rows={2}/></div>
    </div>
  </Modal>
);

const InviteStaffForm = ({ onClose, onSaved }) => (
  <Modal title="Invite team member" subtitle="They'll receive an email to set up their account" onClose={onClose}
    footer={<>
      <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      <button className="btn btn-accent btn-sm" onClick={() => { onSaved("Invitation sent"); onClose(); }}>
        <Icon name="check" size={13}/> Send invite
      </button>
    </>}>
    <div className="form-grid">
      <div><div className="label">First name *</div><input placeholder="Hicham"/></div>
      <div><div className="label">Last name *</div><input placeholder="Tazi"/></div>
      <div className="full"><div className="label">Email *</div><input type="email" placeholder="hicham@cabinet-lahlou.ma"/></div>
      <div><div className="label">Phone</div><input placeholder="+212 6…"/></div>
      <div><div className="label">Role *</div>
        <select><option>Doctor</option><option>Secretary</option><option>Nurse</option><option>Accountant</option><option>Admin</option></select>
      </div>
      <div><div className="label">Specialty (if doctor)</div><input placeholder="Cardiology, GP…"/></div>
      <div><div className="label">Branch</div>
        <select><option>Casablanca Main</option><option>Rabat Branch</option></select>
      </div>
      <div className="full"><div className="label">Working hours</div>
        <input placeholder="Mon–Fri 09:00–18:00"/>
      </div>
      <div className="full">
        <label className="row gap-12" style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer" }}>
          <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }}/>
          <div style={{ flex: 1, fontSize: 13 }}>Send welcome email immediately</div>
        </label>
      </div>
    </div>
  </Modal>
);

const AddBranchForm = ({ onClose, onSaved }) => (
  <Modal title="Add branch" subtitle="Open a new clinic location" onClose={onClose}
    footer={<>
      <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      <button className="btn btn-accent btn-sm" onClick={() => { onSaved("Branch created"); onClose(); }}>
        <Icon name="check" size={13}/> Create branch
      </button>
    </>}>
    <div className="form-grid">
      <div className="full"><div className="label">Branch name *</div><input placeholder="Marrakech Branch"/></div>
      <div><div className="label">Code</div><input placeholder="MRK-003"/></div>
      <div><div className="label">Phone</div><input placeholder="+212 5…"/></div>
      <div className="full"><div className="label">Address *</div><input placeholder="Avenue Mohammed VI, Marrakech"/></div>
      <div><div className="label">City</div><input placeholder="Marrakech"/></div>
      <div><div className="label">Manager</div>
        <select><option>Assign later</option><option>Dr. Karim Lahlou</option><option>Dr. Salma Idrissi</option></select>
      </div>
    </div>
  </Modal>
);

window.Modal = Modal;
window.Toast = Toast;
window.NewPatientForm = NewPatientForm;
window.NewAppointmentForm = NewAppointmentForm;
window.NewInvoiceForm = NewInvoiceForm;
window.NewLabOrderForm = NewLabOrderForm;
window.AddInventoryForm = AddInventoryForm;
window.InviteStaffForm = InviteStaffForm;
window.AddBranchForm = AddBranchForm;
