<?php

return [
    'salutation' => 'Cordialement,',

    'verify' => [
        'subject' => 'Vérifiez votre adresse e-mail',
        'greeting' => 'Bonjour !',
        'line_1' => 'Veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous.',
        'action' => "Vérifier l'adresse e-mail",
        'line_2' => "Si vous n'avez pas créé de compte, aucune action n'est requise.",
    ],

    'reset' => [
        'subject' => 'Réinitialisez votre mot de passe',
        'greeting' => 'Bonjour !',
        'line_1' => 'Vous recevez cet e-mail car nous avons reçu une demande de réinitialisation du mot de passe de votre compte.',
        'action' => 'Réinitialiser le mot de passe',
        'expire' => 'Ce lien de réinitialisation expirera dans :count minutes.',
        'line_2' => "Si vous n'avez pas demandé de réinitialisation, aucune action n'est requise.",
    ],

    'password_changed' => [
        'subject' => 'Votre mot de passe a été modifié',
        'greeting' => 'Bonjour :name,',
        'line_1' => 'Ceci confirme que le mot de passe de votre compte vient d\'être modifié.',
        'line_2' => "Si vous n'êtes pas à l'origine de ce changement, réinitialisez votre mot de passe immédiatement et contactez l'administrateur de votre clinique.",
    ],

    'password_reset_done' => [
        'subject' => 'Votre mot de passe a été réinitialisé',
        'greeting' => 'Bonjour :name,',
        'line_1' => 'Le mot de passe de votre compte vient d\'être réinitialisé.',
        'line_2' => "Si ce n'était pas vous, contactez immédiatement l'administrateur de votre clinique.",
    ],

    'two_factor_enabled' => [
        'subject' => 'Authentification à deux facteurs activée',
        'greeting' => 'Bonjour :name,',
        'line_1' => 'L\'authentification à deux facteurs vient d\'être activée sur votre compte.',
        'line_2' => "Si vous n'êtes pas à l'origine de cette action, contactez immédiatement l'administrateur de votre clinique.",
    ],

    'two_factor_disabled' => [
        'subject' => 'Authentification à deux facteurs désactivée',
        'greeting' => 'Bonjour :name,',
        'line_1' => 'L\'authentification à deux facteurs vient d\'être désactivée sur votre compte.',
        'line_2' => "Si vous n'êtes pas à l'origine de cette action, sécurisez votre compte et contactez immédiatement l'administrateur de votre clinique.",
    ],

    'new_device' => [
        'subject' => 'Nouvelle connexion à votre compte',
        'greeting' => 'Bonjour :name,',
        'line_1' => 'Nous avons détecté une connexion à votre compte depuis un nouvel appareil.',
        'when' => 'Quand : :when',
        'ip' => 'Adresse IP : :ip',
        'device' => 'Appareil : :device',
        'line_2' => "Si c'était vous, vous pouvez ignorer cet e-mail. Sinon, réinitialisez votre mot de passe immédiatement.",
    ],

    'newsletter' => [
        'subject' => 'Vous êtes inscrit à BlueDome',
        'greeting' => 'Bienvenue !',
        'line_1' => 'Merci de votre inscription. Environ une fois par mois, nous vous enverrons :',
        'line_2' => 'Les nouveautés produit, des études de cas cliniques et nos meilleures pratiques médicales.',
        'action' => 'Se connecter à BlueDome',
        'line_3' => 'Pas encore membre ? Utilisez le bouton ci-dessus pour vous connecter, ou démarrez un essai gratuit de 3 jours pour votre clinique.',
    ],

    'new_message' => [
        'subject' => 'Nouveau message de :sender',
        'greeting' => 'Bonjour !',
        'line_1' => ':sender vous a envoyé un message :',
        'action' => 'Ouvrir la messagerie',
        'line_2' => 'Ouvrez votre messagerie pour répondre.',
    ],
];
