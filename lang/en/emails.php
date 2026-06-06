<?php

return [
    'salutation' => 'Regards,',

    'verify' => [
        'subject' => 'Verify your email address',
        'greeting' => 'Hello!',
        'line_1' => 'Please confirm your email address by clicking the button below.',
        'action' => 'Verify email address',
        'line_2' => 'If you did not create an account, no further action is required.',
    ],

    'reset' => [
        'subject' => 'Reset your password',
        'greeting' => 'Hello!',
        'line_1' => 'You are receiving this email because we received a password reset request for your account.',
        'action' => 'Reset password',
        'expire' => 'This password reset link will expire in :count minutes.',
        'line_2' => 'If you did not request a password reset, no further action is required.',
    ],

    'password_changed' => [
        'subject' => 'Your password was changed',
        'greeting' => 'Hello :name,',
        'line_1' => 'This is a confirmation that the password for your account was just changed.',
        'line_2' => 'If you did not make this change, reset your password immediately and contact your clinic administrator.',
    ],

    'password_reset_done' => [
        'subject' => 'Your password was reset',
        'greeting' => 'Hello :name,',
        'line_1' => 'Your account password was just reset.',
        'line_2' => "If this wasn't you, contact your clinic administrator right away.",
    ],

    'two_factor_enabled' => [
        'subject' => 'Two-factor authentication enabled',
        'greeting' => 'Hello :name,',
        'line_1' => 'Two-factor authentication was just enabled on your account.',
        'line_2' => 'If you did not do this, contact your clinic administrator immediately.',
    ],

    'two_factor_disabled' => [
        'subject' => 'Two-factor authentication disabled',
        'greeting' => 'Hello :name,',
        'line_1' => 'Two-factor authentication was just disabled on your account.',
        'line_2' => 'If you did not do this, secure your account and contact your clinic administrator immediately.',
    ],

    'new_device' => [
        'subject' => 'New sign-in to your account',
        'greeting' => 'Hello :name,',
        'line_1' => 'We noticed a sign-in to your account from a new device.',
        'when' => 'When: :when',
        'ip' => 'IP address: :ip',
        'device' => 'Device: :device',
        'line_2' => 'If this was you, you can ignore this email. If it was not, reset your password immediately.',
    ],

    'newsletter' => [
        'subject' => "You're subscribed to BlueDome",
        'greeting' => 'Welcome!',
        'line_1' => "Thanks for subscribing. About once a month we'll send you:",
        'line_2' => 'Product updates, clinical case studies, and medical best practices.',
        'action' => 'Sign in to BlueDome',
        'line_3' => 'Not a member yet? Use the button above to sign in, or start a free 3-day trial for your clinic.',
    ],

    'new_message' => [
        'subject' => 'New message from :sender',
        'greeting' => 'Hello!',
        'line_1' => ':sender sent you a message:',
        'action' => 'Open Messages',
        'line_2' => 'Open your Messages page to reply.',
    ],
];
