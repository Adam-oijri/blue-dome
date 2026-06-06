<?php

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\LabOrder;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

/** Helper: a stored targeted alert for a user. */
function makeAlert(string $clinicId, string $userId, bool $read = false): Notification
{
    return Notification::create([
        'clinic_id' => $clinicId,
        'user_id' => $userId,
        'type' => 'lab_result_ready',
        'title' => 'Lab result ready',
        'message' => 'Results are ready.',
        'is_read' => $read,
        'created_at' => now(),
    ]);
}

// --- Targeted triggers --------------------------------------------------------

test('booking an appointment for a doctor notifies them', function () {
    $patient = Patient::factory()->create(['clinic_id' => $this->clinic->id]);

    $this->actingAs($this->secretary);
    Appointment::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
        'patient_id' => $patient->id,
    ]);

    expect(
        Notification::query()->forUser($this->doctor->id)
            ->where('type', 'appointment_confirmation')->exists(),
    )->toBeTrue();
});

test('completing a lab order notifies the ordering doctor', function () {
    $this->actingAs($this->secretary);
    $order = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
        'status' => 'pending',
    ]);

    $order->update(['status' => 'completed']);

    expect(
        Notification::query()->forUser($this->doctor->id)
            ->where('type', 'lab_result_ready')->exists(),
    )->toBeTrue();
});

test('a recorded payment notifies clinic secretaries', function () {
    $this->actingAs($this->doctor);
    Payment::factory()->create(['clinic_id' => $this->clinic->id]);

    expect(
        Notification::query()->forUser($this->secretary->id)
            ->where('type', 'payment_received')->exists(),
    )->toBeTrue();
});

test('an inventory consumption that drops below minimum notifies secretaries', function () {
    $this->actingAs($this->doctor);
    $item = Inventory::factory()->create([
        'clinic_id' => $this->clinic->id,
        'quantity_in_stock' => 12,
        'min_stock_level' => 10,
    ]);

    InventoryTransaction::factory()->create([
        'clinic_id' => $this->clinic->id,
        'inventory_id' => $item->id,
        'transaction_type' => 'consumption',
        'quantity' => 5,
    ]);

    expect(
        Notification::query()->forUser($this->secretary->id)
            ->where('type', 'inventory_low')->exists(),
    )->toBeTrue();
});

test('the actor is not notified of their own action', function () {
    $this->actingAs($this->doctor);
    $order = LabOrder::factory()->create([
        'clinic_id' => $this->clinic->id,
        'doctor_id' => $this->doctor->id,
        'status' => 'pending',
    ]);

    $order->update(['status' => 'completed']);

    expect(
        Notification::query()->forUser($this->doctor->id)
            ->where('type', 'lab_result_ready')->count(),
    )->toBe(0);
});

// --- Read API + feed ----------------------------------------------------------

test('the feed endpoint returns the user notifications and an unread count', function () {
    makeAlert($this->clinic->id, $this->doctor->id);

    $response = $this->actingAs($this->doctor)->getJson(route('notifications.feed'));

    $response->assertOk()->assertJsonStructure(['items', 'unread']);
    expect($response->json('unread'))->toBeGreaterThan(0);
});

test('mark all read clears unread and stamps the seen-at watermark', function () {
    makeAlert($this->clinic->id, $this->doctor->id);

    $this->actingAs($this->doctor)->post(route('notifications.read-all'))->assertRedirect();

    expect(Notification::query()->forUser($this->doctor->id)->unread()->count())->toBe(0);
    expect($this->doctor->fresh()->notifications_seen_at)->not->toBeNull();
});

test('a user cannot mark another users notification read', function () {
    $other = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $alert = makeAlert($this->clinic->id, $other->id);

    $this->actingAs($this->doctor)
        ->patch(route('notifications.read', ['notification' => $alert->id]))
        ->assertNotFound();

    expect($alert->fresh()->is_read)->toBeFalse();
});

// --- Dashboard wiring ---------------------------------------------------------

test('the dashboard exposes the unread count and recent notifications', function () {
    $this->actingAs($this->doctor)
        ->get(route('doctor.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/doctor/dashboard')
            ->has('notifications.unread')
            ->has('recent_notifications'),
        );
});

test('the notifications page renders the feed', function () {
    $this->actingAs($this->doctor)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->has('items'),
        );
});
