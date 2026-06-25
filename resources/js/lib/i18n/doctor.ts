// TRANSIENT — replace with usePage().props.translations in phase 2.
// Source of truth: .claude/frontend/frontend doctor/i18n.js

export type DoctorLang = 'en' | 'fr' | 'ar';

export type DoctorDictionary = {
    dir: 'ltr' | 'rtl';
    brand: string;
    brand_sub: string;

    nav_main: string;
    nav_clinical: string;
    nav_admin: string;
    dashboard: string;
    appointments: string;
    patients: string;
    consultations: string;
    prescriptions: string;
    lab_orders: string;
    invoices: string;
    inventory: string;
    staff: string;
    settings: string;
    follow_up: string;
    confirmations: string;
    messages: string;
    no_appointments: string;
    all_confirmed: string;

    search_placeholder: string;
    new_appointment: string;

    good_morning: string;
    today_summary: string;
    todays_patients: string;
    pending_confirmations: string;
    revenue_today: string;
    waiting_room: string;
    todays_schedule: string;
    view_calendar: string;
    upcoming: string;
    in_progress: string;
    completed: string;
    no_show: string;
    quick_actions: string;
    recent_patients: string;
    notifications: string;
    waiting: string;
    confirmed: string;
    pending: string;
    arrived: string;
    cancelled: string;

    patient_id: string;
    age: string;
    blood_type: string;
    gender: string;
    phone: string;
    insurance: string;
    last_visit: string;
    overview: string;
    medical_history: string;
    visits: string;
    rx: string;
    labs: string;
    billing: string;
    vital_signs: string;
    allergies: string;
    chronic_diseases: string;
    current_meds: string;
    family_history: string;
    surgical_history: string;

    week: string;
    day: string;
    month: string;
    today: string;

    new_rx: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    save_send: string;

    male: string;
    female: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    settings_appearance_title: string;
    settings_appearance_help: string;

    // Actions
    new_lab_order: string;
    new_invoice: string;
    new_medication: string;
    new_expense: string;
    all_label: string;
    apply: string;
    edit: string;
    delete_action: string;
    save_changes: string;
    back: string;
    search_label: string;
    yes: string;
    no_label: string;

    // Columns / labels
    col_date: string;
    col_amount: string;
    col_status: string;
    col_patient: string;
    col_doctor: string;
    col_description: string;
    col_qty: string;
    col_unit_price: string;
    col_discount: string;
    col_method: string;
    col_category: string;
    col_vendor: string;
    col_total: string;
    col_balance: string;
    col_when: string;
    col_bp: string;

    // Invoices
    subtotal: string;
    balance_due: string;
    paid_label: string;
    issued: string;
    due: string;
    line_items: string;
    payments_label: string;
    outstanding: string;
    invoiced_mtd: string;
    collected_mtd: string;
    overdue: string;
    all_invoices: string;
    no_invoices: string;
    no_payments: string;
    no_line_items: string;
    back_to_invoices: string;
    search_invoices_ph: string;

    // Lab orders
    order_col: string;
    tests_col: string;
    lab_col: string;
    urgency_col: string;
    in_house: string;
    lab_external: string;
    external_lab_name: string;
    critical_results: string;
    recent_orders: string;
    no_lab_orders: string;
    no_critical_results: string;
    abnormal_short: string;
    result_critical: string;
    result_high: string;

    // Medications
    medications: string;
    formulary: string;
    trade_name: string;
    generic_name: string;
    form_label: string;
    strength: string;
    manufacturer: string;
    dispensing: string;
    requires_prescription: string;
    rx_badge: string;
    otc: string;
    active_label: string;
    inactive_label: string;
    no_medications: string;
    add_medication: string;
    edit_medication: string;
    search_medications_ph: string;
    eg_tablet: string;

    // Vital signs
    record_new_reading: string;
    temp_c: string;
    bp_sys: string;
    bp_dia: string;
    hr_label: string;
    weight_kg: string;
    height_cm: string;
    notes_label: string;
    record_action: string;
    history_label: string;
    bmi: string;
    pain: string;
    back_to_patient: string;

    // Expenses
    expenses: string;
    all_expenses: string;
    no_expenses: string;
    expense_col: string;

    // Appointments
    all_statuses: string;
    confirmed_q: string;

    // Shared generic UI
    export_label: string;
    clear_label: string;
    cancel_label: string;
    create_label: string;
    add_label: string;
    remove_label: string;
    view_details: string;
    none_label: string;
    not_specified: string;
    other_label: string;
    read_only: string;
    select_patient_ph: string;
    select_medication_ph: string;
    none_recorded: string;
    required_mark: string;

    // Generic field labels
    first_name: string;
    last_name: string;
    date_of_birth: string;
    email: string;
    address: string;
    national_id: string;
    insurance_number: string;
    phone_e164: string;
    title_label: string;
    type_label: string;
    date_label: string;
    notes_field: string;
    website: string;
    contact_person: string;
    tax_number: string;
    payment_terms: string;
    bank_account: string;
    contact_label: string;
    details_label: string;
    additional_label: string;

    // Patients pages
    new_patient: string;
    search_by_name_ph: string;
    no_patients_found: string;
    clinic_label: string;
    branch_label: string;
    registered_label: string;
    filtered_by_patient: string;
    patient_information: string;
    clinical_label: string;
    no_vital_signs: string;
    last_recorded: string;
    heart_rate_label: string;
    temp_label: string;
    spo2_label: string;
    weight_label: string;

    // Prescriptions pages
    prescription_label: string;
    doctor_label: string;
    expires_label: string;
    no_prescriptions: string;
    no_rx_medications: string;
    issue_prescription: string;
    issue_prescription_desc: string;
    edit_prescription: string;
    edit_prescription_desc: string;
    rx_meds_locked: string;
    medication_name_ph: string;
    freq_twice_daily_ph: string;
    diagnosis_label: string;
    route_label: string;
    days_label: string;
    read_only_label: string;

    // Medical records pages
    new_record: string;
    new_medical_record: string;
    edit_record: string;
    new_record_desc: string;
    record_title_col: string;
    record_author: string;
    no_records: string;
    all_types: string;
    confidential_label: string;
    signed_label: string;
    unsigned_label: string;
    sign_label: string;
    sign_confirm: string;
    confidential_field: string;
    subjective_label: string;
    objective_label: string;
    assessment_label: string;
    plan_label: string;
    clinical_notes: string;
    no_clinical_content: string;
    signed_by: string;

    // Lab orders pages
    lab_order_label: string;
    edit_lab_order: string;
    no_tests_on_order: string;
    test_col: string;
    specimen_col: string;
    normal_range_col: string;
    result_col: string;
    clinical_diagnosis: string;
    fasting_required: string;
    images_label: string;
    no_images: string;
    add_images: string;
    attached_images: string;
    order_date: string;
    ordered_label: string;

    // Inventory pages
    items_tracked: string;
    add_item: string;
    add_inventory_item: string;
    add_inventory_item_desc: string;
    edit_inventory_item: string;
    edit_inventory_item_desc: string;
    reorder_list: string;
    total_items: string;
    low_stock: string;
    critical_label: string;
    expiring_soon: string;
    stock_levels: string;
    all_categories: string;
    all_branches: string;
    filter_by_category: string;
    filter_by_branch: string;
    item_col: string;
    stock_col: string;
    min_level_col: string;
    expiry_col: string;
    no_inventory_items: string;
    in_stock_label: string;
    out_of_stock_label: string;
    refrigerated_label: string;
    item_details: string;
    sourcing_label: string;
    stock_movements: string;
    no_stock_movements: string;
    reorder_point_label: string;
    purchase_price_label: string;
    selling_price_label: string;
    min_level_value: string;
    max_value: string;
    unit_label: string;
    batch_number: string;
    serial_number: string;
    expiration_label: string;
    location_label: string;
    linked_medication: string;
    refrigeration_label: string;
    required_label: string;
    not_required_label: string;
    current_stock: string;
    quantity_in_stock: string;
    stock_adjust_note: string;
    item_name_label: string;
    item_code_label: string;
    expiration_date_label: string;
    delete_inventory_confirm: string;
    inventory_alerts: string;
    items_need_attention: string;
    expired_label: string;
    at_below_reorder: string;
    expiring_or_expired: string;
    all_above_reorder: string;
    no_items_expiring: string;
    days_ago: string;
    in_days: string;
    requires_refrigeration_label: string;
    qty_in_stock_short: string;
    reorder_pt_short: string;
    location_in_clinic: string;

    // Vendors pages
    vendors: string;
    new_vendor: string;
    no_vendors: string;
    vendor_col: string;
    contact_col: string;
    add_vendor: string;
    add_vendor_desc: string;
    edit_vendor: string;
    edit_vendor_desc: string;
    vendor_details: string;
    vendor_name_label: string;
    billing_label: string;
    active_vendor: string;
    create_vendor: string;
    back_to_vendors: string;
    delete_vendor_confirm: string;
    vendor_category_ph: string;
    custom_category_ph: string;
    added_label: string;
    updated_label: string;

    // Expenses pages
    expense_label: string;
    edit_expense: string;
    edit_expense_desc: string;
    expense_details: string;
    paid_to: string;
    paid_date: string;
    recorded_by: string;
    recurring_label: string;
    payment_status_label: string;
    delete_expense_confirm: string;
    update_expense_desc: string;

    // Medications pages
    add_medication_page: string;
    atc_code: string;
    side_effects: string;
    contraindications: string;
    storage_instructions: string;
    clinical_details: string;
    delete_medication_confirm: string;

    // Invoices pages
    edit_invoice: string;
    invoice_details: string;
    summary_label: string;
    tax_label: string;
    insurance_claim_number: string;
    insurance_coverage_pct: string;

    // Documents pages
    documents: string;
    document: string;
    folders: string;
    folder: string;
    no_documents: string;
    no_folders: string;
    new_document: string;
    new_folder: string;
    upload: string;
    download: string;
    export_pdf: string;
    preview_label: string;
    file: string;
    document_type: string;
    uploaded_by: string;
    size: string;
    expires: string;
    private_label: string;
    system_label: string;
    all_folders: string;

    // Pagination
    pagination_summary: string;

    // Sheet descriptions & extra field labels
    start_label: string;
    end_label: string;
    select_doctor_ph: string;
    loading_ph: string;
    new_appt_doctor_desc: string;
    new_appt_secretary_desc: string;
    new_patient_desc: string;
    new_lab_order_desc: string;
    test_name_label: string;
    test_code_label: string;
    test_category_label: string;
    specimen_type_label: string;
    attachments_label: string;
    files_selected: string;
    add_test_label: string;
    log_expense_desc: string;
    recurring_expense_label: string;
    recurring_end_date: string;
    new_invoice_desc: string;
    quantity_label: string;
    empty_no_vital_signs: string;

    // Enum-label maps (raw DB value → localized label)
    invoice_status_opts: Record<string, string>;
    payment_status_opts: Record<string, string>;
    payment_method_opts: Record<string, string>;
    lab_status_opts: Record<string, string>;
    urgency_opts: Record<string, string>;
    appt_status_opts: Record<string, string>;
    appt_type_opts: Record<string, string>;
    appt_priority_opts: Record<string, string>;
    appt_start: string;
    appt_end: string;
    chief_complaint: string;
    priority_label: string;
    status_label: string;
    confirmation_label: string;
    cancel_appointment: string;
    cancel_reason_ph: string;
    prescription_status_opts: Record<string, string>;
    record_type_opts: Record<string, string>;
    gender_opts: Record<string, string>;
    inventory_category_opts: Record<string, string>;
    route_opts: Record<string, string>;
    vendor_category_opts: Record<string, string>;
    expense_category_opts: Record<string, string>;
    recurring_frequency_opts: Record<string, string>;
    inventory_txn_opts: Record<string, string>;
    invoice_item_type_opts: Record<string, string>;
    document_type_opts: Record<string, string>;
};

