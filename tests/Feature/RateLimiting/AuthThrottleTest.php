<?php

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

beforeEach(function () {
    RateLimiter::clear('login');
});

it('returns 429 after 5 failed login attempts in the same minute', function () {
    $clinic = Clinic::factory()->create();
    User::factory()->secretary()->create([
        'clinic_id' => $clinic->id,
        'email' => 'throttle@example.test',
        'password_hash' => Hash::make('correct-password'),
    ]);

    for ($i = 0; $i < 5; $i++) {
        $this->post('/ma-fr/login', [
            'email' => 'throttle@example.test',
            'password' => 'wrong-password',
        ])->assertStatus(302); // Fortify redirects on failure with session errors
    }

    $this->post('/ma-fr/login', [
        'email' => 'throttle@example.test',
        'password' => 'wrong-password',
    ])->assertStatus(429);
});
