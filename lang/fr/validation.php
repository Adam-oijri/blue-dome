<?php

/**
 * Phase 2 ships only the attribute-name overrides in French. Validation
 * messages themselves fall back to `lang/en/validation.php`. Full
 * message translation is Phase 9 (Localization parity + hardening).
 */
return [
    'custom' => [
        // Parity placeholder; see lang/en/validation.php.
        'attribute-name' => [
            'rule-name' => 'message-personnalisé',
        ],
    ],
    'attributes' => [
        'first_name' => 'prénom',
        'last_name' => 'nom',
        'date_of_birth' => 'date de naissance',
        'gender' => 'sexe',
        'phone' => 'téléphone',
        'phone_e164' => 'mobile (format international)',
        'alternative_phone' => 'téléphone secondaire',
        'email' => 'adresse e-mail',
        'national_id' => 'CIN',
        'passport_number' => 'numéro de passeport',
        'insurance_number' => "numéro d'assurance",
        'insurance_company' => 'compagnie d\'assurance',
        'insurance_expiry' => "expiration d'assurance",
        'blood_type' => 'groupe sanguin',
        'branch_id' => 'établissement',
        'patient_code' => 'code patient',
        'address' => 'adresse',
        'city' => 'ville',
        'postal_code' => 'code postal',
        'emergency_contact_name' => 'personne à prévenir',
        'emergency_contact_phone' => "téléphone d'urgence",
        'emergency_contact_relation' => 'relation',
        'allergies' => 'allergies',
        'chronic_diseases' => 'maladies chroniques',
        'current_medications' => 'traitements en cours',
        'family_history' => 'antécédents familiaux',
        'surgical_history' => 'antécédents chirurgicaux',
        'smoking_status' => 'tabagisme',
        'alcohol_consumption' => 'consommation d\'alcool',
        'temperature_c' => 'température (°C)',
        'blood_pressure_sys' => 'tension systolique',
        'blood_pressure_dia' => 'tension diastolique',
        'heart_rate' => 'fréquence cardiaque',
        'respiratory_rate' => 'fréquence respiratoire',
        'oxygen_saturation' => 'saturation en oxygène',
        'blood_glucose' => 'glycémie',
        'weight_kg' => 'poids (kg)',
        'height_cm' => 'taille (cm)',
        'pain_score' => 'score de douleur',
        'recorded_at' => "date d'enregistrement",
    ],
];
