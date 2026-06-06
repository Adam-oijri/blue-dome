<?php

return [
    // Activity-feed items (built server-side in the viewer's locale from
    // activity_log rows). `:actor` = who did it, `:entity` = entity label below.
    'activity' => [
        'create' => ':actor added a :entity',
        'update' => ':actor updated a :entity',
        'delete' => ':actor removed a :entity',
        'soft_delete' => ':actor removed a :entity',
        'restore' => ':actor restored a :entity',
        'status_change' => ':actor changed a :entity status',
        'confirm_appointment' => ':actor confirmed an appointment',
        'send_invoice' => ':actor sent an invoice',
        'send_prescription' => ':actor sent a prescription',
        'default' => ':actor updated a :entity',
    ],

    'entity' => [
        'Patient' => 'patient',
        'Appointment' => 'appointment',
        'Prescription' => 'prescription',
        'LabOrder' => 'lab order',
        'MedicalRecord' => 'medical record',
        'Invoice' => 'invoice',
        'Payment' => 'payment',
        'Expense' => 'expense',
        'Inventory' => 'inventory item',
        'Medication' => 'medication',
        'Vendor' => 'vendor',
        'Document' => 'document',
        'Clinic' => 'clinic',
        'User' => 'team member',
        'default' => 'record',
    ],

    // Targeted alerts (stored pre-localized in each recipient's locale).
    'alert' => [
        'appointment_confirmation' => [
            'title' => 'New appointment',
            'message' => 'A new appointment was booked for :patient.',
        ],
        'appointment_confirmed' => [
            'title' => 'Appointment confirmed',
            'message' => 'The appointment for :patient was confirmed.',
        ],
        'lab_result_ready' => [
            'title' => 'Lab result ready',
            'message' => 'Results are ready for :patient.',
        ],
        'inventory_low' => [
            'title' => 'Low stock',
            'message' => ':item is running low on stock.',
        ],
        'payment_received' => [
            'title' => 'Payment received',
            'message' => 'A payment of :amount was recorded.',
        ],
    ],
];
