<?php

use App\Models\Clinic;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
});

it('renders the finance page with mrr, monthly revenue, overdue and payment methods', function () {
    $clinic = Clinic::factory()->create([
        'subscription_status' => 'active',
        'subscription_plan' => 'professional',
    ]);
    $patient = Patient::factory()->for($clinic)->create();
    $invoice = Invoice::factory()->for($clinic)->for($patient)->create();

    Payment::factory()->for($invoice)->create([
        'amount' => 1000,
        'clinic_id' => $clinic->id,
        'patient_id' => $patient->id,
        'payment_method' => 'cash',
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('super-admin.finance'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/super-admin/finance')
            ->has('mrr.amount')
            ->has('monthly_revenue')
            ->has('top_clinics')
            ->has('overdue_by_clinic')
            ->has('payment_methods')
            ->where('total_revenue.amount', fn ($v) => (float) $v === 1000.0)
        );
});

it('blocks non-super-admin', function () {
    $this->actingAs(User::factory()->doctor()->create())
        ->get(route('super-admin.finance'))
        ->assertForbidden();
});
