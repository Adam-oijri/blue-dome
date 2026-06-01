<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;
use Carbon\CarbonImmutable;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('renders the secretary billing page with invoices, kpis and aging', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    Invoice::factory()->count(3)->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.billing'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/billing')
            ->has('invoices.data', 3)
            ->has('kpis')
            ->has('aging')
            ->where('filters.status', 'all')
        );
});

it('reconciles the overdue KPI with the past-due aging buckets and ignores drafts', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    // Issued, unpaid, 10 days past due → counts as overdue, lands in the 1-30 bucket.
    Invoice::factory()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
        'status' => 'pending',
        'due_date' => CarbonImmutable::today()->subDays(10)->toDateString(),
    ]);

    // Draft, also past due → must NOT count as overdue (never issued).
    Invoice::factory()->draft()->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
        'due_date' => CarbonImmutable::today()->subDays(10)->toDateString(),
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.billing'))
        ->assertInertia(fn ($page) => $page
            ->where('kpis.overdue', 1)
            ->where('aging.0.key', 'current')
            ->where('aging.0.amount', 0)
            ->where('aging.1.key', '1-30')
            ->where('aging.1.amount', fn ($amount) => $amount > 0)
        );
});

it('scopes invoices to the secretary clinic', function () {
    $otherClinic = Clinic::factory()->create();
    $otherPatient = Patient::factory()->create(['clinic_id' => $otherClinic->id]);
    Invoice::factory()->create([
        'clinic_id' => $otherClinic->id,
        'patient_id' => $otherPatient->id,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.billing'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('invoices.data', 0));
});

it('filters invoices by status', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);
    Invoice::factory()->count(2)->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
    ]);
    Invoice::factory()->paid()->count(3)->create([
        'clinic_id' => $this->clinic->id,
        'patient_id' => $patient->id,
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.billing', ['status' => 'paid']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('invoices.data', 3)
            ->where('filters.status', 'paid')
        );
});
