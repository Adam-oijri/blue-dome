<?php

/**
 * Phase 2 ships only the attribute-name overrides in Arabic. Validation
 * messages themselves fall back to `lang/en/validation.php`. Full
 * message translation is Phase 9 (Localization parity + hardening).
 */
return [
    'custom' => [
        // Parity placeholder; see lang/en/validation.php.
        'attribute-name' => [
            'rule-name' => 'رسالة-مخصصة',
        ],
    ],
    'attributes' => [
        'first_name' => 'الاسم الأول',
        'last_name' => 'اسم العائلة',
        'date_of_birth' => 'تاريخ الميلاد',
        'gender' => 'الجنس',
        'phone' => 'الهاتف',
        'phone_e164' => 'الهاتف المحمول (صيغة دولية)',
        'alternative_phone' => 'هاتف بديل',
        'email' => 'البريد الإلكتروني',
        'national_id' => 'رقم البطاقة الوطنية',
        'passport_number' => 'رقم جواز السفر',
        'insurance_number' => 'رقم التأمين',
        'insurance_company' => 'شركة التأمين',
        'insurance_expiry' => 'انتهاء التأمين',
        'blood_type' => 'فصيلة الدم',
        'branch_id' => 'الفرع',
        'patient_code' => 'رمز المريض',
        'address' => 'العنوان',
        'city' => 'المدينة',
        'postal_code' => 'الرمز البريدي',
        'emergency_contact_name' => 'جهة الاتصال للطوارئ',
        'emergency_contact_phone' => 'هاتف الطوارئ',
        'emergency_contact_relation' => 'صلة القرابة',
        'allergies' => 'الحساسية',
        'chronic_diseases' => 'الأمراض المزمنة',
        'current_medications' => 'الأدوية الحالية',
        'family_history' => 'التاريخ العائلي',
        'surgical_history' => 'التاريخ الجراحي',
        'smoking_status' => 'التدخين',
        'alcohol_consumption' => 'استهلاك الكحول',
        'temperature_c' => 'درجة الحرارة (مئوية)',
        'blood_pressure_sys' => 'الضغط الانقباضي',
        'blood_pressure_dia' => 'الضغط الانبساطي',
        'heart_rate' => 'معدل النبض',
        'respiratory_rate' => 'معدل التنفس',
        'oxygen_saturation' => 'تشبع الأكسجين',
        'blood_glucose' => 'سكر الدم',
        'weight_kg' => 'الوزن (كغ)',
        'height_cm' => 'الطول (سم)',
        'pain_score' => 'مستوى الألم',
        'recorded_at' => 'تاريخ التسجيل',
    ],
];
