<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\MessageTemplate;
use Illuminate\Database\Seeder;

/**
 * Seeds the three appointment templates × three locales (fr/ar/en) for the
 * demo clinic so secretary smoke testing has something to send. Production
 * clinics seed their own templates during onboarding (Phase 9).
 */
class MessageTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $demoClinic = Clinic::where('slug', 'demo-clinic')->first();

        if ($demoClinic === null) {
            return;
        }

        $bodies = [
            'appointment_confirmation' => [
                'fr' => 'Bonjour {{patient_name}}, votre rendez-vous est prévu le {{appointment_date}} avec {{doctor_name}}. Confirmez ici : {{confirmation_url}}',
                'ar' => 'مرحبا {{patient_name}}، موعدك مع {{doctor_name}} في {{appointment_date}}. أكّد هنا: {{confirmation_url}}',
                'en' => 'Hi {{patient_name}}, your appointment with {{doctor_name}} is set for {{appointment_date}}. Confirm here: {{confirmation_url}}',
            ],
            'appointment_reminder_24h' => [
                'fr' => 'Rappel : rendez-vous demain à {{appointment_time}} avec {{doctor_name}}.',
                'ar' => 'تذكير: موعدك غدا الساعة {{appointment_time}} مع {{doctor_name}}.',
                'en' => 'Reminder: appointment tomorrow at {{appointment_time}} with {{doctor_name}}.',
            ],
            'appointment_reminder_2h' => [
                'fr' => 'Rappel : votre rendez-vous est dans 2 heures avec {{doctor_name}}.',
                'ar' => 'تذكير: موعدك بعد ساعتين مع {{doctor_name}}.',
                'en' => 'Reminder: your appointment is in 2 hours with {{doctor_name}}.',
            ],
        ];

        foreach ($bodies as $name => $byLocale) {
            foreach ($byLocale as $locale => $body) {
                MessageTemplate::query()->updateOrCreate(
                    [
                        'clinic_id' => $demoClinic->id,
                        'template_name' => $name,
                        'template_type' => 'whatsapp',
                        'locale' => $locale,
                    ],
                    [
                        'template_category' => $name === 'appointment_reminder_24h' || $name === 'appointment_reminder_2h'
                            ? 'appointment_reminder'
                            : 'appointment_confirmation',
                        'whatsapp_template_name' => $name.'_v1',
                        'whatsapp_template_language' => $locale,
                        'whatsapp_template_status' => 'approved',
                        'body' => $body,
                        'variables' => match ($name) {
                            'appointment_confirmation' => ['patient_name', 'appointment_date', 'doctor_name', 'confirmation_url'],
                            'appointment_reminder_24h' => ['patient_name', 'appointment_time', 'doctor_name'],
                            'appointment_reminder_2h' => ['patient_name', 'doctor_name'],
                        },
                        'is_active' => true,
                        'is_default' => true,
                    ]
                );
            }
        }
    }
}