const en: DoctorDictionary = {
    dir: 'ltr',
    brand: 'BLUE DOME',
    brand_sub: 'Clinic Suite',
    nav_main: 'Workspace',
    nav_clinical: 'Clinical',
    nav_admin: 'Administration',
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    patients: 'Patients',
    consultations: 'Consultations',
    prescriptions: 'Prescriptions',
    lab_orders: 'Lab Orders',
    invoices: 'Invoices',
    inventory: 'Inventory',
    staff: 'Staff & Branches',
    settings: 'Settings',
    follow_up: 'Follow-up Calls',
    confirmations: 'Confirmations',
    messages: 'Messages',
    no_appointments: 'No appointments',
    all_confirmed: 'All upcoming appointments are confirmed',
    search_placeholder: 'Search patients, appointments, prescriptions…',
    new_appointment: 'New appointment',
    good_morning: 'Good morning, Dr. Lahlou',
    today_summary: "Here's your day at a glance — Tuesday, May 5, 2026",
    todays_patients: "Today's patients",
    pending_confirmations: 'Pending confirmations',
    revenue_today: 'Revenue today',
    waiting_room: 'In waiting room',
    todays_schedule: "Today's schedule",
    view_calendar: 'View calendar',
    upcoming: 'Upcoming',
    in_progress: 'In progress',
    completed: 'Completed',
    no_show: 'No show',
    quick_actions: 'Quick actions',
    recent_patients: 'Recent patients',
    notifications: 'Notifications',
    waiting: 'Waiting',
    confirmed: 'Confirmed',
    pending: 'Pending',
    arrived: 'Arrived',
    cancelled: 'Cancelled',
    patient_id: 'Patient ID',
    age: 'Age',
    blood_type: 'Blood type',
    gender: 'Gender',
    phone: 'Phone',
    insurance: 'Insurance',
    last_visit: 'Last visit',
    overview: 'Overview',
    medical_history: 'Medical history',
    visits: 'Visits',
    rx: 'Prescriptions',
    labs: 'Lab results',
    billing: 'Billing',
    vital_signs: 'Vital signs',
    allergies: 'Allergies',
    chronic_diseases: 'Chronic conditions',
    current_meds: 'Current medications',
    family_history: 'Family history',
    surgical_history: 'Surgical history',
    week: 'Week',
    day: 'Day',
    month: 'Month',
    today: 'Today',
    new_rx: 'New prescription',
    medication: 'Medication',
    dosage: 'Dosage',
    frequency: 'Frequency',
    duration: 'Duration',
    save_send: 'Save & send via WhatsApp',
    male: 'Male',
    female: 'Female',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
    settings_appearance_title: 'Appearance',
    settings_appearance_help:
        'Choose how the interface looks. Applies everywhere.',

    new_lab_order: 'New lab order',
    new_invoice: 'New invoice',
    new_medication: 'New medication',
    new_expense: 'New expense',
    all_label: 'All',
    apply: 'Apply',
    edit: 'Edit',
    delete_action: 'Delete',
    save_changes: 'Save changes',
    back: 'Back',
    search_label: 'Search',
    yes: 'Yes',
    no_label: 'No',

    col_date: 'Date',
    col_amount: 'Amount',
    col_status: 'Status',
    col_patient: 'Patient',
    col_doctor: 'Doctor',
    col_description: 'Description',
    col_qty: 'Qty',
    col_unit_price: 'Unit price',
    col_discount: 'Discount',
    col_method: 'Method',
    col_category: 'Category',
    col_vendor: 'Vendor',
    col_total: 'Total',
    col_balance: 'Balance',
    col_when: 'When',
    col_bp: 'BP',

    subtotal: 'Subtotal',
    balance_due: 'Balance due',
    paid_label: 'Paid',
    issued: 'Issued',
    due: 'Due',
    line_items: 'Line items',
    payments_label: 'Payments',
    outstanding: 'Outstanding',
    invoiced_mtd: 'Invoiced (MTD)',
    collected_mtd: 'Collected (MTD)',
    overdue: 'Overdue',
    all_invoices: 'All invoices',
    no_invoices: 'No invoices yet.',
    no_payments: 'No payments recorded.',
    no_line_items: 'No line items.',
    back_to_invoices: 'Back to invoices',
    search_invoices_ph: 'Search this page...',

    order_col: 'Order',
    tests_col: 'Tests',
    lab_col: 'Lab',
    urgency_col: 'Urgency',
    in_house: 'Internal',
    lab_external: 'External',
    external_lab_name: 'External laboratory name',
    critical_results: 'Critical results',
    recent_orders: 'Recent orders',
    no_lab_orders: 'No lab orders yet.',
    no_critical_results: 'No critical results pending review.',
    abnormal_short: 'abn.',
    result_critical: 'Critical',
    result_high: 'High',

    medications: 'Medications',
    formulary: 'Formulary',
    trade_name: 'Trade name',
    generic_name: 'Generic name',
    form_label: 'Form',
    strength: 'Strength',
    manufacturer: 'Manufacturer',
    dispensing: 'Dispensing',
    requires_prescription: 'Requires prescription',
    rx_badge: 'Rx',
    otc: 'OTC',
    active_label: 'Active',
    inactive_label: 'Inactive',
    no_medications: 'No medications in the formulary yet.',
    add_medication: 'Add medication',
    edit_medication: 'Edit medication',
    search_medications_ph: 'Search medications...',
    eg_tablet: 'e.g. tablet',

    record_new_reading: 'Record new reading',
    temp_c: 'Temp (°C)',
    bp_sys: 'BP sys',
    bp_dia: 'BP dia',
    hr_label: 'HR',
    weight_kg: 'Weight (kg)',
    height_cm: 'Height (cm)',
    notes_label: 'Notes',
    record_action: 'Record',
    history_label: 'History',
    bmi: 'BMI',
    pain: 'Pain',
    back_to_patient: 'Back to patient',

    expenses: 'Expenses',
    all_expenses: 'All expenses',
    no_expenses: 'No expenses yet.',
    expense_col: 'Expense',

    all_statuses: 'All statuses',
    confirmed_q: 'Confirmed?',

    export_label: 'Export',
    clear_label: 'Clear',
    cancel_label: 'Cancel',
    create_label: 'Create',
    add_label: 'Add',
    remove_label: 'Remove',
    view_details: 'View details',
    none_label: 'None',
    not_specified: 'Not specified',
    other_label: 'Other…',
    read_only: '(read-only)',
    select_patient_ph: 'Select a patient…',
    select_medication_ph: 'Select a medication…',
    none_recorded: 'None recorded',
    required_mark: '*',

    first_name: 'First name',
    last_name: 'Last name',
    date_of_birth: 'Date of birth',
    email: 'Email',
    address: 'Address',
    national_id: 'National ID',
    insurance_number: 'Insurance #',
    phone_e164: 'Phone (E.164)',
    title_label: 'Title',
    type_label: 'Type',
    date_label: 'Date',
    notes_field: 'Notes',
    website: 'Website',
    contact_person: 'Contact person',
    tax_number: 'Tax number',
    payment_terms: 'Payment terms',
    bank_account: 'Bank account',
    contact_label: 'Contact',
    details_label: 'Details',
    additional_label: 'Additional',

    new_patient: 'New patient',
    search_by_name_ph: 'Search by name…',
    no_patients_found: 'No patients found.',
    clinic_label: 'Clinic',
    branch_label: 'Branch',
    registered_label: 'Registered',
    filtered_by_patient: 'Filtered by patient',
    patient_information: 'Patient information',
    clinical_label: 'Clinical',
    no_vital_signs: 'No vital signs recorded.',
    last_recorded: 'Last recorded',
    heart_rate_label: 'Heart rate',
    temp_label: 'Temp',
    spo2_label: 'SpO₂',
    weight_label: 'Weight',

    prescription_label: 'Prescription',
    doctor_label: 'Doctor',
    expires_label: 'Expires',
    no_prescriptions: 'No prescriptions.',
    no_rx_medications: 'No medications on this prescription.',
    issue_prescription: 'Issue prescription',
    issue_prescription_desc: 'Pick a patient and add one or more medications.',
    edit_prescription: 'Edit prescription',
    edit_prescription_desc:
        'Medications are fixed once issued — edit status and metadata here.',
    rx_meds_locked: 'Medications',
    medication_name_ph: 'Medication name',
    freq_twice_daily_ph: 'e.g. Twice daily',
    diagnosis_label: 'Diagnosis',
    route_label: 'Route',
    days_label: 'days',
    read_only_label: 'Read-only',

    new_record: 'New record',
    new_medical_record: 'New medical record',
    edit_record: 'Edit record',
    new_record_desc:
        'Pick a patient and document the visit. SOAP notes are optional.',
    record_title_col: 'Title',
    record_author: 'Author',
    no_records: 'No records.',
    all_types: 'All types',
    confidential_label: 'confidential',
    signed_label: 'signed',
    unsigned_label: 'unsigned',
    sign_label: 'Sign',
    sign_confirm: 'Sign this record? Signed records cannot be edited.',
    confidential_field: 'Confidential',
    subjective_label: 'Subjective',
    objective_label: 'Objective',
    assessment_label: 'Assessment',
    plan_label: 'Plan',
    clinical_notes: 'Clinical notes',
    no_clinical_content: 'No clinical content recorded.',
    signed_by: 'Signed by',

    lab_order_label: 'Lab order',
    edit_lab_order: 'Edit lab order',
    no_tests_on_order: 'No tests on this order.',
    test_col: 'Test',
    specimen_col: 'Specimen',
    normal_range_col: 'Normal range',
    result_col: 'Result',
    clinical_diagnosis: 'Clinical diagnosis',
    fasting_required: 'Fasting required',
    images_label: 'Attachments',
    no_images: 'No files attached.',
    add_images: 'Add files (images / PDF)',
    attached_images: 'Attachments',
    order_date: 'Order date',
    ordered_label: 'Ordered',

    items_tracked: 'items tracked',
    add_item: 'Add item',
    add_inventory_item: 'Add inventory item',
    add_inventory_item_desc:
        'Track stock, pricing, and storage for a clinic item.',
    edit_inventory_item: 'Edit inventory item',
    edit_inventory_item_desc:
        'Update item details. Stock quantity is adjusted through stock transactions.',
    reorder_list: 'Reorder list',
    total_items: 'Total items',
    low_stock: 'Low stock',
    critical_label: 'Critical',
    expiring_soon: 'Expiring soon',
    stock_levels: 'Stock levels',
    all_categories: 'All categories',
    all_branches: 'All branches',
    filter_by_category: 'Filter by category',
    filter_by_branch: 'Filter by branch',
    item_col: 'Item',
    stock_col: 'Stock',
    min_level_col: 'Min level',
    expiry_col: 'Expiry',
    no_inventory_items: 'No inventory items yet.',
    in_stock_label: 'In stock',
    out_of_stock_label: 'Out of stock',
    refrigerated_label: 'Refrigerated',
    item_details: 'Item details',
    sourcing_label: 'Sourcing',
    stock_movements: 'Stock movements',
    no_stock_movements: 'No stock movements recorded yet.',
    reorder_point_label: 'Reorder point',
    purchase_price_label: 'Purchase price',
    selling_price_label: 'Selling price',
    min_level_value: 'Min level',
    max_value: 'Max',
    unit_label: 'Unit',
    batch_number: 'Batch number',
    serial_number: 'Serial number',
    expiration_label: 'Expiration',
    location_label: 'Location',
    linked_medication: 'Linked medication',
    refrigeration_label: 'Refrigeration',
    required_label: 'Required',
    not_required_label: 'Not required',
    current_stock: 'Current stock',
    quantity_in_stock: 'Quantity in stock',
    stock_adjust_note:
        'Stock quantity is adjusted through stock transactions, not from this form.',
    item_name_label: 'Item name',
    item_code_label: 'Item code',
    expiration_date_label: 'Expiration date',
    delete_inventory_confirm:
        'Delete this inventory item? This cannot be undone.',
    inventory_alerts: 'Inventory alerts',
    items_need_attention: 'need attention',
    expired_label: 'Expired',
    at_below_reorder: 'At or below reorder level',
    expiring_or_expired: 'Expiring or expired',
    all_above_reorder: 'All items are above their reorder level.',
    no_items_expiring: 'No items expiring soon.',
    days_ago: 'd ago',
    in_days: 'in',
    requires_refrigeration_label: 'Requires refrigeration',
    qty_in_stock_short: 'Qty in stock',
    reorder_pt_short: 'Reorder pt',
    location_in_clinic: 'Location in clinic',

    vendors: 'Vendors',
    new_vendor: 'New vendor',
    no_vendors: 'No vendors yet.',
    vendor_col: 'Vendor',
    contact_col: 'Contact',
    add_vendor: 'Add vendor',
    add_vendor_desc: 'Create a new supplier record for your clinic.',
    edit_vendor: 'Edit vendor',
    edit_vendor_desc:
        'Update supplier contact details and account information.',
    vendor_details: 'Vendor details',
    vendor_name_label: 'Vendor name',
    billing_label: 'Billing',
    active_vendor: 'Active vendor',
    create_vendor: 'Create vendor',
    back_to_vendors: 'Back to vendors',
    delete_vendor_confirm:
        'Delete "{name}"? It can be restored from the recycle bin.',
    vendor_category_ph: 'Custom category',
    custom_category_ph: 'Custom category',
    added_label: 'Added',
    updated_label: 'Updated',

    expense_label: 'Expense',
    edit_expense: 'Edit expense',
    edit_expense_desc: 'Update the recorded clinic expense.',
    expense_details: 'Expense details',
    paid_to: 'Paid to',
    paid_date: 'Paid date',
    recorded_by: 'Recorded by',
    recurring_label: 'Recurring',
    payment_status_label: 'Payment status',
    delete_expense_confirm: 'Delete this expense? This cannot be undone.',
    update_expense_desc: 'Update the recorded clinic expense.',

    add_medication_page: 'Add medication',
    atc_code: 'ATC code',
    side_effects: 'Side effects',
    contraindications: 'Contraindications',
    storage_instructions: 'Storage instructions',
    clinical_details: 'Clinical details',
    delete_medication_confirm: 'Delete this medication?',

    edit_invoice: 'Edit invoice',
    invoice_details: 'Invoice details',
    summary_label: 'Summary',
    tax_label: 'Tax',
    insurance_claim_number: 'Insurance claim #',
    insurance_coverage_pct: 'Insurance coverage (%)',

    invoice_status_opts: {
        draft: 'Draft',
        pending: 'Pending',
        partially_paid: 'Partially paid',
        paid: 'Paid',
        overdue: 'Overdue',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
        collections: 'Collections',
    },
    payment_status_opts: {
        pending: 'Pending',
        completed: 'Completed',
        failed: 'Failed',
        refunded: 'Refunded',
        partially_refunded: 'Partially refunded',
    },
    payment_method_opts: {
        cash: 'Cash',
        card: 'Card',
        insurance: 'Insurance',
        bank_wire: 'Bank wire',
        check: 'Check',
        other: 'Other',
    },
    lab_status_opts: {
        pending: 'Pending',
        sample_collected: 'Sample collected',
        in_progress: 'In progress',
        partially_completed: 'Partially completed',
        completed: 'Completed',
        cancelled: 'Cancelled',
    },
    urgency_opts: {
        routine: 'Routine',
        urgent: 'Urgent',
        stat: 'STAT',
    },
    appt_status_opts: {
        scheduled: 'Scheduled',
        confirmed: 'Confirmed',
        arrived: 'Arrived',
        in_progress: 'In progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
        no_show: 'No show',
    },
    appt_type_opts: {
        consultation: 'Consultation',
        follow_up: 'Follow-up',
        emergency: 'Emergency',
        routine_checkup: 'Routine checkup',
        vaccination: 'Vaccination',
        procedure: 'Procedure',
        lab_test: 'Lab test',
        tele_consultation: 'Teleconsultation',
        home_visit: 'Home visit',
    },
    appt_priority_opts: {
        low: 'Low',
        normal: 'Normal',
        high: 'High',
        emergency: 'Emergency',
    },
    appt_start: 'Start',
    appt_end: 'End',
    chief_complaint: 'Reason / chief complaint',
    priority_label: 'Priority',
    status_label: 'Status',
    confirmation_label: 'Confirmation',
    cancel_appointment: 'Cancel appointment',
    cancel_reason_ph: 'Reason for cancellation',
    prescription_status_opts: {
        draft: 'Draft',
        active: 'Active',
        completed: 'Completed',
        discontinued: 'Discontinued',
        cancelled: 'Cancelled',
        expired: 'Expired',
    },
    record_type_opts: {
        note: 'Note',
        progress: 'Progress',
        lab_result: 'Lab result',
        imaging: 'Imaging',
        procedure: 'Procedure',
        vaccination: 'Vaccination',
        surgery: 'Surgery',
        discharge_summary: 'Discharge summary',
        referral: 'Referral',
        other: 'Other',
    },
    gender_opts: {
        male: 'Male',
        female: 'Female',
        other: 'Other',
    },
    inventory_category_opts: {
        medication: 'Medication',
        supplies: 'Supplies',
        equipment: 'Equipment',
        office_supplies: 'Office supplies',
    },
    route_opts: {
        oral: 'Oral',
        topical: 'Topical',
        intravenous: 'Intravenous',
        intramuscular: 'Intramuscular',
        subcutaneous: 'Subcutaneous',
        sublingual: 'Sublingual',
        rectal: 'Rectal',
        inhalation: 'Inhalation',
        ophthalmic: 'Ophthalmic',
        otic: 'Otic',
    },
    vendor_category_opts: {
        supplies: 'Supplies',
        utilities: 'Utilities',
        maintenance: 'Maintenance',
        professional_services: 'Professional services',
    },
    expense_category_opts: {
        rent: 'Rent',
        utilities: 'Utilities',
        salaries: 'Salaries',
        supplies: 'Supplies',
        equipment: 'Equipment',
        maintenance: 'Maintenance',
        marketing: 'Marketing',
        insurance: 'Insurance',
        taxes: 'Taxes',
        licenses: 'Licenses',
        training: 'Training',
        travel: 'Travel',
        miscellaneous: 'Miscellaneous',
    },
    recurring_frequency_opts: {
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        yearly: 'Yearly',
    },
    inventory_txn_opts: {
        purchase: 'Purchase',
        sale: 'Sale',
        consumption: 'Consumption',
        adjustment: 'Adjustment',
        expired: 'Expired',
        return: 'Return',
        transfer: 'Transfer',
        damaged: 'Damaged',
        reversal: 'Reversal',
    },
    invoice_item_type_opts: {
        consultation: 'Consultation',
        procedure: 'Procedure',
        lab_test: 'Lab test',
        imaging: 'Imaging',
        medication: 'Medication',
        vaccination: 'Vaccination',
        supplies: 'Supplies',
        other: 'Other',
    },
    documents: 'Documents',
    document: 'Document',
    folders: 'Folders',
    folder: 'Folder',
    no_documents: 'No documents',
    no_folders: 'No folders',
    new_document: 'New document',
    new_folder: 'New folder',
    upload: 'Upload',
    download: 'Download',
    export_pdf: 'Export PDF',
    preview_label: 'Preview',
    file: 'File',
    document_type: 'Type',
    uploaded_by: 'Uploaded by',
    size: 'Size',
    expires: 'Expires',
    private_label: 'Private',
    system_label: 'System',
    all_folders: 'All folders',

    pagination_summary: 'Page :current of :last · :total',

    start_label: 'Start',
    end_label: 'End',
    select_doctor_ph: 'Select a doctor…',
    loading_ph: 'Loading…',
    new_appt_doctor_desc: 'Schedule a new appointment for a patient.',
    new_appt_secretary_desc: 'Schedule a new appointment and assign a doctor.',
    new_patient_desc: 'Register a new patient in your clinic.',
    new_lab_order_desc: 'Order one or more tests for a patient.',
    test_name_label: 'Test name',
    test_code_label: 'Test code',
    test_category_label: 'Test category',
    specimen_type_label: 'Specimen type',
    attachments_label: 'Attachments',
    files_selected: 'file(s) selected',
    add_test_label: 'Add test',
    log_expense_desc: 'Record a new clinic expense.',
    recurring_expense_label: 'Recurring expense',
    recurring_end_date: 'Recurring end date',
    new_invoice_desc: 'Create a new invoice for a patient.',
    quantity_label: 'Quantity',
    empty_no_vital_signs: 'No vital signs recorded yet.',

    document_type_opts: {
        patient_record: 'Patient record',
        lab_result: 'Lab result',
        imaging: 'Imaging',
        prescription: 'Prescription',
        invoice: 'Invoice',
        consent_form: 'Consent form',
        insurance_card: 'Insurance card',
        national_id: 'National ID',
        doctor_license: 'Doctor license',
        clinic_license: 'Clinic license',
        contract: 'Contract',
        report: 'Report',
        certificate: 'Certificate',
        medical_report: 'Medical report',
        discharge_summary: 'Discharge summary',
        other: 'Other',
    },
};

