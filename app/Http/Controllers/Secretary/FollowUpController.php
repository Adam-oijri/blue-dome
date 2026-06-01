<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary follow-up call queue — clinic-scoped appointments flagged for a
 * follow-up call that has not yet been completed, newest first.
 */
class FollowUpController extends Controller
{
    private const HIGH_PRIORITY = ['high', 'emergency'];

    public function index(Request $request): Response
    {
        $clinicId = $request->user()->clinic_id;

        $pending = fn () => Appointment::query()
            ->where('clinic_id', $clinicId)
            ->where('needs_follow_up_call', true)
            ->where(function ($query): void {
                $query->whereNull('follow_up_call_status')
                    ->orWhereNotIn('follow_up_call_status', ['completed']);
            });

        return Inertia::render('secretary/follow-up', [
            'follow_ups' => $pending()
                ->with('patient:id,first_name,last_name,phone,gender')
                ->orderByDesc('scheduled_start')
                ->paginate(25)
                ->withQueryString()
                ->through(fn (Appointment $appointment): array => [
                    'id' => $appointment->id,
                    'patient' => $appointment->patient,
                    'reason' => $appointment->reason ?? $appointment->follow_up_notes,
                    'priority' => $appointment->priority,
                    'status' => $appointment->follow_up_call_status ?? 'pending',
                    'attempts' => $appointment->follow_up_call_attempts,
                    'last_attempt_at' => $appointment->last_follow_up_attempt_at,
                ]),
            'kpis' => [
                'due' => $pending()->count(),
                'high_priority' => $pending()->whereIn('priority', self::HIGH_PRIORITY)->count(),
                'reached_today' => Appointment::query()
                    ->where('clinic_id', $clinicId)
                    ->where('follow_up_call_status', 'completed')
                    ->whereDate('follow_up_call_at', CarbonImmutable::today())
                    ->count(),
            ],
        ]);
    }
}
