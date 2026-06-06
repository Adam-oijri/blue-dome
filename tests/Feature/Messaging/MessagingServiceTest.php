<?php

use App\Models\Clinic;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use App\Services\Messaging\MessagingService;
use Illuminate\Support\Facades\Notification;
use Symfony\Component\HttpKernel\Exception\HttpException;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->service = app(MessagingService::class);
});

test('the clinic channel is shared by all clinic staff and gives each a participant row', function () {
    $forDoctor = $this->service->clinicChannel($this->doctor);
    $forSecretary = $this->service->clinicChannel($this->secretary);

    expect($forDoctor->id)->toBe($forSecretary->id)
        ->and($forDoctor->type)->toBe('clinic')
        ->and($forDoctor->dedupe_key)->toBe('clinic');

    expect(ConversationParticipant::query()
        ->where('conversation_id', $forDoctor->id)
        ->whereIn('user_id', [$this->doctor->id, $this->secretary->id])
        ->count())->toBe(2);
});

test('opening a direct conversation is idempotent regardless of argument order', function () {
    $a = $this->service->openDirect($this->doctor, $this->secretary);
    $b = $this->service->openDirect($this->secretary, $this->doctor);

    expect($a->id)->toBe($b->id)
        ->and($a->type)->toBe('direct');

    // Both participants exist exactly once.
    expect(ConversationParticipant::query()->where('conversation_id', $a->id)->count())->toBe(2);
});

test('opening a direct conversation rejects a user outside the clinic', function () {
    $outsider = User::factory()->doctor()->create(['clinic_id' => Clinic::factory()->create()->id]);

    expect(fn () => $this->service->openDirect($this->doctor, $outsider))
        ->toThrow(HttpException::class);
});

test('opening a direct conversation rejects yourself', function () {
    expect(fn () => $this->service->openDirect($this->doctor, $this->doctor))
        ->toThrow(HttpException::class);
});

test('opening a direct conversation rejects an inactive colleague', function () {
    $inactive = User::factory()->doctor()->create([
        'clinic_id' => $this->clinic->id,
        'is_active' => false,
    ]);

    expect(fn () => $this->service->openDirect($this->doctor, $inactive))
        ->toThrow(HttpException::class);
});

test('posting a message stores it, bumps last_message_at, and catches the sender up', function () {
    $conversation = $this->service->openDirect($this->doctor, $this->secretary);

    $message = $this->service->post($this->doctor, $conversation, 'Hello there');

    expect(Message::query()->whereKey($message->id)->exists())->toBeTrue()
        ->and($message->body)->toBe('Hello there')
        ->and($conversation->fresh()->last_message_at)->not->toBeNull();

    $senderRow = ConversationParticipant::query()
        ->where('conversation_id', $conversation->id)
        ->where('user_id', $this->doctor->id)
        ->first();

    expect($senderRow->last_read_at)->not->toBeNull();
});

test('unread excludes the senders own messages and resets on markRead', function () {
    // Doctor touches the clinic channel a minute ago (caught up then).
    $this->travelTo(now()->subMinute());
    $channel = $this->service->clinicChannel($this->doctor);
    $this->service->clinicChannel($this->secretary);
    $this->travelBack();

    // Secretary posts after the doctor's watermark.
    $this->service->post($this->secretary, $channel, 'Patient in room 2');

    expect($this->service->unreadTotal($this->doctor))->toBe(1)
        // The secretary should not see their own message as unread.
        ->and($this->service->unreadTotal($this->secretary))->toBe(0);

    $this->service->markRead($this->doctor, $channel);

    expect($this->service->unreadTotal($this->doctor))->toBe(0);
});

test('conversationsFor lists the clinic channel plus the users direct threads with a colleague title', function () {
    $dm = $this->service->openDirect($this->doctor, $this->secretary);
    $this->service->post($this->secretary, $dm, 'hi doctor');

    $list = collect($this->service->conversationsFor($this->doctor));

    expect($list)->toHaveCount(2);

    $direct = $list->firstWhere('type', 'direct');
    expect($direct['title'])->toBe(trim($this->secretary->first_name.' '.$this->secretary->last_name))
        ->and($direct['last_message'])->toBe('hi doctor')
        ->and($direct['unread'])->toBe(1);
});

// --- Super admin cross-clinic ------------------------------------------------

test('a super-admin direct conversation lives in the staff members clinic', function () {
    $admin = User::factory()->superAdmin()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);

    $fromAdmin = $this->service->openDirect($admin, $this->doctor);
    $fromDoctor = $this->service->openDirect($this->doctor, $admin);

    expect($fromAdmin->id)->toBe($fromDoctor->id)
        ->and($fromAdmin->clinic_id)->toBe($this->clinic->id);
});

test('the super admin sees the DM with no clinic channel, and the staff member sees it too', function () {
    $admin = User::factory()->superAdmin()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);
    $this->service->openDirect($admin, $this->doctor);

    $adminList = collect($this->service->conversationsFor($admin));
    expect($adminList)->toHaveCount(1)
        ->and($adminList->firstWhere('type', 'clinic'))->toBeNull()
        ->and($adminList->first()['title'])->toBe(trim($this->doctor->first_name.' '.$this->doctor->last_name));

    // The doctor sees their clinic channel + the DM with the super admin.
    $doctorTitles = collect($this->service->conversationsFor($this->doctor))->pluck('type');
    expect($doctorTitles)->toContain('clinic')->toContain('direct');
});

test('colleague lists span the super-admin boundary in both directions', function () {
    $admin = User::factory()->superAdmin()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);
    $otherClinicDoctor = User::factory()->doctor()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);

    // Super admin reaches staff in every clinic.
    $adminColleagues = $this->service->colleagues($admin)->pluck('id');
    expect($adminColleagues)->toContain($this->doctor->id)
        ->toContain($otherClinicDoctor->id);

    // Staff can reach the platform super admin ("contact support").
    $doctorColleagues = $this->service->colleagues($this->doctor)->pluck('id');
    expect($doctorColleagues)->toContain($admin->id)
        ->toContain($this->secretary->id);
});

test('the super admin can access their DM but an unrelated staff member cannot', function () {
    $admin = User::factory()->superAdmin()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);
    $dm = $this->service->openDirect($admin, $this->doctor);

    expect($this->service->canAccess($admin, $dm))->toBeTrue()
        ->and($this->service->canAccess($this->doctor, $dm))->toBeTrue()
        // The secretary in the same clinic is not a participant of this DM.
        ->and($this->service->canAccess($this->secretary, $dm))->toBeFalse();
});

test('posting to a super-admin DM emails the super admin, throttled to the first unread', function () {
    Notification::fake();

    $admin = User::factory()->superAdmin()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);
    $dm = $this->service->openDirect($admin, $this->doctor);

    $this->service->post($this->doctor, $dm, 'first ping');
    $this->service->post($this->doctor, $dm, 'second ping');

    // One email for the burst (the second arrives while the thread is unread).
    Notification::assertSentOnDemandTimes(NewMessageNotification::class, 1);
});

test('the super admin posting does not email the staff recipient', function () {
    Notification::fake();

    $admin = User::factory()->superAdmin()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);
    $dm = $this->service->openDirect($admin, $this->doctor);

    $this->service->post($admin, $dm, 'hello doctor');

    Notification::assertNothingSent();
});
