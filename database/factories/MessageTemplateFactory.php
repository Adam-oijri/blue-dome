<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\MessageTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MessageTemplate>
 */
class MessageTemplateFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'template_name' => 'appointment_confirmation',
            'template_type' => 'whatsapp',
            'template_category' => 'appointment_confirmation',
            'whatsapp_template_name' => 'appointment_confirmation_v1',
            'whatsapp_template_language' => 'fr',
            'whatsapp_template_status' => 'approved',
            'subject' => null,
            'body' => 'Bonjour {{patient_name}}, votre rendez-vous est confirmé pour le {{appointment_date}}. Lien : {{confirmation_url}}',
            'variables' => ['patient_name', 'appointment_date', 'confirmation_url'],
            'locale' => 'fr',
            'is_active' => true,
            'is_default' => false,
        ];
    }
}
