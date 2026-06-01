<?php

use App\Models\Clinic;
use App\Models\MessageLog;
use App\Models\MessageTemplate;
use App\Models\User;

beforeEach(function () {
    $this->clinic = Clinic::factory()->create();
    $this->secretary = User::factory()->secretary()->create(['clinic_id' => $this->clinic->id]);
});

it('renders the secretary whatsapp page with messages and templates', function () {
    MessageLog::factory()->count(2)->create([
        'clinic_id' => $this->clinic->id,
        'message_type' => 'whatsapp',
    ]);
    MessageTemplate::factory()->create([
        'clinic_id' => $this->clinic->id,
        'template_type' => 'whatsapp',
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.whatsapp'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('panels/secretary/whatsapp')
            ->has('messages', 2)
            ->has('templates', 1)
            ->has('kpis')
        );
});

it('excludes non-whatsapp messages and templates', function () {
    MessageLog::factory()->create([
        'clinic_id' => $this->clinic->id,
        'message_type' => 'sms',
    ]);
    MessageTemplate::factory()->create([
        'clinic_id' => $this->clinic->id,
        'template_type' => 'email',
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.whatsapp'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('messages', 0)
            ->has('templates', 0)
        );
});

it('scopes whatsapp data to the secretary clinic', function () {
    $otherClinic = Clinic::factory()->create();
    MessageLog::factory()->create([
        'clinic_id' => $otherClinic->id,
        'message_type' => 'whatsapp',
    ]);
    MessageTemplate::factory()->create([
        'clinic_id' => $otherClinic->id,
        'template_type' => 'whatsapp',
    ]);

    $this->actingAs($this->secretary)
        ->get(route('secretary.whatsapp'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('messages', 0)
            ->has('templates', 0)
        );
});
