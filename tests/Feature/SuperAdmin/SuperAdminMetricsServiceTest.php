<?php

use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\DoctorProfile;
use App\Models\Inventory;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use App\Services\SuperAdminMetricsService;

beforeEach(function () {
    $this->service = app(SuperAdminMetricsService::class);
});

it('sums payments across all clinics for total revenue', function () {
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->for($clinic)->create();
    $invoice = Invoice::factory()->for($clinic)->for($patient)->create();

    Payment::factory()->for($invoice)->create(['amount' => 1000, 'clinic_id' => $clinic->id, 'patient_id' => $patient->id]);
    Payment::factory()->for($invoice)->create(['amount' => 500, 'clinic_id' => $clinic->id, 'patient_id' => $patient->id]);

    $result = $this->service->totalRevenue();

    expect($result['amount'])->toEqual(1500.0);
    expect($result['currency'])->toBe(config('billing.currency'));
});

it('counts total patients across the platform', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();

    Patient::factory()->for($clinicA)->count(3)->create();
    Patient::factory()->for($clinicB)->count(2)->create();

    expect($this->service->totalPatients())->toBe(5);
});

it('returns zero utilization when no appointments today', function () {
    expect($this->service->doctorUtilizationToday())->toBe(0.0);
});

it('computes utilization fraction from today\'s appointments', function () {
    $clinic = Clinic::factory()->create();
    $doctor = User::factory()->doctor()->create(['clinic_id' => $clinic->id]);
    $today = now()->setTime(8, 0);

    $slots = [
        ['offset' => 0, 'status' => 'scheduled'],
        ['offset' => 1, 'status' => 'completed'],
        ['offset' => 2, 'status' => 'completed'],
        ['offset' => 3, 'status' => 'cancelled'],
    ];

    foreach ($slots as $i => $slot) {
        $start = $today->copy()->addHours($i);
        Appointment::factory()->create([
            'clinic_id' => $clinic->id,
            'doctor_id' => $doctor->id,
            'appointment_day' => $start->toDateString(),
            'scheduled_start' => $start,
            'scheduled_end' => $start->copy()->addMinutes(30),
            'status' => $slot['status'],
        ]);
    }

    // 2 completed out of 3 non-cancelled = 0.6667 rounded
    expect($this->service->doctorUtilizationToday())->toEqualWithDelta(2 / 3, 0.001);
});

it('returns a 12-month revenue series with zero-fill', function () {
    $series = $this->service->monthlyRevenue();
    expect($series)->toHaveCount(12);
    expect($series[0])->toHaveKeys(['month', 'amount']);
});

it('lists top doctors across clinics sorted by completed appointments', function () {
    $clinicA = Clinic::factory()->create();
    $doctorA = User::factory()->doctor()->create(['clinic_id' => $clinicA->id]);
    DoctorProfile::create([
        'user_id' => $doctorA->id,
        'clinic_id' => $clinicA->id,
        'specialty' => 'Cardiology',
        'consultation_fee' => 200,
    ]);

    // 3 completed appointments today
    foreach (range(0, 2) as $i) {
        $start = now()->setTime(9 + $i, 0);
        Appointment::factory()->create([
            'clinic_id' => $clinicA->id,
            'doctor_id' => $doctorA->id,
            'appointment_day' => $start->toDateString(),
            'scheduled_start' => $start,
            'scheduled_end' => $start->copy()->addMinutes(30),
            'status' => 'completed',
        ]);
    }

    $top = $this->service->topDoctors();
    $match = collect($top)->firstWhere('id', $doctorA->id);

    expect($match)->not->toBeNull();
    expect($match['completed'])->toBe(3);
    expect($match['specialty'])->toBe('Cardiology');
    expect($match['revenue'])->toEqual(600.0);
});

it('aggregates top clinics with revenue and counts', function () {
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->for($clinic)->create();
    $invoice = Invoice::factory()->for($clinic)->for($patient)->create();

    Payment::factory()->for($invoice)->create([
        'amount' => 750,
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
    ]);

    $result = collect($this->service->topClinicsByRevenue())->firstWhere('id', $clinic->id);

    expect($result)->not->toBeNull();
    expect($result['revenue'])->toEqual(750.0);
    expect($result['patients_count'])->toBe(1);
});

it('surfaces low-inventory alerts', function () {
    $clinic = Clinic::factory()->create();
    Inventory::factory()->for($clinic)->create([
        'item_name' => 'Paracetamol',
        'quantity_in_stock' => 2,
        'min_stock_level' => 10,
        'is_active' => true,
    ]);

    $alerts = $this->service->alerts();
    $found = collect($alerts)->firstWhere('kind', 'low_inventory');

    expect($found)->not->toBeNull();
    expect($found['title'])->toContain('Paracetamol');
});

it('returns recent activity rows with eager-loaded relations', function () {
    $clinic = Clinic::factory()->create();
    $user = User::factory()->create(['clinic_id' => $clinic->id]);
    $log = ActivityLog::create([
        'clinic_id' => $clinic->id,
        'user_id' => $user->id,
        'action' => 'create',
        'entity_type' => 'Patient',
        'entity_id' => $user->id, // dummy
        'created_at' => now(),
    ]);

    // The AuditObserver also logs the clinic + user creations above with the
    // same timestamp, so the feed order among the ties is non-deterministic;
    // locate the row we created by id rather than assuming it sorts first.
    $row = collect($this->service->recentActivity())->firstWhere('id', $log->id);

    expect($row)->not->toBeNull();
    expect($row['action'])->toBe('create');
    expect($row['clinic']['id'])->toBe($clinic->id);
    expect($row['user']['id'])->toBe($user->id);
});
