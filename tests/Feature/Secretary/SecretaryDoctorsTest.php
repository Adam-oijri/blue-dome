<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Queue;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    Queue::fake();
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('renders the doctors page for the clinic secretary', function () {
    User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    actingAs($this->secretary)
        ->get(route('secretary.doctors'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/doctors')
            ->has('doctors', 1)
        );
});

it('computes per-doctor today count and 7-day load from grouped aggregates', function () {
    $doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    $today = CarbonImmutable::today();

    // Two appointments today (staggered to avoid the same-doctor GiST overlap).
    foreach ([9, 11] as $hour) {
        Appointment::factory()->create([
            'clinic_id' => $this->clinic->id,
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'appointment_day' => $today->toDateString(),
            'scheduled_start' => $today->setTime($hour, 0),
            'scheduled_end' => $today->setTime($hour, 30),
            'status' => 'scheduled',
        ]);
    }

    // Cancelled today appointment must not count toward the load.
    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $doctor->id,
        'patient_id' => $patient->id,
        'appointment_day' => $today->toDateString(),
        'scheduled_start' => $today->setTime(15, 0),
        'scheduled_end' => $today->setTime(15, 30),
        'status' => 'cancelled',
    ]);

    actingAs($this->secretary)
        ->get(route('secretary.doctors'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('doctors.0.today_count', 2)
            ->where('doctors.0.week_count', 2)
            // 7-day window, oldest-first; today (last slot) holds both bookings.
            ->has('doctors.0.week_load', 7)
            ->where('doctors.0.week_load.6', 2)
            ->where('doctors.0.week_load.0', 0)
        );
});

it('does not show doctors from other clinics', function () {
    $otherClinic = Clinic::factory()->create();

    User::factory()->doctor()->create(['clinic_id' => $otherClinic->id]);
    User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);

    actingAs($this->secretary)
        ->get(route('secretary.doctors'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/doctors')
            ->has('doctors', 1)
        );
});
