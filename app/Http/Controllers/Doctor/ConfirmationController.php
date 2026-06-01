<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Read-only list of the doctor's upcoming appointments that the patient has
 * not yet confirmed. Doctors cannot record follow-up calls (that is the
 * secretary's job per AppointmentPolicy::followUp), so this view is
 * informational only — no call-logging actions.
 */
class ConfirmationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('panels/doctor/confirmations', [
            'appointments' => Appointment::query()
                ->where('doctor_id', $user->id)
                ->where('scheduled_start', '>=', now())
                ->whereNotIn('confirmation_status', ['confirmed_by_patient', 'confirmed_by_call'])
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->with('patient:id,first_name,last_name,phone')
                ->orderBy('scheduled_start')
                ->paginate(25)
                ->withQueryString(),
        ]);
    }
}
