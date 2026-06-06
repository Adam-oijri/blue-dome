<?php

return [
    'activity' => [
        'create' => 'أضاف :actor :entity',
        'update' => 'حدّث :actor :entity',
        'delete' => 'حذف :actor :entity',
        'soft_delete' => 'حذف :actor :entity',
        'restore' => 'استعاد :actor :entity',
        'status_change' => 'غيّر :actor حالة :entity',
        'confirm_appointment' => 'أكّد :actor موعداً',
        'send_invoice' => 'أرسل :actor فاتورة',
        'send_prescription' => 'أرسل :actor وصفة',
        'default' => 'حدّث :actor :entity',
    ],

    'entity' => [
        'Patient' => 'مريضاً',
        'Appointment' => 'موعداً',
        'Prescription' => 'وصفة',
        'LabOrder' => 'تحليلاً',
        'MedicalRecord' => 'سجلاً طبياً',
        'Invoice' => 'فاتورة',
        'Payment' => 'دفعة',
        'Expense' => 'مصروفاً',
        'Inventory' => 'صنف مخزون',
        'Medication' => 'دواءً',
        'Vendor' => 'مورّداً',
        'Document' => 'مستنداً',
        'Clinic' => 'عيادة',
        'User' => 'عضواً',
        'default' => 'سجلاً',
    ],

    'alert' => [
        'appointment_confirmation' => [
            'title' => 'موعد جديد',
            'message' => 'تم حجز موعد جديد لـ :patient.',
        ],
        'appointment_confirmed' => [
            'title' => 'تم تأكيد الموعد',
            'message' => 'تم تأكيد موعد :patient.',
        ],
        'lab_result_ready' => [
            'title' => 'نتيجة التحليل جاهزة',
            'message' => 'النتائج جاهزة لـ :patient.',
        ],
        'inventory_low' => [
            'title' => 'مخزون منخفض',
            'message' => 'مخزون :item منخفض.',
        ],
        'payment_received' => [
            'title' => 'تم استلام دفعة',
            'message' => 'تم تسجيل دفعة بقيمة :amount.',
        ],
    ],
];
