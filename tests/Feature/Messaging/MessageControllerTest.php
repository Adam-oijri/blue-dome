<?php

use App\Models\Clinic;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\Messaging\MessagingService;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->doctor = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
    $this->service = app(MessagingService::class);
});

test('the messages index renders with conversations, colleagues and the active thread', function () {
    $this->actingAs($this->doctor)
        ->get(route('messages.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('messages/index')
            ->has('conversations')
            ->has('colleagues')
            ->has('thread')
            ->has('active_id'),
        );
});

test('opening the index marks the active conversation read', function () {
    $this->travelTo(now()->subMinute());
    $channel = $this->service->clinicChannel($this->doctor);
    $this->travelBack();

    $this->service->post($this->secretary, $channel, 'New walk-in waiting');
    expect($this->service->unreadTotal($this->doctor->fresh()))->toBe(1);

    $this->actingAs($this->doctor)->get(route('messages.index'))->assertOk();

    expect($this->service->unreadTotal($this->doctor->fresh()))->toBe(0);
});

test('storing a message persists it and redirects back', function () {
    $conversation = $this->service->openDirect($this->doctor, $this->secretary);

    $this->actingAs($this->doctor)
        ->from(route('messages.index', ['conversation' => $conversation->id]))
        ->post(route('messages.store'), [
            'conversation_id' => $conversation->id,
            'body' => 'Can you confirm the 3pm?',
        ])
        ->assertRedirect();

    expect(Message::query()
        ->where('conversation_id', $conversation->id)
        ->where('sender_id', $this->doctor->id)
        ->where('body', 'Can you confirm the 3pm?')
        ->exists())->toBeTrue();
});

test('storing an empty message is rejected', function () {
    $conversation = $this->service->clinicChannel($this->doctor);

    $this->actingAs($this->doctor)
        ->from(route('messages.index'))
        ->post(route('messages.store'), [
            'conversation_id' => $conversation->id,
            'body' => '',
        ])
        ->assertSessionHasErrors('body');
});

test('a user cannot post into another clinics conversation', function () {
    $otherClinic = Clinic::factory()->create();
    $otherDoctor = User::factory()->doctor()->create(['clinic_id' => $otherClinic->id]);
    $foreign = $this->service->clinicChannel($otherDoctor);

    $this->actingAs($this->doctor)
        ->post(route('messages.store'), [
            'conversation_id' => $foreign->id,
            'body' => 'leaking',
        ])
        ->assertForbidden();

    expect(Message::query()->where('conversation_id', $foreign->id)->count())->toBe(0);
});

test('a user cannot post into a same-clinic direct thread they are not part of', function () {
    $colleague = User::factory()->doctor()->create(['clinic_id' => $this->clinic->id]);
    $privateDm = $this->service->openDirect($this->secretary, $colleague);

    $this->actingAs($this->doctor)
        ->post(route('messages.store'), [
            'conversation_id' => $privateDm->id,
            'body' => 'eavesdrop',
        ])
        ->assertForbidden();
});

test('the poll endpoint returns only messages after the given id', function () {
    $conversation = $this->service->openDirect($this->doctor, $this->secretary);
    $first = $this->service->post($this->secretary, $conversation, 'first');
    $second = $this->service->post($this->secretary, $conversation, 'second');

    $response = $this->actingAs($this->doctor)
        ->getJson(route('messages.poll', [
            'conversation' => $conversation->id,
            'after' => $first->id,
        ]));

    $response->assertOk()->assertJsonStructure(['messages', 'conversations', 'unread']);

    $bodies = collect($response->json('messages'))->pluck('body');
    expect($bodies)->toContain('second')
        ->and($bodies)->not->toContain('first');
});

test('polling a foreign conversation is forbidden', function () {
    $otherClinic = Clinic::factory()->create();
    $otherDoctor = User::factory()->doctor()->create(['clinic_id' => $otherClinic->id]);
    $foreign = $this->service->clinicChannel($otherDoctor);

    $this->actingAs($this->doctor)
        ->getJson(route('messages.poll', ['conversation' => $foreign->id]))
        ->assertForbidden();
});

test('starting a conversation opens a direct thread and redirects to it', function () {
    $this->actingAs($this->doctor)
        ->post(route('messages.start'), ['user_id' => $this->secretary->id])
        ->assertRedirect();

    $dm = Conversation::query()->where('type', 'direct')->first();

    expect($dm)->not->toBeNull()
        ->and($dm->participants()->count())->toBe(2);
});

test('the shared messages badge prop is present for clinic staff', function () {
    $this->actingAs($this->doctor)
        ->get(route('doctor.dashboard'))
        ->assertInertia(fn ($page) => $page->has('messages.unread'));

    $this->actingAs($this->secretary)
        ->get(route('secretary.dashboard'))
        ->assertInertia(fn ($page) => $page->has('messages.unread'));
});

test('the shared messages badge prop is present for a super admin', function () {
    $platform = Clinic::factory()->create();
    $admin = User::factory()->superAdmin()->create(['clinic_id' => $platform->id]);

    $this->actingAs($admin)
        ->get(route('super-admin.dashboard'))
        ->assertInertia(fn ($page) => $page->has('messages.unread'));
});

test('a super admin can reach the staff messages page', function () {
    $platform = Clinic::factory()->create();
    $admin = User::factory()->superAdmin()->create(['clinic_id' => $platform->id]);

    $this->actingAs($admin)
        ->get(route('messages.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('messages/index'));
});

test('the read endpoint clears unread for a conversation', function () {
    $this->travelTo(now()->subMinute());
    $channel = $this->service->clinicChannel($this->doctor);
    $this->travelBack();

    $this->service->post($this->secretary, $channel, 'paging you');
    expect($this->service->unreadTotal($this->doctor->fresh()))->toBe(1);

    $this->actingAs($this->doctor)
        ->from(route('messages.index'))
        ->post(route('messages.read', ['conversation' => $channel->id]))
        ->assertRedirect();

    expect($this->service->unreadTotal($this->doctor->fresh()))->toBe(0);
});

test('a user cannot mark a foreign conversation read', function () {
    $otherClinic = Clinic::factory()->create();
    $otherDoctor = User::factory()->doctor()->create(['clinic_id' => $otherClinic->id]);
    $foreign = $this->service->clinicChannel($otherDoctor);

    $this->actingAs($this->doctor)
        ->post(route('messages.read', ['conversation' => $foreign->id]))
        ->assertForbidden();
});

test('a super admin can start a direct conversation with a doctor in any clinic', function () {
    $admin = User::factory()->superAdmin()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);

    $this->actingAs($admin)
        ->post(route('messages.start'), ['user_id' => $this->doctor->id])
        ->assertRedirect();

    // The DM lives in the doctor's clinic so the doctor sees it under RLS.
    $dm = Conversation::query()->where('type', 'direct')->first();
    expect($dm)->not->toBeNull()
        ->and($dm->clinic_id)->toBe($this->clinic->id)
        ->and($dm->participants()->count())->toBe(2);
});

test('a doctor cannot access a super-admin DM with a different clinics doctor', function () {
    $admin = User::factory()->superAdmin()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);
    $otherDoctor = User::factory()->doctor()->create([
        'clinic_id' => Clinic::factory()->create()->id,
    ]);
    $dm = $this->service->openDirect($admin, $otherDoctor);

    $this->actingAs($this->doctor)
        ->getJson(route('messages.poll', ['conversation' => $dm->id]))
        ->assertForbidden();
});

test('the messages page renders for a secretary too', function () {
    $this->actingAs($this->secretary)
        ->get(route('messages.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('messages/index'));
});
