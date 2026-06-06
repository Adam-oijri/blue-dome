<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\EmailIntegration;
use App\Models\Invoice;
use App\Models\User;
use App\Models\WhatsAppIntegration;

/**
 * Coverage for the super-admin clinic-scoped actions the audit flagged as
 * untested: clinic email/WhatsApp config + the nested appointment/invoice
 * update & destroy. All act as a super_admin against a seeded clinic.
 */
beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->clinic = Clinic::factory()->create();
});

it('updates a clinic email integration', function () {
    $this->actingAs($this->superAdmin)
        ->patch(route('super-admin.clinics.email.update', ['clinic' => $this->clinic->id]), [
            'from_email' => 'desk@clinic.example',
            'from_name' => 'Front Desk',
        ])
        ->assertSessionHasNoErrors();

    expect(
        EmailIntegration::query()->where('clinic_id', $this->clinic->id)->value('from_email'),
    )->toBe('desk@clinic.example');
});

it('updates a clinic WhatsApp integration', function () {
    $this->actingAs($this->superAdmin)
        ->patch(route('super-admin.clinics.whatsapp.update', ['clinic' => $this->clinic->id]), [
            'phone_number_id' => '111222333',
            'business_account_id' => '999888777',
            'daily_message_limit' => 500,
            'is_active' => true,
            'access_token' => 'EAAG-test-token',
        ])
        ->assertSessionHasNoErrors();

    expect(
        WhatsAppIntegration::query()->where('clinic_id', $this->clinic->id)->value('phone_number_id'),
    )->toBe('111222333');
});

it('updates and soft-deletes a clinic appointment', function () {
    $appt = Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'status' => 'scheduled',
    ]);

    $this->actingAs($this->superAdmin)
        ->patch(route('super-admin.clinics.appointments.update', [
            'clinic' => $this->clinic->id,
            'appointment' => $appt->id,
        ]), ['status' => 'completed'])
        ->assertSessionHasNoErrors();
    expect($appt->fresh()->status)->toBe('completed');

    $this->actingAs($this->superAdmin)
        ->delete(route('super-admin.clinics.appointments.destroy', [
            'clinic' => $this->clinic->id,
            'appointment' => $appt->id,
        ]))
        ->assertSessionHasNoErrors();
    $this->assertSoftDeleted($appt);
});

it('updates and soft-deletes a clinic invoice', function () {
    $invoice = Invoice::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->superAdmin)
        ->patch(route('super-admin.clinics.invoices.update', [
            'clinic' => $this->clinic->id,
            'invoice' => $invoice->id,
        ]), ['notes' => 'Admin coverage note'])
        ->assertSessionHasNoErrors();
    expect($invoice->fresh()->notes)->toBe('Admin coverage note');

    $this->actingAs($this->superAdmin)
        ->delete(route('super-admin.clinics.invoices.destroy', [
            'clinic' => $this->clinic->id,
            'invoice' => $invoice->id,
        ]))
        ->assertSessionHasNoErrors();
    $this->assertSoftDeleted($invoice);
});