const fr: DoctorDictionary = {
    dir: 'ltr',
    brand: 'BLUE DOME',
    brand_sub: 'Suite Clinique',
    nav_main: 'Espace de travail',
    nav_clinical: 'Clinique',
    nav_admin: 'Administration',
    dashboard: 'Tableau de bord',
    appointments: 'Rendez-vous',
    patients: 'Patients',
    consultations: 'Consultations',
    prescriptions: 'Ordonnances',
    lab_orders: 'Analyses',
    invoices: 'Factures',
    inventory: 'Inventaire',
    staff: 'Personnel & Filiales',
    settings: 'Paramètres',
    follow_up: 'Appels de suivi',
    confirmations: 'Confirmations',
    messages: 'Messagerie',
    no_appointments: 'Aucun rendez-vous',
    all_confirmed: 'Tous les rendez-vous à venir sont confirmés',
    search_placeholder: 'Rechercher patients, rendez-vous, ordonnances…',
    new_appointment: 'Nouveau rendez-vous',
    good_morning: 'Bonjour, Dr Lahlou',
    today_summary: 'Voici votre journée — Mardi 5 mai 2026',
    todays_patients: 'Patients du jour',
    pending_confirmations: 'Confirmations en attente',
    revenue_today: 'Revenu du jour',
    waiting_room: "En salle d'attente",
    todays_schedule: 'Programme du jour',
    view_calendar: 'Voir le calendrier',
    upcoming: 'À venir',
    in_progress: 'En cours',
    completed: 'Terminé',
    no_show: 'Absent',
    quick_actions: 'Actions rapides',
    recent_patients: 'Patients récents',
    notifications: 'Notifications',
    waiting: 'En attente',
    confirmed: 'Confirmé',
    pending: 'En attente',
    arrived: 'Arrivé',
    cancelled: 'Annulé',
    patient_id: 'ID patient',
    age: 'Âge',
    blood_type: 'Groupe sanguin',
    gender: 'Sexe',
    phone: 'Téléphone',
    insurance: 'Assurance',
    last_visit: 'Dernière visite',
    overview: 'Aperçu',
    medical_history: 'Antécédents',
    visits: 'Visites',
    rx: 'Ordonnances',
    labs: 'Résultats labo',
    billing: 'Facturation',
    vital_signs: 'Signes vitaux',
    allergies: 'Allergies',
    chronic_diseases: 'Maladies chroniques',
    current_meds: 'Médicaments actuels',
    family_history: 'Antécédents familiaux',
    surgical_history: 'Antécédents chirurgicaux',
    week: 'Semaine',
    day: 'Jour',
    month: 'Mois',
    today: "Aujourd'hui",
    new_rx: 'Nouvelle ordonnance',
    medication: 'Médicament',
    dosage: 'Posologie',
    frequency: 'Fréquence',
    duration: 'Durée',
    save_send: 'Enregistrer & envoyer via WhatsApp',
    male: 'Homme',
    female: 'Femme',
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
    sunday: 'Dim',
    settings_appearance_title: 'Apparence',
    settings_appearance_help:
        "Choisissez l'apparence de l'interface. S'applique partout.",

    new_lab_order: 'Nouvelle analyse',
    new_invoice: 'Nouvelle facture',
    new_medication: 'Nouveau médicament',
    new_expense: 'Nouvelle dépense',
    all_label: 'Tous',
    apply: 'Appliquer',
    edit: 'Modifier',
    delete_action: 'Supprimer',
    save_changes: 'Enregistrer les modifications',
    back: 'Retour',
    search_label: 'Rechercher',
    yes: 'Oui',
    no_label: 'Non',

    col_date: 'Date',
    col_amount: 'Montant',
    col_status: 'Statut',
    col_patient: 'Patient',
    col_doctor: 'Médecin',
    col_description: 'Description',
    col_qty: 'Qté',
    col_unit_price: 'Prix unitaire',
    col_discount: 'Remise',
    col_method: 'Mode',
    col_category: 'Catégorie',
    col_vendor: 'Fournisseur',
    col_total: 'Total',
    col_balance: 'Solde',
    col_when: 'Quand',
    col_bp: 'TA',

    subtotal: 'Sous-total',
    balance_due: 'Solde dû',
    paid_label: 'Payé',
    issued: 'Émise',
    due: 'Échéance',
    line_items: 'Lignes',
    payments_label: 'Paiements',
    outstanding: 'Impayé',
    invoiced_mtd: 'Facturé (mois)',
    collected_mtd: 'Encaissé (mois)',
    overdue: 'En retard',
    all_invoices: 'Toutes les factures',
    no_invoices: 'Aucune facture pour le moment.',
    no_payments: 'Aucun paiement enregistré.',
    no_line_items: 'Aucune ligne.',
    back_to_invoices: 'Retour aux factures',
    search_invoices_ph: 'Rechercher sur cette page...',

    order_col: 'Commande',
    tests_col: 'Analyses',
    lab_col: 'Laboratoire',
    urgency_col: 'Urgence',
    in_house: 'Interne',
    lab_external: 'Externe',
    external_lab_name: 'Nom du laboratoire externe',
    critical_results: 'Résultats critiques',
    recent_orders: 'Commandes récentes',
    no_lab_orders: 'Aucune analyse pour le moment.',
    no_critical_results: 'Aucun résultat critique en attente de revue.',
    abnormal_short: 'anorm.',
    result_critical: 'Critique',
    result_high: 'Élevé',

    medications: 'Médicaments',
    formulary: 'Formulaire',
    trade_name: 'Nom commercial',
    generic_name: 'Nom générique',
    form_label: 'Forme',
    strength: 'Dosage',
    manufacturer: 'Fabricant',
    dispensing: 'Délivrance',
    requires_prescription: 'Sur ordonnance',
    rx_badge: 'Rx',
    otc: 'Libre',
    active_label: 'Actif',
    inactive_label: 'Inactif',
    no_medications: 'Aucun médicament dans le formulaire pour le moment.',
    add_medication: 'Ajouter un médicament',
    edit_medication: 'Modifier le médicament',
    search_medications_ph: 'Rechercher des médicaments...',
    eg_tablet: 'ex. comprimé',

    record_new_reading: 'Enregistrer une nouvelle mesure',
    temp_c: 'Temp (°C)',
    bp_sys: 'TA sys',
    bp_dia: 'TA dia',
    hr_label: 'FC',
    weight_kg: 'Poids (kg)',
    height_cm: 'Taille (cm)',
    notes_label: 'Notes',
    record_action: 'Enregistrer',
    history_label: 'Historique',
    bmi: 'IMC',
    pain: 'Douleur',
    back_to_patient: 'Retour au patient',

    expenses: 'Dépenses',
    all_expenses: 'Toutes les dépenses',
    no_expenses: 'Aucune dépense pour le moment.',
    expense_col: 'Dépense',

    all_statuses: 'Tous les statuts',
    confirmed_q: 'Confirmé ?',

    export_label: 'Exporter',
    clear_label: 'Effacer',
    cancel_label: 'Annuler',
    create_label: 'Créer',
    add_label: 'Ajouter',
    remove_label: 'Retirer',
    view_details: 'Voir les détails',
    none_label: 'Aucun',
    not_specified: 'Non spécifié',
    other_label: 'Autre…',
    read_only: '(lecture seule)',
    select_patient_ph: 'Sélectionner un patient…',
    select_medication_ph: 'Sélectionner un médicament…',
    none_recorded: 'Aucun enregistré',
    required_mark: '*',

    first_name: 'Prénom',
    last_name: 'Nom',
    date_of_birth: 'Date de naissance',
    email: 'E-mail',
    address: 'Adresse',
    national_id: 'CIN',
    insurance_number: 'N° assurance',
    phone_e164: 'Téléphone (E.164)',
    title_label: 'Titre',
    type_label: 'Type',
    date_label: 'Date',
    notes_field: 'Notes',
    website: 'Site web',
    contact_person: 'Personne à contacter',
    tax_number: 'Numéro fiscal',
    payment_terms: 'Conditions de paiement',
    bank_account: 'Compte bancaire',
    contact_label: 'Contact',
    details_label: 'Détails',
    additional_label: 'Complément',

    new_patient: 'Nouveau patient',
    search_by_name_ph: 'Rechercher par nom…',
    no_patients_found: 'Aucun patient trouvé.',
    clinic_label: 'Clinique',
    branch_label: 'Filiale',
    registered_label: 'Inscrit le',
    filtered_by_patient: 'Filtré par patient',
    patient_information: 'Informations du patient',
    clinical_label: 'Clinique',
    no_vital_signs: 'Aucun signe vital enregistré.',
    last_recorded: 'Dernière mesure',
    heart_rate_label: 'Fréq. cardiaque',
    temp_label: 'Temp',
    spo2_label: 'SpO₂',
    weight_label: 'Poids',

    prescription_label: 'Ordonnance',
    doctor_label: 'Médecin',
    expires_label: 'Expire le',
    no_prescriptions: 'Aucune ordonnance.',
    no_rx_medications: 'Aucun médicament sur cette ordonnance.',
    issue_prescription: "Émettre l'ordonnance",
    issue_prescription_desc:
        'Choisissez un patient et ajoutez un ou plusieurs médicaments.',
    edit_prescription: "Modifier l'ordonnance",
    edit_prescription_desc:
        'Les médicaments sont figés une fois émis — modifiez ici le statut et les métadonnées.',
    rx_meds_locked: 'Médicaments',
    medication_name_ph: 'Nom du médicament',
    freq_twice_daily_ph: 'ex. Deux fois par jour',
    diagnosis_label: 'Diagnostic',
    route_label: "Voie d'administration",
    days_label: 'jours',
    read_only_label: 'Lecture seule',

    new_record: 'Nouveau dossier',
    new_medical_record: 'Nouveau dossier médical',
    edit_record: 'Modifier le dossier',
    new_record_desc:
        'Choisissez un patient et documentez la visite. Les notes SOAP sont facultatives.',
    record_title_col: 'Titre',
    record_author: 'Auteur',
    no_records: 'Aucun dossier.',
    all_types: 'Tous les types',
    confidential_label: 'confidentiel',
    signed_label: 'signé',
    unsigned_label: 'non signé',
    sign_label: 'Signer',
    sign_confirm:
        'Signer ce dossier ? Les dossiers signés ne peuvent plus être modifiés.',
    confidential_field: 'Confidentiel',
    subjective_label: 'Subjectif',
    objective_label: 'Objectif',
    assessment_label: 'Évaluation',
    plan_label: 'Plan',
    clinical_notes: 'Notes cliniques',
    no_clinical_content: 'Aucun contenu clinique enregistré.',
    signed_by: 'Signé par',

    lab_order_label: 'Analyse',
    edit_lab_order: "Modifier l'analyse",
    no_tests_on_order: 'Aucun test sur cette commande.',
    test_col: 'Test',
    specimen_col: 'Échantillon',
    normal_range_col: 'Valeurs normales',
    result_col: 'Résultat',
    clinical_diagnosis: 'Diagnostic clinique',
    fasting_required: 'À jeun requis',
    images_label: 'Pièces jointes',
    no_images: 'Aucun fichier joint.',
    add_images: 'Ajouter des fichiers (images / PDF)',
    attached_images: 'Pièces jointes',
    order_date: 'Date de commande',
    ordered_label: 'Commandé le',

    items_tracked: 'articles suivis',
    add_item: 'Ajouter un article',
    add_inventory_item: 'Ajouter un article',
    add_inventory_item_desc:
        "Suivre le stock, les prix et le stockage d'un article de la clinique.",
    edit_inventory_item: "Modifier l'article",
    edit_inventory_item_desc:
        "Mettre à jour les détails de l'article. La quantité en stock est ajustée via les transactions de stock.",
    reorder_list: 'Liste de réapprovisionnement',
    total_items: 'Total des articles',
    low_stock: 'Stock faible',
    critical_label: 'Critique',
    expiring_soon: 'Bientôt périmé',
    stock_levels: 'Niveaux de stock',
    all_categories: 'Toutes les catégories',
    all_branches: 'Toutes les filiales',
    filter_by_category: 'Filtrer par catégorie',
    filter_by_branch: 'Filtrer par filiale',
    item_col: 'Article',
    stock_col: 'Stock',
    min_level_col: 'Niveau min.',
    expiry_col: 'Péremption',
    no_inventory_items: 'Aucun article en stock pour le moment.',
    in_stock_label: 'En stock',
    out_of_stock_label: 'En rupture',
    refrigerated_label: 'Réfrigéré',
    item_details: "Détails de l'article",
    sourcing_label: 'Approvisionnement',
    stock_movements: 'Mouvements de stock',
    no_stock_movements: 'Aucun mouvement de stock enregistré.',
    reorder_point_label: 'Seuil de réappro.',
    purchase_price_label: "Prix d'achat",
    selling_price_label: 'Prix de vente',
    min_level_value: 'Niveau min.',
    max_value: 'Max',
    unit_label: 'Unité',
    batch_number: 'Numéro de lot',
    serial_number: 'Numéro de série',
    expiration_label: 'Péremption',
    location_label: 'Emplacement',
    linked_medication: 'Médicament lié',
    refrigeration_label: 'Réfrigération',
    required_label: 'Requise',
    not_required_label: 'Non requise',
    current_stock: 'Stock actuel',
    quantity_in_stock: 'Quantité en stock',
    stock_adjust_note:
        'La quantité en stock est ajustée via les transactions de stock, pas depuis ce formulaire.',
    item_name_label: "Nom de l'article",
    item_code_label: "Code de l'article",
    expiration_date_label: 'Date de péremption',
    delete_inventory_confirm:
        'Supprimer cet article ? Cette action est irréversible.',
    inventory_alerts: 'Alertes de stock',
    items_need_attention: 'nécessitent une attention',
    expired_label: 'Périmé',
    at_below_reorder: 'Au niveau de réappro. ou en dessous',
    expiring_or_expired: 'Bientôt périmé ou périmé',
    all_above_reorder:
        'Tous les articles sont au-dessus de leur seuil de réappro.',
    no_items_expiring: 'Aucun article bientôt périmé.',
    days_ago: 'j',
    in_days: 'dans',
    requires_refrigeration_label: 'Nécessite une réfrigération',
    qty_in_stock_short: 'Qté en stock',
    reorder_pt_short: 'Seuil réappro.',
    location_in_clinic: 'Emplacement dans la clinique',

    vendors: 'Fournisseurs',
    new_vendor: 'Nouveau fournisseur',
    no_vendors: 'Aucun fournisseur pour le moment.',
    vendor_col: 'Fournisseur',
    contact_col: 'Contact',
    add_vendor: 'Ajouter un fournisseur',
    add_vendor_desc:
        'Créer une nouvelle fiche fournisseur pour votre clinique.',
    edit_vendor: 'Modifier le fournisseur',
    edit_vendor_desc:
        'Mettre à jour les coordonnées et les informations du compte fournisseur.',
    vendor_details: 'Détails du fournisseur',
    vendor_name_label: 'Nom du fournisseur',
    billing_label: 'Facturation',
    active_vendor: 'Fournisseur actif',
    create_vendor: 'Créer le fournisseur',
    back_to_vendors: 'Retour aux fournisseurs',
    delete_vendor_confirm:
        'Supprimer « {name} » ? Il pourra être restauré depuis la corbeille.',
    vendor_category_ph: 'Catégorie personnalisée',
    custom_category_ph: 'Catégorie personnalisée',
    added_label: 'Ajouté le',
    updated_label: 'Modifié le',

    expense_label: 'Dépense',
    edit_expense: 'Modifier la dépense',
    edit_expense_desc: 'Mettre à jour la dépense enregistrée de la clinique.',
    expense_details: 'Détails de la dépense',
    paid_to: 'Payé à',
    paid_date: 'Date de paiement',
    recorded_by: 'Enregistré par',
    recurring_label: 'Récurrente',
    payment_status_label: 'Statut de paiement',
    delete_expense_confirm:
        'Supprimer cette dépense ? Cette action est irréversible.',
    update_expense_desc: 'Mettre à jour la dépense enregistrée de la clinique.',

    add_medication_page: 'Ajouter un médicament',
    atc_code: 'Code ATC',
    side_effects: 'Effets secondaires',
    contraindications: 'Contre-indications',
    storage_instructions: 'Conditions de conservation',
    clinical_details: 'Détails cliniques',
    delete_medication_confirm: 'Supprimer ce médicament ?',

    edit_invoice: 'Modifier la facture',
    invoice_details: 'Détails de la facture',
    summary_label: 'Récapitulatif',
    tax_label: 'TVA',
    insurance_claim_number: 'N° de dossier assurance',
    insurance_coverage_pct: 'Couverture assurance (%)',

    invoice_status_opts: {
        draft: 'Brouillon',
        pending: 'En attente',
        partially_paid: 'Partiellement payée',
        paid: 'Payée',
        overdue: 'En retard',
        cancelled: 'Annulée',
        refunded: 'Remboursée',
        collections: 'Recouvrement',
    },
    payment_status_opts: {
        pending: 'En attente',
        completed: 'Effectué',
        failed: 'Échoué',
        refunded: 'Remboursé',
        partially_refunded: 'Partiellement remboursé',
    },
    payment_method_opts: {
        cash: 'Espèces',
        card: 'Carte',
        insurance: 'Assurance',
        bank_wire: 'Virement bancaire',
        check: 'Chèque',
        other: 'Autre',
    },
    lab_status_opts: {
        pending: 'En attente',
        sample_collected: 'Échantillon prélevé',
        in_progress: 'En cours',
        partially_completed: 'Partiellement terminé',
        completed: 'Terminé',
        cancelled: 'Annulé',
    },
    urgency_opts: {
        routine: 'Routine',
        urgent: 'Urgent',
        stat: 'STAT',
    },
    appt_status_opts: {
        scheduled: 'Planifié',
        confirmed: 'Confirmé',
        arrived: 'Arrivé',
        in_progress: 'En cours',
        completed: 'Terminé',
        cancelled: 'Annulé',
        no_show: 'Absent',
    },
    appt_type_opts: {
        consultation: 'Consultation',
        follow_up: 'Suivi',
        emergency: 'Urgence',
        routine_checkup: 'Bilan de routine',
        vaccination: 'Vaccination',
        procedure: 'Intervention',
        lab_test: 'Analyse',
        tele_consultation: 'Téléconsultation',
        home_visit: 'Visite à domicile',
    },
    appt_priority_opts: {
        low: 'Basse',
        normal: 'Normale',
        high: 'Haute',
        emergency: 'Urgence',
    },
    appt_start: 'Début',
    appt_end: 'Fin',
    chief_complaint: 'Motif / plainte principale',
    priority_label: 'Priorité',
    status_label: 'Statut',
    confirmation_label: 'Confirmation',
    cancel_appointment: 'Annuler le rendez-vous',
    cancel_reason_ph: "Motif d'annulation",
    prescription_status_opts: {
        draft: 'Brouillon',
        active: 'Active',
        completed: 'Terminée',
        discontinued: 'Interrompue',
        cancelled: 'Annulée',
        expired: 'Expirée',
    },
    record_type_opts: {
        note: 'Note',
        progress: 'Évolution',
        lab_result: 'Résultat de labo',
        imaging: 'Imagerie',
        procedure: 'Acte',
        vaccination: 'Vaccination',
        surgery: 'Chirurgie',
        discharge_summary: 'Compte rendu de sortie',
        referral: 'Orientation',
        other: 'Autre',
    },
    gender_opts: {
        male: 'Homme',
        female: 'Femme',
        other: 'Autre',
    },
    inventory_category_opts: {
        medication: 'Médicament',
        supplies: 'Fournitures',
        equipment: 'Équipement',
        office_supplies: 'Fournitures de bureau',
    },
    route_opts: {
        oral: 'Orale',
        topical: 'Topique',
        intravenous: 'Intraveineuse',
        intramuscular: 'Intramusculaire',
        subcutaneous: 'Sous-cutanée',
        sublingual: 'Sublinguale',
        rectal: 'Rectale',
        inhalation: 'Inhalation',
        ophthalmic: 'Ophtalmique',
        otic: 'Auriculaire',
    },
    vendor_category_opts: {
        supplies: 'Fournitures',
        utilities: 'Services publics',
        maintenance: 'Maintenance',
        professional_services: 'Services professionnels',
    },
    expense_category_opts: {
        rent: 'Loyer',
        utilities: 'Charges',
        salaries: 'Salaires',
        supplies: 'Fournitures',
        equipment: 'Équipement',
        maintenance: 'Maintenance',
        marketing: 'Marketing',
        insurance: 'Assurance',
        taxes: 'Impôts',
        licenses: 'Licences',
        training: 'Formation',
        travel: 'Déplacements',
        miscellaneous: 'Divers',
    },
    recurring_frequency_opts: {
        daily: 'Quotidienne',
        weekly: 'Hebdomadaire',
        monthly: 'Mensuelle',
        quarterly: 'Trimestrielle',
        yearly: 'Annuelle',
    },
    inventory_txn_opts: {
        purchase: 'Achat',
        sale: 'Vente',
        consumption: 'Consommation',
        adjustment: 'Ajustement',
        expired: 'Périmé',
        return: 'Retour',
        transfer: 'Transfert',
        damaged: 'Endommagé',
        reversal: 'Annulation',
    },
    invoice_item_type_opts: {
        consultation: 'Consultation',
        procedure: 'Acte',
        lab_test: 'Analyse',
        imaging: 'Imagerie',
        medication: 'Médicament',
        vaccination: 'Vaccination',
        supplies: 'Fournitures',
        other: 'Autre',
    },
    documents: 'Documents',
    document: 'Document',
    folders: 'Dossiers',
    folder: 'Dossier',
    no_documents: 'Aucun document',
    no_folders: 'Aucun dossier',
    new_document: 'Nouveau document',
    new_folder: 'Nouveau dossier',
    upload: 'Téléverser',
    download: 'Télécharger',
    export_pdf: 'Exporter en PDF',
    preview_label: 'Aperçu',
    file: 'Fichier',
    document_type: 'Type',
    uploaded_by: 'Téléversé par',
    size: 'Taille',
    expires: 'Expire',
    private_label: 'Privé',
    system_label: 'Système',
    all_folders: 'Tous les dossiers',

    pagination_summary: 'Page :current sur :last · :total',

    start_label: 'Début',
    end_label: 'Fin',
    select_doctor_ph: 'Sélectionner un médecin…',
    loading_ph: 'Chargement…',
    new_appt_doctor_desc: 'Planifier un nouveau rendez-vous pour un patient.',
    new_appt_secretary_desc:
        'Planifier un nouveau rendez-vous et attribuer un médecin.',
    new_patient_desc: 'Enregistrer un nouveau patient dans votre clinique.',
    new_lab_order_desc: 'Prescrire un ou plusieurs tests pour un patient.',
    test_name_label: 'Nom du test',
    test_code_label: 'Code du test',
    test_category_label: 'Catégorie du test',
    specimen_type_label: 'Type de prélèvement',
    attachments_label: 'Pièces jointes',
    files_selected: 'fichier(s) sélectionné(s)',
    add_test_label: 'Ajouter un test',
    log_expense_desc: 'Enregistrer une nouvelle dépense de la clinique.',
    recurring_expense_label: 'Dépense récurrente',
    recurring_end_date: 'Date de fin de récurrence',
    new_invoice_desc: 'Créer une nouvelle facture pour un patient.',
    quantity_label: 'Quantité',
    empty_no_vital_signs: 'Aucun signe vital enregistré pour le moment.',

    document_type_opts: {
        patient_record: 'Dossier patient',
        lab_result: 'Résultat de laboratoire',
        imaging: 'Imagerie',
        prescription: 'Ordonnance',
        invoice: 'Facture',
        consent_form: 'Formulaire de consentement',
        insurance_card: 'Carte d’assurance',
        national_id: 'Carte d’identité nationale',
        doctor_license: 'Licence du médecin',
        clinic_license: 'Licence de la clinique',
        contract: 'Contrat',
        report: 'Rapport',
        certificate: 'Certificat',
        medical_report: 'Rapport médical',
        discharge_summary: 'Compte rendu de sortie',
        other: 'Autre',
    },
};

