<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Schedule between tomorrow and 30 days out, on the hour, 30 minutes
        // long — keeps the GiST exclusion constraint happy by default.
        $start = now()->addDays(fake()->numberBetween(1, 30))->setTime(fake()->numberBetween(9, 16), 0);
        $end = (clone $start)->addMinutes(30);

        return [
            'clinic_id' => Clinic::factory(),
            'branch_id' => null,
            'patient_id' => Patient::factory(),
            'doctor_id' => function (array $attributes) {
                return User::factory()->doctor()->create([
                    'clinic_id' => $attributes['clinic_id'],
                ])->id;
            },
            'secretary_id' => null,
            // appointment_number left null on purpose — AppointmentObserver
            // allocates via fn_next_seq.
            'appointment_number' => null,
            'scheduled_start' => $start,
            'scheduled_end' => $end,
            'appointment_day' => $start->toDateString(),
            'status' => 'scheduled',
            'type' => 'consultation',
            'priority' => 'normal',
            'confirmation_status' => 'pending',
            'confirmation_token' => null,
            'confirmation_token_expires' => null,
            'needs_follow_up_call' => false,
            'is_free' => false,
            'currency' => 'MAD',
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
            'confirmation_status' => 'confirmed_by_patient',
            'confirmation_at' => now(),
            'confirmation_method' => 'whatsapp',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_reason' => fake()->sentence(),
        ]);
    }

    public function pendingConfirmation(): static
    {
        return $this->state(fn (array $attributes) => [
            'confirmation_token' => Str::random(64),
            'confirmation_token_expires' => now()->addHours(48),
            'confirmation_status' => 'reminder_sent',
        ]);
    }

    public function expiredToken(): static
    {
        return $this->state(fn (array $attributes) => [
            'confirmation_token' => Str::random(64),
            'confirmation_token_expires' => now()->subHour(),
            'confirmation_status' => 'reminder_sent',
        ]);
    }

    public function needingFollowUp(): static
    {
        return $this->state(fn (array $attributes) => [
            'needs_follow_up_call' => true,
            'follow_up_call_status' => 'pending',
            'follow_up_call_attempts' => 0,
        ]);
    }
}
