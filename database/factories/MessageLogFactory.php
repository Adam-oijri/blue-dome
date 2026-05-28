<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\MessageLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MessageLog>
 */
class MessageLogFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'message_type' => 'whatsapp',
            'direction' => 'outbound',
            'recipient_type' => 'patient',
            'recipient_id' => fake()->uuid(),
            'recipient_contact' => '+2126'.fake()->numerify('########'),
            'recipient_name' => fake()->name(),
            'subject' => null,
            'body' => 'Test message body',
            'attachments' => [],
            'status' => 'sent',
            'sent_at' => now(),
            'created_at' => now(),
        ];
    }
}
