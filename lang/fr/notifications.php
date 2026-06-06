<?php

return [
    'activity' => [
        'create' => ':actor a ajouté un(e) :entity',
        'update' => ':actor a modifié un(e) :entity',
        'delete' => ':actor a supprimé un(e) :entity',
        'soft_delete' => ':actor a supprimé un(e) :entity',
        'restore' => ':actor a restauré un(e) :entity',
        'status_change' => ':actor a changé le statut d\'un(e) :entity',
        'confirm_appointment' => ':actor a confirmé un rendez-vous',
        'send_invoice' => ':actor a envoyé une facture',
        'send_prescription' => ':actor a envoyé une ordonnance',
        'default' => ':actor a modifié un(e) :entity',
    ],

    'entity' => [
        'Patient' => 'patient',
        'Appointment' => 'rendez-vous',
        'Prescription' => 'ordonnance',
        'LabOrder' => 'analyse',
        'MedicalRecord' => 'dossier médical',
        'Invoice' => 'facture',
        'Payment' => 'paiement',
        'Expense' => 'dépense',
        'Inventory' => 'article de stock',
        'Medication' => 'médicament',
        'Vendor' => 'fournisseur',
        'Document' => 'document',
        'Clinic' => 'clinique',
        'User' => 'membre',
        'default' => 'enregistrement',
    ],

    'alert' => [
        'appointment_confirmation' => [
            'title' => 'Nouveau rendez-vous',
            'message' => 'Un nouveau rendez-vous a été pris pour :patient.',
        ],
        'appointment_confirmed' => [
            'title' => 'Rendez-vous confirmé',
            'message' => 'Le rendez-vous de :patient a été confirmé.',
        ],
        'lab_result_ready' => [
            'title' => 'Résultat d\'analyse prêt',
            'message' => 'Les résultats sont prêts pour :patient.',
        ],
        'inventory_low' => [
            'title' => 'Stock faible',
            'message' => 'Le stock de :item est bas.',
        ],
        'payment_received' => [
            'title' => 'Paiement reçu',
            'message' => 'Un paiement de :amount a été enregistré.',
        ],
    ],
];