const ar: DoctorDictionary = {
    dir: 'rtl',
    brand: 'بلو دوم',
    brand_sub: 'إدارة العيادة',
    nav_main: 'مساحة العمل',
    nav_clinical: 'الطب السريري',
    nav_admin: 'الإدارة',
    dashboard: 'لوحة التحكم',
    appointments: 'المواعيد',
    patients: 'المرضى',
    consultations: 'الاستشارات',
    prescriptions: 'الوصفات الطبية',
    lab_orders: 'التحاليل المخبرية',
    invoices: 'الفواتير',
    inventory: 'المخزون',
    staff: 'الموظفون والفروع',
    settings: 'الإعدادات',
    follow_up: 'مكالمات المتابعة',
    confirmations: 'التأكيدات',
    messages: 'الرسائل',
    no_appointments: 'لا توجد مواعيد',
    all_confirmed: 'جميع المواعيد القادمة مؤكدة',
    search_placeholder: 'ابحث عن مرضى، مواعيد، وصفات...',
    new_appointment: 'موعد جديد',
    good_morning: 'صباح الخير، د. اللهلو',
    today_summary: 'هذه نظرة على يومك — الثلاثاء 5 ماي 2026',
    todays_patients: 'مرضى اليوم',
    pending_confirmations: 'تأكيدات معلقة',
    revenue_today: 'إيرادات اليوم',
    waiting_room: 'في غرفة الانتظار',
    todays_schedule: 'جدول اليوم',
    view_calendar: 'عرض التقويم',
    upcoming: 'قادم',
    in_progress: 'جاري',
    completed: 'مكتمل',
    no_show: 'لم يحضر',
    quick_actions: 'إجراءات سريعة',
    recent_patients: 'المرضى الأخيرون',
    notifications: 'الإشعارات',
    waiting: 'في الانتظار',
    confirmed: 'مؤكد',
    pending: 'معلق',
    arrived: 'وصل',
    cancelled: 'ملغى',
    patient_id: 'رقم المريض',
    age: 'العمر',
    blood_type: 'فصيلة الدم',
    gender: 'الجنس',
    phone: 'الهاتف',
    insurance: 'التأمين',
    last_visit: 'آخر زيارة',
    overview: 'نظرة عامة',
    medical_history: 'التاريخ الطبي',
    visits: 'الزيارات',
    rx: 'الوصفات',
    labs: 'نتائج التحاليل',
    billing: 'الفواتير',
    vital_signs: 'العلامات الحيوية',
    allergies: 'الحساسية',
    chronic_diseases: 'الأمراض المزمنة',
    current_meds: 'الأدوية الحالية',
    family_history: 'التاريخ العائلي',
    surgical_history: 'التاريخ الجراحي',
    week: 'أسبوع',
    day: 'يوم',
    month: 'شهر',
    today: 'اليوم',
    new_rx: 'وصفة جديدة',
    medication: 'الدواء',
    dosage: 'الجرعة',
    frequency: 'التكرار',
    duration: 'المدة',
    save_send: 'حفظ وإرسال عبر واتساب',
    male: 'ذكر',
    female: 'أنثى',
    monday: 'اثن',
    tuesday: 'ثلا',
    wednesday: 'أرب',
    thursday: 'خمي',
    friday: 'جمع',
    saturday: 'سبت',
    sunday: 'أحد',
    settings_appearance_title: 'المظهر',
    settings_appearance_help: 'اختر شكل الواجهة. يُطبَّق في كل مكان.',

    new_lab_order: 'تحليل جديد',
    new_invoice: 'فاتورة جديدة',
    new_medication: 'دواء جديد',
    new_expense: 'مصروف جديد',
    all_label: 'الكل',
    apply: 'تطبيق',
    edit: 'تعديل',
    delete_action: 'حذف',
    save_changes: 'حفظ التغييرات',
    back: 'رجوع',
    search_label: 'بحث',
    yes: 'نعم',
    no_label: 'لا',

    col_date: 'التاريخ',
    col_amount: 'المبلغ',
    col_status: 'الحالة',
    col_patient: 'المريض',
    col_doctor: 'الطبيب',
    col_description: 'الوصف',
    col_qty: 'الكمية',
    col_unit_price: 'سعر الوحدة',
    col_discount: 'الخصم',
    col_method: 'الطريقة',
    col_category: 'الفئة',
    col_vendor: 'المورّد',
    col_total: 'المجموع',
    col_balance: 'الرصيد',
    col_when: 'الوقت',
    col_bp: 'ضغط الدم',

    subtotal: 'المجموع الفرعي',
    balance_due: 'الرصيد المستحق',
    paid_label: 'المدفوع',
    issued: 'تاريخ الإصدار',
    due: 'تاريخ الاستحقاق',
    line_items: 'البنود',
    payments_label: 'المدفوعات',
    outstanding: 'المستحقات',
    invoiced_mtd: 'الفواتير (الشهر)',
    collected_mtd: 'المحصّل (الشهر)',
    overdue: 'متأخر',
    all_invoices: 'جميع الفواتير',
    no_invoices: 'لا توجد فواتير بعد.',
    no_payments: 'لا توجد مدفوعات مسجلة.',
    no_line_items: 'لا توجد بنود.',
    back_to_invoices: 'العودة إلى الفواتير',
    search_invoices_ph: 'ابحث في هذه الصفحة...',

    order_col: 'الطلب',
    tests_col: 'الفحوصات',
    lab_col: 'المختبر',
    urgency_col: 'الاستعجال',
    in_house: 'داخلي',
    lab_external: 'خارجي',
    external_lab_name: 'اسم المختبر الخارجي',
    critical_results: 'نتائج حرجة',
    recent_orders: 'الطلبات الأخيرة',
    no_lab_orders: 'لا توجد تحاليل بعد.',
    no_critical_results: 'لا توجد نتائج حرجة بانتظار المراجعة.',
    abnormal_short: 'غير طبيعي',
    result_critical: 'حرج',
    result_high: 'مرتفع',

    medications: 'الأدوية',
    formulary: 'دليل الأدوية',
    trade_name: 'الاسم التجاري',
    generic_name: 'الاسم العلمي',
    form_label: 'الشكل',
    strength: 'التركيز',
    manufacturer: 'الشركة المصنّعة',
    dispensing: 'الصرف',
    requires_prescription: 'يتطلب وصفة طبية',
    rx_badge: 'بوصفة',
    otc: 'بدون وصفة',
    active_label: 'نشط',
    inactive_label: 'غير نشط',
    no_medications: 'لا توجد أدوية في الدليل بعد.',
    add_medication: 'إضافة دواء',
    edit_medication: 'تعديل الدواء',
    search_medications_ph: 'ابحث عن أدوية...',
    eg_tablet: 'مثال: قرص',

    record_new_reading: 'تسجيل قراءة جديدة',
    temp_c: 'الحرارة (°م)',
    bp_sys: 'الانقباضي',
    bp_dia: 'الانبساطي',
    hr_label: 'النبض',
    weight_kg: 'الوزن (كغ)',
    height_cm: 'الطول (سم)',
    notes_label: 'ملاحظات',
    record_action: 'تسجيل',
    history_label: 'السجل',
    bmi: 'مؤشر كتلة الجسم',
    pain: 'الألم',
    back_to_patient: 'العودة إلى المريض',

    expenses: 'المصاريف',
    all_expenses: 'جميع المصاريف',
    no_expenses: 'لا توجد مصاريف بعد.',
    expense_col: 'المصروف',

    all_statuses: 'جميع الحالات',
    confirmed_q: 'مؤكد؟',

    export_label: 'تصدير',
    clear_label: 'مسح',
    cancel_label: 'إلغاء',
    create_label: 'إنشاء',
    add_label: 'إضافة',
    remove_label: 'إزالة',
    view_details: 'عرض التفاصيل',
    none_label: 'لا يوجد',
    not_specified: 'غير محدد',
    other_label: 'أخرى…',
    read_only: '(للقراءة فقط)',
    select_patient_ph: 'اختر مريضاً…',
    select_medication_ph: 'اختر دواءً…',
    none_recorded: 'لا يوجد مسجّل',
    required_mark: '*',

    first_name: 'الاسم الأول',
    last_name: 'اسم العائلة',
    date_of_birth: 'تاريخ الميلاد',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    national_id: 'البطاقة الوطنية',
    insurance_number: 'رقم التأمين',
    phone_e164: 'الهاتف (E.164)',
    title_label: 'العنوان',
    type_label: 'النوع',
    date_label: 'التاريخ',
    notes_field: 'ملاحظات',
    website: 'الموقع الإلكتروني',
    contact_person: 'الشخص المسؤول',
    tax_number: 'الرقم الضريبي',
    payment_terms: 'شروط الدفع',
    bank_account: 'الحساب البنكي',
    contact_label: 'جهة الاتصال',
    details_label: 'التفاصيل',
    additional_label: 'إضافي',

    new_patient: 'مريض جديد',
    search_by_name_ph: 'ابحث بالاسم…',
    no_patients_found: 'لم يُعثر على مرضى.',
    clinic_label: 'العيادة',
    branch_label: 'الفرع',
    registered_label: 'تاريخ التسجيل',
    filtered_by_patient: 'تمت التصفية حسب المريض',
    patient_information: 'معلومات المريض',
    clinical_label: 'سريري',
    no_vital_signs: 'لا توجد علامات حيوية مسجلة.',
    last_recorded: 'آخر تسجيل',
    heart_rate_label: 'معدل ضربات القلب',
    temp_label: 'الحرارة',
    spo2_label: 'تشبّع الأكسجين',
    weight_label: 'الوزن',

    prescription_label: 'الوصفة',
    doctor_label: 'الطبيب',
    expires_label: 'تنتهي في',
    no_prescriptions: 'لا توجد وصفات.',
    no_rx_medications: 'لا توجد أدوية في هذه الوصفة.',
    issue_prescription: 'إصدار الوصفة',
    issue_prescription_desc: 'اختر مريضاً وأضف دواءً واحداً أو أكثر.',
    edit_prescription: 'تعديل الوصفة',
    edit_prescription_desc:
        'الأدوية ثابتة بعد الإصدار — عدّل الحالة والبيانات الوصفية هنا.',
    rx_meds_locked: 'الأدوية',
    medication_name_ph: 'اسم الدواء',
    freq_twice_daily_ph: 'مثال: مرتان يومياً',
    diagnosis_label: 'التشخيص',
    route_label: 'طريق الإعطاء',
    days_label: 'أيام',
    read_only_label: 'للقراءة فقط',

    new_record: 'سجل جديد',
    new_medical_record: 'سجل طبي جديد',
    edit_record: 'تعديل السجل',
    new_record_desc: 'اختر مريضاً ووثّق الزيارة. ملاحظات SOAP اختيارية.',
    record_title_col: 'العنوان',
    record_author: 'المُحرِّر',
    no_records: 'لا توجد سجلات.',
    all_types: 'جميع الأنواع',
    confidential_label: 'سري',
    signed_label: 'موقّع',
    unsigned_label: 'غير موقّع',
    sign_label: 'توقيع',
    sign_confirm: 'توقيع هذا السجل؟ لا يمكن تعديل السجلات الموقّعة.',
    confidential_field: 'سري',
    subjective_label: 'الشكوى الذاتية',
    objective_label: 'الفحص الموضوعي',
    assessment_label: 'التقييم',
    plan_label: 'الخطة',
    clinical_notes: 'الملاحظات السريرية',
    no_clinical_content: 'لا يوجد محتوى سريري مسجّل.',
    signed_by: 'وقّع بواسطة',

    lab_order_label: 'طلب تحليل',
    edit_lab_order: 'تعديل طلب التحليل',
    no_tests_on_order: 'لا توجد فحوصات في هذا الطلب.',
    test_col: 'الفحص',
    specimen_col: 'العينة',
    normal_range_col: 'المعدل الطبيعي',
    result_col: 'النتيجة',
    clinical_diagnosis: 'التشخيص السريري',
    fasting_required: 'الصيام مطلوب',
    images_label: 'المرفقات',
    no_images: 'لا توجد ملفات مرفقة.',
    add_images: 'إضافة ملفات (صور / PDF)',
    attached_images: 'المرفقات',
    order_date: 'تاريخ الطلب',
    ordered_label: 'تاريخ الطلب',

    items_tracked: 'عنصر متتبَّع',
    add_item: 'إضافة عنصر',
    add_inventory_item: 'إضافة عنصر مخزون',
    add_inventory_item_desc: 'تتبّع المخزون والأسعار والتخزين لعنصر بالعيادة.',
    edit_inventory_item: 'تعديل عنصر المخزون',
    edit_inventory_item_desc:
        'تحديث تفاصيل العنصر. تُعدَّل الكمية في المخزون عبر معاملات المخزون.',
    reorder_list: 'قائمة إعادة الطلب',
    total_items: 'إجمالي العناصر',
    low_stock: 'مخزون منخفض',
    critical_label: 'حرج',
    expiring_soon: 'قارب على الانتهاء',
    stock_levels: 'مستويات المخزون',
    all_categories: 'جميع الفئات',
    all_branches: 'جميع الفروع',
    filter_by_category: 'تصفية حسب الفئة',
    filter_by_branch: 'تصفية حسب الفرع',
    item_col: 'العنصر',
    stock_col: 'المخزون',
    min_level_col: 'الحد الأدنى',
    expiry_col: 'الانتهاء',
    no_inventory_items: 'لا توجد عناصر في المخزون بعد.',
    in_stock_label: 'متوفر',
    out_of_stock_label: 'نفد المخزون',
    refrigerated_label: 'مبرَّد',
    item_details: 'تفاصيل العنصر',
    sourcing_label: 'مصدر التوريد',
    stock_movements: 'حركات المخزون',
    no_stock_movements: 'لا توجد حركات مخزون مسجلة بعد.',
    reorder_point_label: 'نقطة إعادة الطلب',
    purchase_price_label: 'سعر الشراء',
    selling_price_label: 'سعر البيع',
    min_level_value: 'الحد الأدنى',
    max_value: 'الحد الأقصى',
    unit_label: 'الوحدة',
    batch_number: 'رقم الدفعة',
    serial_number: 'الرقم التسلسلي',
    expiration_label: 'الانتهاء',
    location_label: 'الموقع',
    linked_medication: 'الدواء المرتبط',
    refrigeration_label: 'التبريد',
    required_label: 'مطلوب',
    not_required_label: 'غير مطلوب',
    current_stock: 'المخزون الحالي',
    quantity_in_stock: 'الكمية في المخزون',
    stock_adjust_note:
        'تُعدَّل الكمية في المخزون عبر معاملات المخزون، لا من هذا النموذج.',
    item_name_label: 'اسم العنصر',
    item_code_label: 'رمز العنصر',
    expiration_date_label: 'تاريخ الانتهاء',
    delete_inventory_confirm: 'حذف عنصر المخزون هذا؟ لا يمكن التراجع عن ذلك.',
    inventory_alerts: 'تنبيهات المخزون',
    items_need_attention: 'بحاجة إلى انتباه',
    expired_label: 'منتهي الصلاحية',
    at_below_reorder: 'عند مستوى إعادة الطلب أو دونه',
    expiring_or_expired: 'قارب على الانتهاء أو منتهٍ',
    all_above_reorder: 'جميع العناصر فوق مستوى إعادة الطلب.',
    no_items_expiring: 'لا توجد عناصر قاربت على الانتهاء.',
    days_ago: 'يوم مضى',
    in_days: 'خلال',
    requires_refrigeration_label: 'يتطلب التبريد',
    qty_in_stock_short: 'الكمية في المخزون',
    reorder_pt_short: 'نقطة إعادة الطلب',
    location_in_clinic: 'الموقع في العيادة',

    vendors: 'الموردون',
    new_vendor: 'مورّد جديد',
    no_vendors: 'لا يوجد موردون بعد.',
    vendor_col: 'المورّد',
    contact_col: 'جهة الاتصال',
    add_vendor: 'إضافة مورّد',
    add_vendor_desc: 'إنشاء سجل مورّد جديد لعيادتك.',
    edit_vendor: 'تعديل المورّد',
    edit_vendor_desc: 'تحديث بيانات اتصال المورّد ومعلومات الحساب.',
    vendor_details: 'تفاصيل المورّد',
    vendor_name_label: 'اسم المورّد',
    billing_label: 'الفوترة',
    active_vendor: 'مورّد نشط',
    create_vendor: 'إنشاء المورّد',
    back_to_vendors: 'العودة إلى الموردين',
    delete_vendor_confirm: 'حذف «{name}»؟ يمكن استعادته من سلة المحذوفات.',
    vendor_category_ph: 'فئة مخصّصة',
    custom_category_ph: 'فئة مخصّصة',
    added_label: 'أُضيف في',
    updated_label: 'حُدِّث في',

    expense_label: 'المصروف',
    edit_expense: 'تعديل المصروف',
    edit_expense_desc: 'تحديث مصروف العيادة المسجّل.',
    expense_details: 'تفاصيل المصروف',
    paid_to: 'دُفع إلى',
    paid_date: 'تاريخ الدفع',
    recorded_by: 'سُجِّل بواسطة',
    recurring_label: 'متكرر',
    payment_status_label: 'حالة الدفع',
    delete_expense_confirm: 'حذف هذا المصروف؟ لا يمكن التراجع عن ذلك.',
    update_expense_desc: 'تحديث مصروف العيادة المسجّل.',

    add_medication_page: 'إضافة دواء',
    atc_code: 'رمز ATC',
    side_effects: 'الآثار الجانبية',
    contraindications: 'موانع الاستعمال',
    storage_instructions: 'تعليمات التخزين',
    clinical_details: 'التفاصيل السريرية',
    delete_medication_confirm: 'حذف هذا الدواء؟',

    edit_invoice: 'تعديل الفاتورة',
    invoice_details: 'تفاصيل الفاتورة',
    summary_label: 'الملخص',
    tax_label: 'الضريبة',
    insurance_claim_number: 'رقم مطالبة التأمين',
    insurance_coverage_pct: 'تغطية التأمين (%)',

    invoice_status_opts: {
        draft: 'مسودة',
        pending: 'معلقة',
        partially_paid: 'مدفوعة جزئياً',
        paid: 'مدفوعة',
        overdue: 'متأخرة',
        cancelled: 'ملغاة',
        refunded: 'مستردة',
        collections: 'تحصيل',
    },
    payment_status_opts: {
        pending: 'معلق',
        completed: 'مكتمل',
        failed: 'فاشل',
        refunded: 'مسترد',
        partially_refunded: 'مسترد جزئياً',
    },
    payment_method_opts: {
        cash: 'نقداً',
        card: 'بطاقة',
        insurance: 'تأمين',
        bank_wire: 'تحويل بنكي',
        check: 'شيك',
        other: 'أخرى',
    },
    lab_status_opts: {
        pending: 'معلق',
        sample_collected: 'تم أخذ العينة',
        in_progress: 'جاري',
        partially_completed: 'مكتمل جزئياً',
        completed: 'مكتمل',
        cancelled: 'ملغى',
    },
    urgency_opts: {
        routine: 'روتيني',
        urgent: 'عاجل',
        stat: 'فوري',
    },
    appt_status_opts: {
        scheduled: 'مجدول',
        confirmed: 'مؤكد',
        arrived: 'وصل',
        in_progress: 'جاري',
        completed: 'مكتمل',
        cancelled: 'ملغى',
        no_show: 'لم يحضر',
    },
    appt_type_opts: {
        consultation: 'استشارة',
        follow_up: 'متابعة',
        emergency: 'طارئ',
        routine_checkup: 'فحص روتيني',
        vaccination: 'تطعيم',
        procedure: 'إجراء',
        lab_test: 'تحليل',
        tele_consultation: 'استشارة عن بعد',
        home_visit: 'زيارة منزلية',
    },
    appt_priority_opts: {
        low: 'منخفضة',
        normal: 'عادية',
        high: 'عالية',
        emergency: 'طارئة',
    },
    appt_start: 'البداية',
    appt_end: 'النهاية',
    chief_complaint: 'السبب / الشكوى الرئيسية',
    priority_label: 'الأولوية',
    status_label: 'الحالة',
    confirmation_label: 'التأكيد',
    cancel_appointment: 'إلغاء الموعد',
    cancel_reason_ph: 'سبب الإلغاء',
    prescription_status_opts: {
        draft: 'مسودة',
        active: 'نشطة',
        completed: 'مكتملة',
        discontinued: 'موقوفة',
        cancelled: 'ملغاة',
        expired: 'منتهية',
    },
    record_type_opts: {
        note: 'ملاحظة',
        progress: 'متابعة',
        lab_result: 'نتيجة تحليل',
        imaging: 'تصوير',
        procedure: 'إجراء',
        vaccination: 'تطعيم',
        surgery: 'جراحة',
        discharge_summary: 'ملخص الخروج',
        referral: 'إحالة',
        other: 'أخرى',
    },
    gender_opts: {
        male: 'ذكر',
        female: 'أنثى',
        other: 'آخر',
    },
    inventory_category_opts: {
        medication: 'دواء',
        supplies: 'مستلزمات',
        equipment: 'معدات',
        office_supplies: 'لوازم مكتبية',
    },
    route_opts: {
        oral: 'فموي',
        topical: 'موضعي',
        intravenous: 'وريدي',
        intramuscular: 'عضلي',
        subcutaneous: 'تحت الجلد',
        sublingual: 'تحت اللسان',
        rectal: 'شرجي',
        inhalation: 'استنشاق',
        ophthalmic: 'عيني',
        otic: 'أذني',
    },
    vendor_category_opts: {
        supplies: 'مستلزمات',
        utilities: 'مرافق',
        maintenance: 'صيانة',
        professional_services: 'خدمات مهنية',
    },
    expense_category_opts: {
        rent: 'إيجار',
        utilities: 'مرافق',
        salaries: 'رواتب',
        supplies: 'مستلزمات',
        equipment: 'معدات',
        maintenance: 'صيانة',
        marketing: 'تسويق',
        insurance: 'تأمين',
        taxes: 'ضرائب',
        licenses: 'تراخيص',
        training: 'تدريب',
        travel: 'سفر',
        miscellaneous: 'متنوعة',
    },
    recurring_frequency_opts: {
        daily: 'يومي',
        weekly: 'أسبوعي',
        monthly: 'شهري',
        quarterly: 'ربع سنوي',
        yearly: 'سنوي',
    },
    inventory_txn_opts: {
        purchase: 'شراء',
        sale: 'بيع',
        consumption: 'استهلاك',
        adjustment: 'تسوية',
        expired: 'منتهي الصلاحية',
        return: 'إرجاع',
        transfer: 'تحويل',
        damaged: 'تالف',
        reversal: 'عكس',
    },
    invoice_item_type_opts: {
        consultation: 'استشارة',
        procedure: 'إجراء',
        lab_test: 'تحليل مخبري',
        imaging: 'تصوير',
        medication: 'دواء',
        vaccination: 'تطعيم',
        supplies: 'مستلزمات',
        other: 'أخرى',
    },
    documents: 'المستندات',
    document: 'مستند',
    folders: 'المجلدات',
    folder: 'مجلد',
    no_documents: 'لا توجد مستندات',
    no_folders: 'لا توجد مجلدات',
    new_document: 'مستند جديد',
    new_folder: 'مجلد جديد',
    upload: 'رفع',
    download: 'تنزيل',
    export_pdf: 'تصدير PDF',
    preview_label: 'معاينة',
    file: 'ملف',
    document_type: 'النوع',
    uploaded_by: 'رُفع بواسطة',
    size: 'الحجم',
    expires: 'تنتهي الصلاحية',
    private_label: 'خاص',
    system_label: 'النظام',
    all_folders: 'جميع المجلدات',

    pagination_summary: 'الصفحة :current من :last · :total',

    start_label: 'البداية',
    end_label: 'النهاية',
    select_doctor_ph: 'اختر طبيباً…',
    loading_ph: 'جاري التحميل…',
    new_appt_doctor_desc: 'جدولة موعد جديد لمريض.',
    new_appt_secretary_desc: 'جدولة موعد جديد وتعيين طبيب.',
    new_patient_desc: 'تسجيل مريض جديد في عيادتك.',
    new_lab_order_desc: 'طلب فحص واحد أو أكثر لمريض.',
    test_name_label: 'اسم الفحص',
    test_code_label: 'رمز الفحص',
    test_category_label: 'فئة الفحص',
    specimen_type_label: 'نوع العينة',
    attachments_label: 'المرفقات',
    files_selected: 'ملف/ملفات محددة',
    add_test_label: 'إضافة فحص',
    log_expense_desc: 'تسجيل مصروف جديد للعيادة.',
    recurring_expense_label: 'مصروف متكرر',
    recurring_end_date: 'تاريخ انتهاء التكرار',
    new_invoice_desc: 'إنشاء فاتورة جديدة لمريض.',
    quantity_label: 'الكمية',
    empty_no_vital_signs: 'لا توجد علامات حيوية مسجلة بعد.',

    document_type_opts: {
        patient_record: 'سجل المريض',
        lab_result: 'نتيجة مخبرية',
        imaging: 'تصوير',
        prescription: 'وصفة طبية',
        invoice: 'فاتورة',
        consent_form: 'نموذج موافقة',
        insurance_card: 'بطاقة التأمين',
        national_id: 'البطاقة الوطنية',
        doctor_license: 'ترخيص الطبيب',
        clinic_license: 'ترخيص العيادة',
        contract: 'عقد',
        report: 'تقرير',
        certificate: 'شهادة',
        medical_report: 'تقرير طبي',
        discharge_summary: 'ملخص الخروج',
        other: 'أخرى',
    },
};

export const DOCTOR_I18N: Record<DoctorLang, DoctorDictionary> = { en, fr, ar };

export function useDoctorT(lang: DoctorLang): DoctorDictionary {
    return DOCTOR_I18N[lang];
}

export function enumLabel(
    map: Record<string, string>,
    value: string | null | undefined,
): string {
    if (!value) {
        return '—';
    }

    return map[value] ?? value.replace(/_/g, ' ');
}
